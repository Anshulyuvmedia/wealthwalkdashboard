// common/models/broker-connection.js
const axios = require("axios");
const cache = require("../util/cache");
module.exports = function (BrokerConnection) {
    console.log("Dhan Integration – 100% Working + Funds (Dec 2025)");

    const getDhanRecord = async (userId) => {
        const record = await BrokerConnection.findOne({
            where: { userId, broker: "dhan" },
        });
        if (!record) throw new Error("Dhan credentials not saved");
        return record;
    };

    // 1. Save Credentials
    BrokerConnection.saveCredentials = async function (req, data) {
        const userId = req.accessToken.userId;
        const { clientId, apiKey, apiSecret } = data;

        if (!clientId || !apiKey || !apiSecret) throw new Error("Missing fields");

        await BrokerConnection.upsertWithWhere(
            { userId, broker: "dhan" },
            {
                userId,
                broker: "dhan",
                clientId: clientId.trim(),
                apiKey: apiKey.trim(),
                apiSecret: apiSecret.trim(),
                accessToken: null,
                linkedAt: new Date(),
            }
        );

        return { success: true };
    };

    BrokerConnection.remoteMethod("saveCredentials", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "body" } },
        ],
        returns: { root: true },
        http: { path: "/save-credentials", verb: "post" },
    });

    // 2. Start Login
    BrokerConnection.startLogin = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        const res = await axios.post(
            `https://auth.dhan.co/app/generate-consent?client_id=${record.clientId}`,
            {},
            {
                headers: {
                    app_id: record.apiKey,
                    app_secret: record.apiSecret,
                },
            }
        );

        const consentAppId = res.data.consentAppId;
        if (!consentAppId) throw new Error("Failed to generate consent");

        const pending = BrokerConnection.app.get("dhanPendingConsents") || {};
        pending[consentAppId] = { userId, createdAt: Date.now() };
        BrokerConnection.app.set("dhanPendingConsents", pending);

        setTimeout(() => {
            delete pending[consentAppId];
            BrokerConnection.app.set("dhanPendingConsents", pending);
        }, 10 * 60 * 1000);

        const callbackUrl = "https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections/callback";
        const loginUrl = `https://auth.dhan.co/login/consentApp-login?consentAppId=${consentAppId}&redirect_url=${encodeURIComponent(callbackUrl)}`;

        return { loginUrl };
    };

    BrokerConnection.remoteMethod("startLogin", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/start-login", verb: "get" },
    });

    // 3. Handle Callback
    BrokerConnection.handleCallback = async function (tokenId, ctx) {
        if (!tokenId) {
            ctx.res.status(400).send('Missing tokenId');
            return;
        }

        const pending = BrokerConnection.app.get("dhanPendingConsents") || {};
        let consentAppId = null;
        let session = null;

        for (const [key, value] of Object.entries(pending)) {
            if (value && Date.now() - value.createdAt < 10 * 60 * 1000) {
                consentAppId = key;
                session = value;
                break;
            }
        }

        if (!session) {
            ctx.res.set('Content-Type', 'text/html');
            return ctx.res.send(`<h1 style="color:red">Session expired. Try again.</h1>`);
        }

        const userId = session.userId;
        const record = await getDhanRecord(userId);

        try {
            const tokenRes = await axios.post(
                `https://auth.dhan.co/app/consumeApp-consent?tokenId=${tokenId}`,
                {},
                {
                    headers: {
                        app_id: record.apiKey,
                        app_secret: record.apiSecret,
                    },
                    timeout: 10000,
                }
            );

            const accessToken = tokenRes.data?.accessToken;
            if (!accessToken) throw new Error("No access token received");

            await record.updateAttribute("accessToken", accessToken);

            delete pending[consentAppId];
            BrokerConnection.app.set("dhanPendingConsents", pending);

            ctx.res.set('Content-Type', 'text/html');
            ctx.res.send(`
                <h1 style="color:green; text-align:center; margin-top:100px;">
                    Dhan Connected Successfully!
                </h1>
                <p style="text-align:center;">You can now close this window.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
            `);
        } catch (err) {
            ctx.res.set('Content-Type', 'text/html');
            ctx.res.send(`
                <h1 style="color:red">Connection failed</h1>
                <pre>${err.message}</pre>
            `);
        }
    };

    BrokerConnection.remoteMethod("handleCallback", {
        accepts: [
            { arg: "tokenId", type: "string", source: "query", required: true },
            { arg: "ctx", type: "object", http: { source: "context" } }
        ],
        returns: { arg: "body", type: "string", root: true },
        http: { path: "/callback", verb: "get" },
    });

    // Profile
    BrokerConnection.getProfile = async function (req) {
        const record = await getDhanRecord(req.accessToken.userId);
        if (!record.accessToken) throw new Error("No Dhan access token");

        const res = await axios.get("https://api.dhan.co/v2/profile", {
            headers: {
                "access-token": record.accessToken,
                "Accept": "application/json"
            },
            timeout: 10000
        });

        return res.data;
    };

    BrokerConnection.remoteMethod("getProfile", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/profile", verb: "get" },
    });

    // Holdings
    BrokerConnection.getHoldings = async function (req) {
        const userId = req.accessToken.userId;
        const cacheKey = `holdings:${userId}`;

        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await getDhanRecord(userId);

        const res = await axios.get("https://api.dhan.co/v2/holdings", {
            headers: { "access-token": record.accessToken }
        });

        await cache.set(cacheKey, res.data, 10);
        return res.data;
    };


    BrokerConnection.remoteMethod("getHoldings", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/holdings", verb: "get" },
    });

    // Positions
    BrokerConnection.getPositions = async function (req) {
        const userId = req.accessToken.userId;
        const cacheKey = `positions:${userId}`;

        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await getDhanRecord(userId);

        const res = await axios.get("https://api.dhan.co/v2/positions", {
            headers: { "access-token": record.accessToken }
        });

        await cache.set(cacheKey, res.data, 5);
        return res.data;
    };


    BrokerConnection.remoteMethod("getPositions", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/positions", verb: "get" },
    });

    // Convert Position
    BrokerConnection.convertPosition = async function (req, data) {
        const record = await getDhanRecord(req.accessToken.userId);
        const res = await axios.post("https://api.dhan.co/v2/positions/convert", {
            dhanClientId: record.clientId,
            ...data,
            convertQty: String(data.convertQty)
        }, {
            headers: { "access-token": record.accessToken },
            timeout: 10000
        });
        return { success: true, status: res.status };
    };

    BrokerConnection.remoteMethod("convertPosition", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "body" } },
        ],
        returns: { root: true },
        http: { path: "/positions/convert", verb: "post" },
    });

    // Merged Portfolio
    BrokerConnection.getPortfolio = async function (req) {
        const record = await getDhanRecord(req.accessToken.userId);

        const [holdingsRes, positionsRes] = await Promise.all([
            axios.get("https://api.dhan.co/v2/holdings", { headers: { "access-token": record.accessToken } }),
            axios.get("https://api.dhan.co/v2/positions", { headers: { "access-token": record.accessToken } })
        ]);

        const holdings = holdingsRes.data || [];
        const positions = positionsRes.data || [];
        const merged = [...holdings];

        positions.forEach(pos => {
            const existing = merged.find(h => h.tradingSymbol === pos.tradingSymbol);
            const qty = pos.netQty || 0;
            const ltpApprox = qty !== 0 ? pos.buyAvg + (pos.unrealizedProfit || 0) / qty : pos.buyAvg;

            if (existing) {
                Object.assign(existing, {
                    unrealizedProfitLoss: pos.unrealizedProfit || 0,
                    realizedProfitLoss: pos.realizedProfit || 0,
                    ltp: ltpApprox,
                    holdingQuantity: qty,
                    positionType: pos.positionType,
                    productType: pos.productType,
                });
            } else {
                merged.push({
                    ...pos,
                    isin: pos.securityId,
                    holdingQuantity: qty,
                    avgCostPrice: pos.buyAvg || pos.costPrice || 0,
                    unrealizedProfitLoss: pos.unrealizedProfit || 0,
                    realizedProfitLoss: pos.realizedProfit || 0,
                    ltp: ltpApprox,
                    exchange: pos.exchangeSegment?.split('_')[0] || 'NSE'
                });
            }
        });

        return merged;
    };

    BrokerConnection.remoteMethod("getPortfolio", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio", verb: "get" },
    });

    // FUNDS - NEW
    BrokerConnection.getFunds = async function (req) {
        const userId = req.accessToken.userId;
        const cacheKey = `funds:${userId}`;

        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const record = await getDhanRecord(userId);

        const res = await axios.get("https://api.dhan.co/v2/fundlimit", {
            headers: { "access-token": record.accessToken }
        });

        const data = {
            ...res.data,
            availableBalance: res.data.availableBalance || res.data.availabelBalance,
            withdrawableBalance: res.data.withdrawableBalance,
        };

        await cache.set(cacheKey, data, 10);
        return data;
    };


    BrokerConnection.remoteMethod("getFunds", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/funds", verb: "get" },
    });

    // Margin Calculator - NEW
    BrokerConnection.calculateMargin = async function (req, data) {
        const record = await getDhanRecord(req.accessToken.userId);
        const payload = {
            dhanClientId: record.clientId,
            exchangeSegment: data.exchangeSegment || "NSE_EQ",
            transactionType: data.transactionType,
            quantity: Number(data.quantity),
            productType: data.productType,
            securityId: data.securityId,
            price: Number(data.price),
            ...(data.triggerPrice !== undefined && { triggerPrice: Number(data.triggerPrice) })
        };

        const res = await axios.post("https://api.dhan.co/v2/margincalculator", payload, {
            headers: { "access-token": record.accessToken },
            timeout: 10000
        });

        return res.data;
    };

    BrokerConnection.remoteMethod("calculateMargin", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "body" } },
        ],
        returns: { root: true },
        http: { path: "/margin-calculator", verb: "post" },
    });

    BrokerConnection.getMarketQuotes = async function (req, securityIds = []) {
        if (!Array.isArray(securityIds) || securityIds.length === 0) return {};

        const record = await getDhanRecord(req.accessToken.userId);

        const cacheKey = `multi_ltp:${securityIds.join(",")}`;
        const cached = await cache.get(cacheKey);

        if (cached) return cached;

        const res = await axios.post(
            "https://api.dhan.co/v2/marketfeed/ltp",
            {
                symbols: securityIds.map(id => ({
                    securityId: String(id),
                    exchangeSegment: "NSE_EQ"
                }))
            },
            {
                headers: {
                    "access-token": record.accessToken,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout: 12000
            }
        );

        const rawQuotes = res.data || {};
        const normalized = {};

        Object.keys(rawQuotes).forEach(key => {
            const quote = rawQuotes[key];
            const securityId = key.split(":")[1];

            normalized[securityId] = {
                ltp: Number(quote.ltp) || 0,
                change: Number(quote.change) || 0,
                changePercent: Number(quote.changePercent) || 0,
            };
        });

        await cache.set(cacheKey, normalized, 2);

        return normalized;
    };

    BrokerConnection.remoteMethod("getMarketQuotes", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "securityIds", type: "array", http: { source: "body" } }
        ],
        returns: { root: true },
        http: { path: "/market-quotes", verb: "post" },
        description: "Fetch real-time LTP, daily change, and % change for multiple symbols"
    });

    // ─────────────────────────────────────────────────────────────────────
    // BONUS: Optional — One-liner to get LTP for all holdings + positions
    // ─────────────────────────────────────────────────────────────────────
    BrokerConnection.getAllLiveQuotes = async function (req) {
        const record = await getDhanRecord(req.accessToken.userId);

        const [holdingsRes, positionsRes] = await Promise.all([
            axios.get("https://api.dhan.co/v2/holdings", { headers: { "access-token": record.accessToken } }),
            axios.get("https://api.dhan.co/v2/positions", { headers: { "access-token": record.accessToken } })
        ]);

        const allItems = [...(holdingsRes.data || []), ...(positionsRes.data || [])];
        const uniqueIds = [...new Set(
            allItems
                .map(item => item.securityId || item.isin)
                .filter(Boolean)
        )];

        if (uniqueIds.length === 0) return {};

        return await BrokerConnection.getMarketQuotes(req, uniqueIds);
    };

    BrokerConnection.remoteMethod("getAllLiveQuotes", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/all-live-quotes", verb: "get" },
        description: "Convenient endpoint: returns live quotes for all your holdings + positions"
    });

    // Improved cache-wrapper (non-breaking, additive only)
    async function getCachedLTP(record, securityId) {
        const cacheKey = `ltp:${securityId}`;

        // If cached, return instantly
        const cached = await cache.get(cacheKey);
        if (cached) return { ...cached, fromCache: true };

        // Prevent API stampede
        if (!global.__ltpLocks) global.__ltpLocks = {};
        if (global.__ltpLocks[cacheKey]) {
            return new Promise(resolve => {
                const interval = setInterval(async () => {
                    const retry = await cache.get(cacheKey);
                    if (retry) {
                        clearInterval(interval);
                        resolve({ ...retry, fromCache: true });
                    }
                }, 50);
            });
        }
        global.__ltpLocks[cacheKey] = true;

        try {
            const payload = {
                symbols: [
                    { securityId: String(securityId), exchangeSegment: "NSE_EQ" }
                ]
            };

            const res = await axios.post(
                "https://api.dhan.co/v2/marketfeed/ltp",
                payload,
                {
                    headers: {
                        "access-token": record.accessToken,
                        "Content-Type": "application/json"
                    },
                    timeout: 8000
                }
            );

            const key = Object.keys(res.data)[0];
            const quote = res.data[key];

            const parsedId = key.split(":")[1];

            const final = {
                securityId: parsedId,
                ltp: Number(quote.ltp) || 0,
                change: Number(quote.change) || 0,
                changePercent: Number(quote.changePercent) || 0
            };

            // Store for 2 seconds only
            await cache.set(cacheKey, final, 2);

            return final;
        } finally {
            delete global.__ltpLocks[cacheKey];
        }
    }


    BrokerConnection.getLTP = async function (req, securityId) {
        if (!securityId) throw new Error("securityId is required");

        const record = await getDhanRecord(req.accessToken.userId);

        return await getCachedLTP(record, securityId);
    };

    BrokerConnection.remoteMethod("getLTP", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "securityId", type: "string", http: { source: "query" } }
        ],
        returns: { root: true },
        http: { path: "/ltp", verb: "get" },
        description: "Fetch live LTP for a single securityId with caching"
    });


    BrokerConnection.getPortfolioSummary = async function (req) {
        const record = await getDhanRecord(req.accessToken.userId);

        // 1. Fetch merged portfolio using your existing function
        const merged = await BrokerConnection.getPortfolio(req);

        if (!Array.isArray(merged) || merged.length === 0) {
            return {
                totalInvestment: 0,
                currentValue: 0,
                overallPnL: 0,
                overallPnLPercent: 0
            };
        }

        // 2. Compute totals
        let totalInvestment = 0;
        let currentValue = 0;

        merged.forEach(item => {
            const qty = Number(item.holdingQuantity || item.netQty || 0);
            const avgPrice = Number(item.avgCostPrice || item.buyAvg || 0);
            const ltp = Number(item.ltp || 0);

            if (qty > 0) {
                totalInvestment += qty * avgPrice;
                currentValue += qty * ltp;
            }
        });

        const overallPnL = currentValue - totalInvestment;
        const overallPnLPercent =
            totalInvestment > 0 ? (overallPnL / totalInvestment) * 100 : 0;

        return {
            totalInvestment: Number(totalInvestment.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            overallPnL: Number(overallPnL.toFixed(2)),
            overallPnLPercent: Number(overallPnLPercent.toFixed(2))
        };
    };

    BrokerConnection.remoteMethod("getPortfolioSummary", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio-summary", verb: "get" },
    });
};