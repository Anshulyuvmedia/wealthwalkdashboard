// /server/boot/dhan-livefeed.js
const WebSocket = require('ws');

module.exports = async function (server) {
    console.log("🚀 Dhan Live Prices boot script loaded (v2 with retries & error handling - Dec 2025)");

    const BrokerConnection = server.models.BrokerConnection;
    const DhanInstrument = server.models.DhanInstrument;

    // In-memory cache: userId-securityId -> { ltp, time }
    const livePricesUser = new Map();
    const userWSMap = new Map(); // userId -> { ws, subscribedIds: Set, reconnectAttempts, backoffTimer }

    // Max reconnection attempts before giving up temporarily
    const MAX_RECONNECT_ATTEMPTS = 10;
    const INITIAL_BACKOFF_MS = 2000; // 2 seconds
    const MAX_BACKOFF_MS = 60000;   // 60 seconds

    // Parse binary ticker packet (LTP mode)
    const parseTicker = (buffer) => {
        if (!(buffer instanceof Buffer) || buffer.length < 17) return null;

        try {
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            const feedCode = buffer[1];

            if (feedCode !== 2) return null; // Not a ticker packet

            const securityId = view.getInt32(5, true); // little-endian
            const ltp = view.getFloat32(9, true);
            const lttSeconds = view.getInt32(13, true);

            return {
                securityId: String(securityId),
                ltp: Number(ltp.toFixed(2)),
                time: new Date(lttSeconds * 1000)
            };
        } catch (err) {
            console.warn("⚠️ Failed to parse binary tick:", err);
            return null;
        }
    };

    // Subscribe in chunks of 100
    const subscribeInstruments = (ws, securityIds) => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !securityIds.length) return;

        const chunks = [];
        for (let i = 0; i < securityIds.length; i += 100) {
            chunks.push(securityIds.slice(i, i + 100));
        }

        chunks.forEach(chunk => {
            const instruments = chunk.map(id => ({
                ExchangeSegment: "NSE_EQ", // Extend later for FNO, BSE, etc.
                SecurityId: String(id)
            }));

            const payload = {
                RequestCode: 15,
                InstrumentCount: instruments.length,
                InstrumentList: instruments
            };

            try {
                ws.send(JSON.stringify(payload));
                console.log(`🟢 Sent subscription for ${instruments.length} instruments`);
            } catch (err) {
                console.error("❌ Failed to send subscription:", err);
            }
        });
    };

    // Core: Initialize or reconnect WebSocket for a user
    const connectUserWS = async (userId, accessToken, clientId, securityIds = []) => {
        if (!accessToken || !clientId || !securityIds.length) {
            console.warn(`⚠️ Cannot connect WS for user ${userId}: missing credentials or instruments`);
            return;
        }

        // Clean up any existing connection
        const existing = userWSMap.get(userId);
        if (existing?.ws) {
            existing.ws.removeAllListeners();
            if (existing.ws.readyState === WebSocket.OPEN || existing.ws.readyState === WebSocket.CONNECTING) {
                existing.ws.close(1000, "Reconnecting");
            }
        }

        const url = `wss://api-feed.dhan.co?version=2&token=${accessToken}&clientId=${clientId}&authType=2`;
        const ws = new WebSocket(url);

        let reconnectAttempts = 0;
        let backoffTimer = null;

        const subscribedIds = new Set(securityIds.map(String).slice(0, 5000)); // Dhan limit

        const attemptReconnect = () => {
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.error(`❌ Max reconnect attempts reached for user ${userId}. Giving up for now.`);
                userWSMap.delete(userId);
                // Optionally: notify frontend via Socket.IO or cleanup cache
                return;
            }

            reconnectAttempts++;
            const delay = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, reconnectAttempts - 1), MAX_BACKOFF_MS);

            console.warn(`⚠️ Reconnecting WS for user ${userId} in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

            clearTimeout(backoffTimer);
            backoffTimer = setTimeout(() => {
                connectUserWS(userId, accessToken, clientId, Array.from(subscribedIds));
            }, delay);
        };

        ws.on('open', () => {
            console.log(`✅ Dhan WebSocket connected for user ${userId}`);
            reconnectAttempts = 0; // Reset on success
            clearTimeout(backoffTimer);

            subscribeInstruments(ws, Array.from(subscribedIds));
        });

        ws.on('message', (data) => {
            const tick = parseTicker(data);
            if (tick && subscribedIds.has(tick.securityId)) {
                livePricesUser.set(`${userId}-${tick.securityId}`, {
                    ltp: tick.ltp,
                    time: tick.time
                });
            }
        });

        ws.on('close', (code, reason) => {
            console.warn(`⚠️ Dhan WS closed for user ${userId} | Code: ${code} | Reason: ${reason.toString()}`);

            // Clean partial cache
            for (const id of subscribedIds) {
                livePricesUser.delete(`${userId}-${id}`);
            }

            // Only reconnect on abnormal closures
            if (code !== 1000) { // 1000 = intentional close
                attemptReconnect();
            } else {
                userWSMap.delete(userId);
            }
        });

        ws.on('error', (err) => {
            console.error(`❌ Dhan WS error for user ${userId}:`, err.message || err);

            // Network errors, auth issues → trigger reconnect
            attemptReconnect();
        });

        ws.on('ping', () => ws.pong()); // Keep-alive

        // Store connection state
        userWSMap.set(userId, {
            ws,
            subscribedIds,
            reconnectAttempts: () => reconnectAttempts,
            backoffTimer
        });
    };

    // Public method: Initialize subscription for a user
    DhanInstrument.initUserSubscription = async (userId) => {
        try {
            const conn = await BrokerConnection.findOne({ where: { userId, broker: 'dhan' } });
            if (!conn || !conn.accessToken || !conn.clientId) {
                return { success: false, error: "No valid Dhan connection found" };
            }

            // Fetch user's portfolio instruments
            const portfolio = await DhanInstrument.find({ /* your query for user's watchlist/portfolio */ });
            const securityIds = portfolio
                .map(i => i.securityId)
                .filter(Boolean);

            if (!securityIds.length) {
                return { success: false, error: "No instruments in portfolio" };
            }

            await connectUserWS(userId, conn.accessToken, conn.clientId, securityIds);

            return {
                success: true,
                subscribedCount: securityIds.length,
                message: "Live feed started with reconnection logic"
            };
        } catch (err) {
            console.error(`❌ Failed to init subscription for user ${userId}:`, err);
            return { success: false, error: err.message || "Initialization failed" };
        }
    };

    // Optional: Force reconnect for a user (e.g., after token refresh)
    DhanInstrument.reconnectUserFeed = async (userId) => {
        const state = userWSMap.get(userId);
        if (state?.backoffTimer) clearTimeout(state.backoffTimer);
        userWSMap.delete(userId);

        // Re-fetch latest token & instruments
        return await DhanInstrument.initUserSubscription(userId);
    };

    // Live price getters (unchanged, just safer)
    DhanInstrument.livePriceUser = (userId, securityId) => {
        return livePricesUser.get(`${userId}-${securityId}`) || null;
    };

    DhanInstrument.bulkLivePricesUser = (userId) => {
        const prefix = `${userId}-`;
        const result = [];
        for (const [key, value] of livePricesUser.entries()) {
            if (key.startsWith(prefix)) {
                result.push({ securityId: key.slice(prefix.length), ...value });
            }
        }
        return result;
    };

    // Remote methods remain the same
    DhanInstrument.remoteMethod('initUserSubscription', {
        accepts: [{ arg: 'userId', type: 'string', required: true }],
        returns: { arg: 'data', type: 'object', root: true },
        http: { path: '/user/:userId/init-subscription', verb: 'post' }
    });

    DhanInstrument.remoteMethod('livePriceUser', {
        accepts: [
            { arg: 'userId', type: 'string', required: true },
            { arg: 'securityId', type: 'string', required: true }
        ],
        returns: { arg: 'data', type: 'object', root: true },
        http: { path: '/live-price/user/:userId/:securityId', verb: 'get' }
    });

    DhanInstrument.remoteMethod('bulkLivePricesUser', {
        accepts: [{ arg: 'userId', type: 'string', required: true }],
        returns: { arg: 'data', type: 'array', root: true },
        http: { path: '/live-prices/user/:userId', verb: 'get' }
    });

    console.log("✅ Dhan Live Feed ready: Robust, reconnecting, binary-parsing (v2 compliant)");
};