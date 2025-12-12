// common/models/broker-connection/services/orders.service.js
const axios = require("axios");
const cache = require("../../util/cache");

// Auto-detect environment
const DHAN_ENV = process.env.DHAN_ENV || "production";
const isSandbox = DHAN_ENV === "sandbox";
const BASE_API_URL = isSandbox
    ? "https://sandbox-api.dhan.co/v2"
    : "https://api.dhan.co/v2";

console.log(`Dhan Orders Service → Using ${isSandbox ? "SANDBOX" : "PRODUCTION"}: ${BASE_API_URL}`);

module.exports = function (BrokerConnection) {

    // Reusable Dhan API client
    const dhanApi = (accessToken) => axios.create({
        baseURL: BASE_API_URL,
        headers: {
            "access-token": accessToken,
            "Accept": "application/json",
        },
        timeout: 15000,
    });

    // Helper to safely fetch with fallback
    const safeGet = async (client, endpoint, params = {}) => {
        try {
            const res = await client.get(endpoint, { params });
            return res.data || [];
        } catch (err) {
            console.warn(`Dhan API ${endpoint} failed:`, err.response?.data?.error || err.message);
            return [];
        }
    };

    // ===================================================================
    // 1. Today's PnL (Realized + Unrealized)
    // ===================================================================
    BrokerConnection.getTodayPnL = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);
        const today = new Date().toISOString().split("T")[0];

        try {
            const [orders, positions] = await Promise.all([
                safeGet(client, "/orders", { fromDate: today, toDate: today }),
                safeGet(client, "/positions"),
            ]);

            // Realized P&L from completed trades today
            let realizedPL = 0;
            if (Array.isArray(orders)) {
                realizedPL = orders
                    .filter((o) => o.orderStatus === "TRADE" || o.orderStatus === "COMPLETE")
                    .reduce((sum, o) => {
                        const value = o.transactionType === "BUY"
                            ? -(o.price * o.quantity)
                            : o.price * o.quantity;
                        return sum + value;
                    }, 0);
            }

            // Unrealized P&L from open positions (MTM)
            let unrealizedPL = 0;
            if (Array.isArray(positions)) {
                positions.forEach((p) => {
                    const qty = Number(p.netQty || 0);
                    if (qty === 0) return;
                    const ltp = Number(p.ltp || 0);
                    const cost = Number(p.buyAvg || p.costPrice || 0);
                    unrealizedPL += qty * (ltp - cost);
                });
            }

            const totalPL = realizedPL + unrealizedPL;

            return {
                todayRealisedPL: Number(realizedPL.toFixed(2)),
                todayUnrealisedPL: Number(unrealizedPL.toFixed(2)),
                todayTotalPL: Number(totalPL.toFixed(2)),
                date: today,
                environment: isSandbox ? "sandbox" : "production",
            };
        } catch (err) {
            console.error("getTodayPnL error:", err.message);
            return {
                todayRealisedPL: 0,
                todayUnrealisedPL: 0,
                todayTotalPL: 0,
                date: today,
            };
        }
    };

    // ===================================================================
    // 2. Trade History (Paginated)
    // ===================================================================
    BrokerConnection.getTradeHistory = async function (req, data = {}) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const { fromDate = "2024-01-01", toDate, page = 0 } = data;
        const to = toDate || new Date().toISOString().split("T")[0];

        const cacheKey = `dhan:trades:${userId}:${fromDate}:${to}:${page}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        try {
            const trades = await safeGet(client, `/trades/${fromDate}/${to}/${page}`);
            await cache.set(cacheKey, trades, 60); // 1 min cache
            return trades;
        } catch (err) {
            console.error("getTradeHistory error:", err.message);
            return [];
        }
    };

    // ===================================================================
    // 3. Order History by Symbol
    // ===================================================================
    BrokerConnection.orderHistory = async function (req) {
        const symbol = req.query.symbol?.trim();
        if (!symbol) throw new Error("Missing 'symbol' parameter");

        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
        const toDate = new Date().toISOString().split("T")[0];

        try {
            const orders = await safeGet(client, "/orders", { fromDate, toDate });

            const trades = orders
                .filter(
                    (o) =>
                        o.tradingSymbol === symbol &&
                        (o.orderStatus === "TRADE" || o.orderStatus === "COMPLETE") &&
                        o.price > 0
                )
                .map((o) => ({
                    date: new Date(o.orderDateTime || o.exchangeTime)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }),
                    action: o.transactionType,
                    price: Number(o.price).toFixed(2),
                    qty: o.quantity,
                    amount: (Number(o.price) * o.quantity).toFixed(2),
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            return trades;
        } catch (err) {
            console.error("orderHistory error:", err.message);
            throw new Error("Failed to fetch order history");
        }
    };

    // ===================================================================
    // 4. Full Trade Book (with pagination support)
    // ===================================================================
    BrokerConnection.getTradeBook = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const from = req.query.from || "2024-01-01";
        const to = req.query.to || new Date().toISOString().split("T")[0];
        const page = parseInt(req.query.page) || 0;

        const cacheKey = `dhan:tradebook:${userId}:${from}:${to}:${page}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        try {
            const trades = await safeGet(client, `/trades/${from}/${to}/${page}`);

            const formatted = (trades || []).map((t) => ({
                ...t,
                _id: `${t.tradeId || t.orderId}-${t.tradedPrice}-${t.tradedQuantity}`,
                date: new Date(t.exchangeTime).toISOString(),
            }));

            const result = {
                trades: formatted,
                hasMore: formatted.length === 50,
                page,
                from,
                to,
            };

            await cache.set(cacheKey, result, 60);
            return result;
        } catch (err) {
            console.error("getTradeBook error:", err.message);
            return { trades: [], hasMore: false, page, from, to };
        }
    };

    // ===================================================================
    // 5. Trade History by Security ID (for Tax/FY reports)
    // ===================================================================
    BrokerConnection.orderHistoryBySecurity = async function (req) {
        const securityId = req.query.securityId?.trim();
        const fy = req.query.fy?.trim(); // e.g., "FY 2024"

        if (!securityId) throw new Error("Missing 'securityId' parameter");

        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        // Determine FY range
        let startYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
        if (fy && fy.match(/FY\s?(\d{4})/i)) {
            startYear = parseInt(fy.match(/FY\s?(\d{4})/i)[1]);
        }

        const fromDate = `${startYear}-04-01`;
        const toDate = new Date(`${startYear + 1}-03-31`) > new Date()
            ? new Date().toISOString().split("T")[0]
            : `${startYear + 1}-03-31`;

        let allTrades = [];
        let page = 0;

        try {
            while (true) {
                const trades = await safeGet(client, `/trades/${fromDate}/${toDate}/${page}`);
                if (!trades || trades.length === 0) break;

                const filtered = trades.filter(
                    (t) =>
                        String(t.securityId) === securityId &&
                        t.tradedQuantity > 0 &&
                        t.tradedPrice > 0
                );

                allTrades.push(...filtered);
                if (trades.length < 50) break; // no more pages
                page++;
            }

            const formatted = allTrades
                .map((t) => ({
                    date: new Date(t.exchangeTime).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }),
                    action: t.transactionType,
                    price: Number(t.tradedPrice).toFixed(2),
                    qty: t.tradedQuantity,
                    amount: (Number(t.tradedPrice) * t.tradedQuantity).toFixed(2),
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            return formatted;
        } catch (err) {
            console.error("orderHistoryBySecurity error:", err.message);
            throw new Error("Failed to fetch trades by security");
        }
    };

    // ===================================================================
    // Remote Methods Registration
    // ===================================================================
    BrokerConnection.remoteMethod("getTodayPnL", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/today-pnl", verb: "get" },
    });

    BrokerConnection.remoteMethod("getTradeHistory", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "query" } },
        ],
        returns: { root: true },
        http: { path: "/trade-history", verb: "get" },
    });

    BrokerConnection.remoteMethod("orderHistory", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/order-history", verb: "get" },
    });

    BrokerConnection.remoteMethod("getTradeBook", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/tradebook", verb: "get" },
    });

    BrokerConnection.remoteMethod("orderHistoryBySecurity", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { type: "array", root: true },
        http: { path: "/order-history-by-security", verb: "get" },
    });
};