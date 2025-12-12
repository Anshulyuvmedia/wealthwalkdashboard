// common/models/broker-connection/services/portfolio.service.js
const axios = require("axios");
const cache = require("../../util/cache");

// Detect environment once at load time
const DHAN_ENV = process.env.DHAN_ENV || "production";
const isSandbox = DHAN_ENV === "sandbox";

const BASE_API_URL = isSandbox
    ? "https://sandbox-api.dhan.co/v2"
    : "https://api.dhan.co/v2";

console.log(`Dhan Portfolio Service → Using ${isSandbox ? "SANDBOX" : "PRODUCTION"} API: ${BASE_API_URL}`);

module.exports = function (BrokerConnection) {
    console.log('BASE_API_URL', BASE_API_URL);
    // Reusable axios instance with correct base URL and headers
    const dhanApi = (accessToken) => axios.create({
        baseURL: BASE_API_URL,
        headers: {
            "access-token": accessToken,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        timeout: 15000,
    });

    // Helper to fetch with automatic sandbox/prod URL
    const fetchFromDhan = async (userId, endpoint) => {
        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);
        const res = await client.get(endpoint);
        return res.data || [];
    };

    // ===================================================================
    // 1. Holdings
    // ===================================================================
    BrokerConnection.getHoldings = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const cacheKey = `dhan:holdings:${userId}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            console.log("Holdings served from cache");
            return cached;
        }

        try {
            const holdings = await fetchFromDhan(userId, "/holdings");
            await cache.set(cacheKey, holdings, 30); // 30 sec cache
            return holdings;
        } catch (err) {
            console.error("getHoldings failed:", err.response?.data || err.message);
            throw new Error("Failed to fetch holdings from Dhan");
        }
    };

    // ===================================================================
    // 2. Positions
    // ===================================================================
    BrokerConnection.getPositions = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const cacheKey = `dhan:positions:${userId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        try {
            const positions = await fetchFromDhan(userId, "/positions");
            await cache.set(cacheKey, positions, 10); // 10 sec cache (more volatile)
            return positions;
        } catch (err) {
            console.error("getPositions failed:", err.response?.data || err.message);
            throw new Error("Failed to fetch positions from Dhan");
        }
    };

    // ===================================================================
    // 3. Full Portfolio (Holdings + Positions merged)
    // ===================================================================
    BrokerConnection.getPortfolio = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        try {
            const [holdingsRes, positionsRes] = await Promise.all([
                client.get("/holdings").catch(() => ({ data: [] })),
                client.get("/positions").catch(() => ({ data: [] })),
            ]);

            const holdings = holdingsRes.data || [];
            const positions = positionsRes.data || [];

            const portfolioMap = new Map();

            // Add holdings
            holdings.forEach(h => {
                const symbol = h.tradingSymbol || h.symbol;
                portfolioMap.set(symbol, {
                    tradingSymbol: symbol,
                    securityId: h.securityId || h.isin,
                    exchange: h.exchange || "NSE",
                    qty: Math.abs(Number(h.qty || h.availableQty || 0)),
                    avgCostPrice: Number(h.avgCostPrice || h.costPrice || 0),
                    ltp: Number(h.ltp || 0),
                    close: Number(h.close || h.ltp || 0),
                    unrealizedProfitLoss: Number(h.unrealizedProfit || 0),
                    realizedProfitLoss: Number(h.realizedProfitLoss || 0),
                    holdingType: "EQUITY",
                    productType: "DELIVERY",
                });
            });

            // Overlay positions (intraday, F&O, etc.)
            positions.forEach(p => {
                const symbol = p.tradingSymbol;
                const netQty = Number(p.netQty || 0);
                const absQty = Math.abs(netQty);

                const existing = portfolioMap.get(symbol);

                if (existing) {
                    // Merge position data
                    Object.assign(existing, {
                        netQty,
                        holdingQuantity: absQty,
                        positionType: p.positionType || "DAY",
                        productType: p.productType || "INTRADAY",
                        unrealizedProfitLoss: Number(p.unrealizedProfit || 0),
                        realizedProfitLoss: Number(p.realizedProfit || 0),
                        ltp: Number(p.ltp || existing.ltp),
                    });
                } else {
                    portfolioMap.set(symbol, {
                        tradingSymbol: symbol,
                        securityId: p.securityId,
                        exchange: p.exchangeSegment?.split("_")[0] || "NSE",
                        qty: absQty,
                        netQty,
                        avgCostPrice: Number(p.buyAvg || p.costPrice || 0),
                        ltp: Number(p.ltp || 0),
                        close: Number(p.ltp || 0),
                        unrealizedProfitLoss: Number(p.unrealizedProfit || 0),
                        realizedProfitLoss: Number(p.realizedProfit || 0),
                        positionType: p.positionType || "DAY",
                        productType: p.productType || "INTRADAY",
                    });
                }
            });

            return Array.from(portfolioMap.values());
        } catch (err) {
            console.error("getPortfolio error:", err.message);
            throw new Error("Failed to build portfolio");
        }
    };

    // ===================================================================
    // 4. Portfolio Summary (Investment, PnL, Cash, etc.)
    // ===================================================================
    BrokerConnection.getPortfolioSummary = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);
        const client = dhanApi(record.accessToken);

        try {
            const [holdingsRes, positionsRes, fundsRes] = await Promise.all([
                client.get("/holdings").catch(() => ({ data: [] })),
                client.get("/positions").catch(() => ({ data: [] })),
                client.get("/fundlimit").catch(() => ({ data: {} })),
            ]);

            const holdings = holdingsRes.data || [];
            const positions = positionsRes.data || [];
            const funds = fundsRes.data || {};

            let totalInvested = 0;
            let totalCurrentValue = 0;
            let totalUnrealizedPL = 0;
            let totalRealizedPL = 0;

            // Process Holdings
            holdings.forEach(h => {
                const qty = Math.abs(Number(h.qty || h.availableQty || 0));
                const cost = Number(h.avgCostPrice || 0);
                const ltp = Number(h.ltp || cost);

                totalInvested += qty * cost;
                totalCurrentValue += qty * ltp;
                totalUnrealizedPL += Number(h.unrealizedProfit || (qty * (ltp - cost)));
                totalRealizedPL += Number(h.realizedProfitLoss || 0);
            });

            // Process Positions
            positions.forEach(p => {
                const qty = Math.abs(Number(p.netQty || 0));
                const cost = Number(p.buyAvg || p.costPrice || 0);
                const ltp = Number(p.ltp || cost);

                totalInvested += qty * cost;
                totalCurrentValue += qty * ltp;
                totalUnrealizedPL += Number(p.unrealizedProfit || 0);
                totalRealizedPL += Number(p.realizedProfit || 0);
            });

            const totalPL = totalCurrentValue - totalInvested;
            const pnlPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

            const availableCash = Number(
                funds.availableBalance ||
                funds.availabelBalance || // typo in Dhan's response sometimes
                funds.cashBalance ||
                0
            );

            return {
                totalInvested: Number(totalInvested.toFixed(2)),
                currentValue: Number(totalCurrentValue.toFixed(2)),
                totalPL: Number(totalPL.toFixed(2)),
                pnlPercent: Number(pnlPercent.toFixed(2)),
                unrealizedPL: Number(totalUnrealizedPL.toFixed(2)),
                realizedPL: Number(totalRealizedPL.toFixed(2)),
                availableCash,
                updatedAt: new Date().toISOString(),
                environment: isSandbox ? "sandbox" : "production",
            };
        } catch (err) {
            console.error("getPortfolioSummary error:", err.message);
            throw new Error("Failed to calculate portfolio summary");
        }
    };

    // ===================================================================
    // Remote Methods
    // ===================================================================
    BrokerConnection.remoteMethod("getHoldings", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/holdings", verb: "get" },
    });

    BrokerConnection.remoteMethod("getPositions", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/positions", verb: "get" },
    });

    BrokerConnection.remoteMethod("getPortfolio", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio", verb: "get" },
    });

    BrokerConnection.remoteMethod("getPortfolioSummary", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio-summary", verb: "get" },
    });
};