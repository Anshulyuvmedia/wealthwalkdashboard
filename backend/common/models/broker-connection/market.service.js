// common/models/broker-connection/services/market.service.js
const axios = require("axios");
const cache = require("../../util/cache");
const WebSocket = require("ws");

// Auto-detect environment
const DHAN_ENV = process.env.DHAN_ENV || "production";
const isSandbox = DHAN_ENV === "sandbox";

const API_BASE = isSandbox
    ? "https://sandbox-api.dhan.co/v2"
    : "https://api.dhan.co/v2";

const WS_BASE = isSandbox
    ? "wss://sandbox-feed.dhan.co"
    : "wss://api-feed.dhan.co";

console.log(`Dhan Market Service → Using ${isSandbox ? "SANDBOX" : "PRODUCTION"} | API: ${API_BASE} | WS: ${WS_BASE}`);

module.exports = function (BrokerConnection) {
    const activeSockets = new Map();

    // Reusable Dhan HTTP client
    const dhanHttp = (accessToken) =>
        axios.create({
            baseURL: API_BASE,
            headers: {
                "access-token": accessToken,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            timeout: 12000,
        });

    // ===================================================================
    // CACHED LTP (Single Security)
    // ===================================================================
    const getCachedLTP = async (record, securityId) => {
        const idStr = String(securityId).trim();
        const cacheKey = `dhan:ltp:${idStr}`;
        const cached = await cache.get(cacheKey);
        if (cached) return { ...cached, fromCache: true };

        // Simple lock to prevent duplicate API calls
        if (!global.__ltpLocks) global.__ltpLocks = new Map();
        if (global.__ltpLocks.has(cacheKey)) {
            return new Promise((resolve) => {
                const check = setInterval(async () => {
                    const fresh = await cache.get(cacheKey);
                    if (fresh) {
                        clearInterval(check);
                        resolve({ ...fresh, fromCache: true });
                    }
                }, 50);
            });
        }

        global.__ltpLocks.set(cacheKey, true);
        try {
            const payload = {
                symbols: [{ securityId: idStr, exchangeSegment: "NSE_EQ" }],
            };

            const res = await axios.post(`${API_BASE}/marketfeed/ltp`, payload, {
                headers: { "access-token": record.accessToken },
            });

            const raw = res.data;
            const key = Object.keys(raw)[0];
            if (!key) throw new Error("Empty LTP response");

            const [exchange, secId] = key.split(":");
            const quote = raw[key];

            const ltpData = {
                securityId: secId,
                ltp: Number(quote.ltp) || 0,
                change: Number(quote.change) || 0,
                changePercent: Number(quote.changePercent) || 0,
                updatedAt: new Date().toISOString(),
            };

            await cache.set(cacheKey, ltpData, 2); // 2 sec cache
            return ltpData;
        } catch (err) {
            console.error("LTP fetch failed:", err.response?.data || err.message);
            throw err;
        } finally {
            global.__ltpLocks.delete(cacheKey);
        }
    };

    BrokerConnection.getLTP = async function (req, securityId) {
        if (!securityId?.trim()) throw new Error("securityId is required");

        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        return await getCachedLTP(record, securityId);
    };

    // ===================================================================
    // Multi LTP (Bulk Quotes)
    // ===================================================================
    BrokerConnection.getMarketQuotes = async function (req, securityIds = []) {
        if (!Array.isArray(securityIds) || securityIds.length === 0) {
            return {};
        }

        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const ids = [...new Set(securityIds.map(String).map(s => s.trim()).filter(Boolean))];
        const cacheKey = `dhan:multi_ltp:${ids.sort().join(",")}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await BrokerConnection.getDhanRecord(userId);

        try {
            const payload = {
                symbols: ids.map(id => ({ securityId: id, exchangeSegment: "NSE_EQ" })),
            };

            const res = await axios.post(`${API_BASE}/marketfeed/ltp`, payload, {
                headers: { "access-token": record.accessToken },
            });

            const raw = res.data || {};
            const quotes = {};

            Object.entries(raw).forEach(([key, quote]) => {
                const secId = key.split(":")[1];
                if (!secId) return;
                quotes[secId] = {
                    ltp: Number(quote.ltp) || 0,
                    change: Number(quote.change) || 0,
                    changePercent: Number(quote.changePercent) || 0,
                };
            });

            await cache.set(cacheKey, quotes, 2);
            return quotes;
        } catch (err) {
            console.error("getMarketQuotes error:", err.response?.data || err.message);
            throw new Error("Failed to fetch market quotes");
        }
    };

    // ===================================================================
    // All Live Quotes from Holdings + Positions
    // ===================================================================
    BrokerConnection.getAllLiveQuotes = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanHttp(record.accessToken);

        try {
            const [holdings, positions] = await Promise.all([
                client.get("/holdings").catch(() => ({ data: [] })),
                client.get("/positions").catch(() => ({ data: [] })),
            ]);

            const items = [...(holdings.data || []), ...(positions.data || [])];
            const uniqueIds = [...new Set(items.map(i => i.securityId || i.isin).filter(Boolean))];

            if (uniqueIds.length === 0) return {};

            return await BrokerConnection.getMarketQuotes(req, uniqueIds);
        } catch (err) {
            console.error("getAllLiveQuotes error:", err.message);
            throw new Error("Failed to fetch live quotes");
        }
    };

    // ===================================================================
    // Live WebSocket Feed (Real-time Updates)
    // ===================================================================
    BrokerConnection.startLiveFeed = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        if (!record.accessToken || !record.clientId) {
            throw new Error("Dhan not linked: missing accessToken or clientId");
        }

        if (activeSockets.has(userId)) {
            return { status: "already_running", userId };
        }

        const wsUrl = `${WS_BASE}?version=2&token=${encodeURIComponent(record.accessToken)}&clientId=${record.clientId}&authType=2`;
        const ws = new WebSocket(wsUrl);
        const connection = { ws, subscribed: new Set() };
        activeSockets.set(userId, connection);

        ws.on("open", () => {
            console.log(`Dhan WS CONNECTED → user:${userId} | client:${record.clientId}`);
            BrokerConnection.app.io.to(`user_${userId}`).emit("market", { type: "CONNECTED" });
        });

        ws.on("message", (data) => {
            try {
                // Handle control messages from frontend
                if (typeof data === "string") {
                    let msg;
                    try { msg = JSON.parse(data); } catch { return; }

                    if (msg.type === "SUBSCRIBE" && Array.isArray(msg.symbols)) {
                        const toSub = [...new Set(msg.symbols.map(String))].filter(id => !connection.subscribed.has(id));
                        if (toSub.length === 0) return;

                        // Dhan allows max 100 instruments per packet
                        const chunks = [];
                        for (let i = 0; i < toSub.length; i += 100) {
                            chunks.push(toSub.slice(i, i + 100));
                        }

                        chunks.forEach(chunk => {
                            ws.send(JSON.stringify({
                                RequestCode: 15,
                                InstrumentCount: chunk.length,
                                InstrumentList: chunk.map(id => ({
                                    ExchangeSegment: "NSE_EQ",
                                    SecurityId: id,
                                })),
                            }));
                        });

                        toSub.forEach(id => connection.subscribed.add(id));
                        return;
                    }

                    if (msg.type === "UNSUBSCRIBE" && Array.isArray(msg.symbols)) {
                        msg.symbols.forEach(id => connection.subscribed.delete(String(id)));
                        return;
                    }
                    return;
                }

                // Binary market data
                const buffer = Buffer.from(data);
                if (buffer.length < 8) return;

                const responseCode = buffer.readUInt8(0);
                const messageLength = buffer.readUInt16LE(1);
                const securityId = buffer.readUInt32LE(4).toString();
                const payload = buffer.slice(8, 8 + messageLength);

                let quote = null;

                switch (responseCode) {
                    case 2: // Ticker
                        if (payload.length >= 8) {
                            quote = {
                                type: "ticker",
                                securityId,
                                ltp: payload.readFloatLE(0),
                                ltt: new Date(payload.readUInt32LE(4) * 1000).toISOString(),
                            };
                        }
                        break;

                    case 4: // Full Quote
                        if (payload.length >= 46) {
                            quote = {
                                type: "quote",
                                securityId,
                                ltp: payload.readFloatLE(0),
                                ltq: payload.readUInt16LE(4),
                                atp: payload.readFloatLE(10),
                                volume: payload.readUInt32LE(14),
                                totalBuyQty: payload.readUInt32LE(22),
                                totalSellQty: payload.readUInt32LE(18),
                                dayOpen: payload.readFloatLE(26),
                                dayHigh: payload.readFloatLE(30),
                                dayLow: payload.readFloatLE(34),
                                dayClose: payload.readFloatLE(38),
                            };
                        }
                        break;

                    case 8: // Market Depth
                        quote = { type: "depth", securityId, depth: true };
                        break;

                    case 50: // Disconnected by server
                        console.log(`Dhan server closed WS for user ${userId}`);
                        ws.close();
                        return;

                    default:
                        return;
                }

                if (quote && connection.subscribed.has(securityId)) {
                    BrokerConnection.app.io.to(`user_${userId}`).emit("market", {
                        type: "LIVE_QUOTE",
                        data: quote,
                    });
                }
            } catch (err) {
                console.error("WS parse error:", err.message);
            }
        });

        ws.on("close", (code) => {
            console.log(`Dhan WS CLOSED → user:${userId} | code:${code}`);
            activeSockets.delete(userId);
            BrokerConnection.app.io.to(`user_${userId}`).emit("market", { type: "DISCONNECTED" });
        });

        ws.on("error", (err) => {
            console.error(`Dhan WS ERROR → user:${userId}`, err.message);
            activeSockets.delete(userId);
            BrokerConnection.app.io.to(`user_${userId}`).emit("market", { type: "ERROR", error: err.message });
        });

        return { status: "connected", userId, environment: isSandbox ? "sandbox" : "production" };
    };

    // ===================================================================
    // Remote Methods
    // ===================================================================
    BrokerConnection.remoteMethod("getLTP", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "securityId", type: "string", source: "query", required: true },
        ],
        returns: { root: true },
        http: { path: "/ltp", verb: "get" },
    });

    BrokerConnection.remoteMethod("getMarketQuotes", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "securityIds", type: "array", http: { source: "body" } },
        ],
        returns: { root: true },
        http: { path: "/market-quotes", verb: "post" },
    });

    BrokerConnection.remoteMethod("getAllLiveQuotes", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/all-live-quotes", verb: "get" },
    });

    BrokerConnection.remoteMethod("startLiveFeed", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/start-live-feed", verb: "post" },
    });
};