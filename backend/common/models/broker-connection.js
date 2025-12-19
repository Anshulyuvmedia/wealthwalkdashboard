// common/models/broker-connection.js
const axios = require("axios");
const cache = require("../util/cache");
const { getDhanConfig } = require('../util/dhanConfig');

module.exports = async function (BrokerConnection) {
    // Wait until the model is fully mounted to the LoopBack app
    const app = await new Promise(resolve => {
        if (BrokerConnection.app) {
            resolve(BrokerConnection.app);
        } else {
            BrokerConnection.once("attached", () => resolve(BrokerConnection.app));
        }
    });
    console.log("Dhan Integration – 100% Working + Funds (Dec 2025)");

    const getDhanRecord = async (userId) => {
        const record = await BrokerConnection.findOne({
            where: { userId, broker: "dhan" },
        });
        // console.log('record', record);
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
        // console.log('consentAppId', consentAppId);
        if (!consentAppId) throw new Error("Failed to generate consent");

        const pending = { ...(BrokerConnection.app.get("dhanPendingConsents") || {}) };
        pending[consentAppId] = { userId, createdAt: Date.now() };
        BrokerConnection.app.set("dhanPendingConsents", pending);

        // Correct cleanup using same `pending` reference
        // setTimeout(() => {
        //     const current = BrokerConnection.app.get("dhanPendingConsents") || {};
        //     if (current[consentAppId]) {
        //         delete current[consentAppId];
        //         BrokerConnection.app.set("dhanPendingConsents", current);
        //     }
        // }, 10 * 60 * 1000);

        const callbackUrl = "https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections/callback";
        const loginUrl = `https://auth.dhan.co/login/consentApp-login?consentAppId=${consentAppId}&redirect_url=${encodeURIComponent(callbackUrl)}`;
        // console.log('Final loginUrl:', loginUrl);

        return { loginUrl };
    };

    BrokerConnection.remoteMethod("startLogin", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/start-login", verb: "get" },
    });

    // 3. Handle Callback – FIXED (Broker token ≠ App token)
    BrokerConnection.callback = async function (tokenId, ctx) {

        console.log("Callback URL hit:", ctx.req.originalUrl);
        console.log("Full Query Params:", ctx.req.query);
        console.log("tokenId received:", tokenId);

        if (!tokenId) {
            ctx.res.status(400).send('Missing tokenId');
            return;
        }

        const pending = BrokerConnection.app.get("dhanPendingConsents") || {};
        console.log("PENDING SESSIONS:", Object.keys(pending));

        let foundSession = null;
        let foundConsentAppId = null;

        for (const [consentAppId, session] of Object.entries(pending)) {
            if (session && Date.now() - session.createdAt < 10 * 60 * 1000) {
                foundConsentAppId = consentAppId;
                foundSession = session;
                break;
            }
        }

        console.log("FOUND SESSION:", foundSession);

        if (!foundSession) {
            ctx.res.set('Content-Type', 'text/html');
            return ctx.res.send(`<h1 style="color:red">Session expired or invalid. Please try linking again.</h1>`);
        }

        const userId = foundSession.userId;
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

            console.log("Dhan response:", tokenRes.data);

            const accessToken = tokenRes.data?.accessToken;
            if (!accessToken) throw new Error("No access token in response");

            // SAVE REAL DHAN TOKEN (BROKER TOKEN)
            await record.updateAttribute("accessToken", accessToken);

            // Remove session
            delete pending[foundConsentAppId];
            BrokerConnection.app.set("dhanPendingConsents", pending);

            // CREATE SEPARATE APP TOKEN (LOOPBACK TOKEN)
            const AccessToken = BrokerConnection.app.models.AccessToken;
            const lbToken = await AccessToken.create({
                userId,
                ttl: 60 * 60 * 24 * 30  // 30 days
            });

            // SEND BOTH TOKENS BACK TO REACT NATIVE WEBVIEW
            ctx.res.set('Content-Type', 'text/html');
            ctx.res.send(`
            <!DOCTYPE html>
            <html>
                <body>
                    <script>
                    setTimeout(() => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: "DHAN_OAUTH_SUCCESS",
                            brokerToken: "${accessToken}",    // REAL DHAN TOKEN
                            appToken: "${lbToken.id}"         // YOUR APP TOKEN
                        }));
                    }, 300);

                    setTimeout(() => window.close(), 1200);
                    </script>

                    <h2 style="color:green; text-align:center; margin-top:100px; font-family:sans-serif">
                        Dhan Connected Successfully!
                    </h2>
                    <p style="text-align:center">You can close this window.</p>
                </body>
            </html>
        `);

            return;

        } catch (err) {
            console.log("Consume ERROR FULL:", {
                status: err?.response?.status,
                headers: err?.response?.headers,
                data: err?.response?.data,
                axiosMessage: err.message
            });

            ctx.res.set('Content-Type', 'text/html');
            ctx.res.send(`
            <h1 style="color:red">Connection Failed</h1>
            <pre>${JSON.stringify(err?.response?.data || err.message, null, 2)}</pre>
        `);
        }
    };


    BrokerConnection.remoteMethod("callback", {
        accepts: [
            { arg: "tokenId", type: "string", source: "query", required: true },
            { arg: "ctx", type: "object", http: { source: "context" } }
        ],
        http: { path: "/callback", verb: "get" },
    });

    // ──────────────────────────────────────
    // DISCONNECT BROKER (Clear credentials & tokens)
    // ──────────────────────────────────────
    BrokerConnection.disconnect = async function (req) {
        const userId = req.accessToken.userId;
        if (!userId) throw new Error('Unauthorized');

        try {
            // Find and clear the user's Dhan record
            const updated = await BrokerConnection.updateAll(
                { userId, broker: "dhan" },
                {
                    clientId: null,
                    apiKey: null,
                    apiSecret: null,
                    accessToken: null,     // Dhan OAuth token
                    linkedAt: null,
                    // Keep userId and broker field so record isn't fully deleted (optional)
                }
            );

            if (updated.count === 0) {
                // No record found — maybe already disconnected
                return { success: true, message: 'No active Dhan connection found' };
            }

            console.log(`Dhan disconnected for user ${userId}`);

            return { success: true, message: 'Dhan account disconnected successfully' };
        } catch (err) {
            console.error('Disconnect error:', err);
            throw new Error('Failed to disconnect Dhan account');
        }
    };

    BrokerConnection.remoteMethod('disconnect', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
        returns: { root: true, type: 'object' },
        http: { path: '/disconnect', verb: 'post' },
        description: 'Disconnect and clear saved Dhan credentials and access token'
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
        console.log('profile', res.data);
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
        // console.log('res.data', res.data);
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
        // console.log('getPositions', res.data);

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
            availableBalance: res.data.availableBalance || res.data.availabelBalance || 0,
            withdrawableBalance: res.data.withdrawableBalance || 0,
            usedMargin: res.data.usedMargin || 0,
            // add more if needed
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
                    "Content-Type": "application/json"
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

    // ──────────────────────────────────────
    // PORTFOLIO SUMMARY – FINAL & ACCURATE (Dec 2025)
    // ──────────────────────────────────────
    BrokerConnection.getPortfolioSummary = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        try {
            // Fetch raw data
            const [holdingsRes, positionsRes, fundsRes] = await Promise.all([
                axios.get("https://api.dhan.co/v2/holdings", { headers: { "access-token": record.accessToken } }),
                axios.get("https://api.dhan.co/v2/positions", { headers: { "access-token": record.accessToken } }),
                axios.get("https://api.dhan.co/v2/fundlimit", { headers: { "access-token": record.accessToken } })
            ]);
            const holdings = holdingsRes.data || [];
            const positions = positionsRes.data || [];
            const funds = fundsRes.data;
            // console.log('holdings', holdings, 'positions', positions, 'funds', funds);

            let totalInvestment = 0;
            let currentValue = 0;
            let realisedPL = 0;
            let unrealisedPL = 0;

            // Process Holdings
            holdings.forEach(h => {
                const qty = Math.abs(Number(h.qty || h.availableQty || 0));
                const avgPrice = Number(h.avgCostPrice || 0);
                const ltp = Number(h.ltp || avgPrice);
                const investment = qty * avgPrice;
                const current = qty * ltp;

                totalInvestment += investment;
                currentValue += current;
                realisedPL += Number(h.realizedProfitLoss || 0);
                unrealisedPL += current - investment;
            });

            // Process Positions
            positions.forEach(p => {
                const qty = Math.abs(Number(p.netQty || 0));
                const avgPrice = Number(p.buyAvg || p.costPrice || 0);
                const ltp = Number(p.ltp || avgPrice);
                const investment = qty * avgPrice;
                const current = qty * ltp;

                totalInvestment += investment;
                currentValue += current;
                realisedPL += Number(p.realizedProfit || 0);
                unrealisedPL += Number(p.unrealizedProfit || 0);
            });

            const totalPL = currentValue - totalInvestment;
            const overallPnLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

            return {
                totalInvestment: Number(totalInvestment.toFixed(2)),
                currentValue: Number(currentValue.toFixed(2)),
                totalPL: Number(totalPL.toFixed(2)),
                overallPnLPercent: Number(overallPnLPercent.toFixed(2)),
                realisedPL: Number(realisedPL.toFixed(2)),
                unrealisedPL: Number(unrealisedPL.toFixed(2)),
                availableCash: Number(funds?.availableBalance || 0),
                updatedAt: new Date().toISOString()
            };
        } catch (err) {
            console.error("Summary error:", err.message);
            throw new Error("Failed to calculate portfolio summary");
        }
    };

    BrokerConnection.remoteMethod("getPortfolioSummary", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio-summary", verb: "get" }
    });

    // ──────────────────────────────────────────────────────────────
    // Dhan Live MarketFeed WebSocket Proxy (Secure + Scalable)
    // ──────────────────────────────────────────────────────────────
    let activeSockets = new Map(); // userId → socket instance

    BrokerConnection.startLiveFeed = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        if (!record.accessToken) throw new Error("Dhan not connected");

        // If already running, return existing
        if (activeSockets.has(userId)) {
            return { status: "already_running" };
        }

        const WebSocket = require('ws');
        const ws = new WebSocket('wss://api.dhan.co/marketfeed');

        ws.on('open', () => {
            console.log(`Dhan WebSocket opened for user ${userId}`);
            ws.send(JSON.stringify({
                type: "auth",
                accessToken: record.accessToken
            }));
        });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);

                // Handle SUBSCRIBE from frontend
                if (msg.type === "SUBSCRIBE" && Array.isArray(msg.symbols)) {
                    console.log(`Subscribing to ${msg.symbols.length} symbols`);
                    ws.send(JSON.stringify({
                        type: "subscribe",
                        symbols: msg.symbols.map(id => ({
                            securityId: String(id),
                            exchangeSegment: "NSE_EQ"
                        }))
                    }));
                    return;
                }

                if (msg.type === "ticker") {
                    const event = {
                        type: "LIVE_QUOTE",
                        data: msg.data
                    };
                    BrokerConnection.app.io.to(`user_${userId}`).emit('market', event);
                }
            } catch (e) {
                console.error("WS parse error:", e);
            }
        });

        ws.on('close', () => {
            console.log(`Dhan WS closed for user ${userId}`);
            activeSockets.delete(userId);
            BrokerConnection.app.io.to(`user_${userId}`).emit('market', { type: "DISCONNECTED" });
        });

        ws.on('error', (err) => {
            console.error("Dhan WS error:", err.message);
            activeSockets.delete(userId);
        });

        activeSockets.set(userId, ws);

        return { status: "connected" };
    };

    BrokerConnection.remoteMethod("startLiveFeed", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/start-live-feed", verb: "post" }
    });

    // ──────────────────────────────────────
    // ORDER HISTORY – 100% WORKING (Dec 2025)
    // ──────────────────────────────────────
    BrokerConnection.orderHistory = async function (req) {
        const userId = req.accessToken.userId;
        const symbol = req.query.symbol?.trim();

        if (!symbol) {
            throw new Error("Missing symbol parameter");
        }

        const record = await getDhanRecord(userId);

        try {
            const res = await axios.get("https://api.dhan.co/v2/orders", {
                headers: { "access-token": record.accessToken },
                params: {
                    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // last 90 days
                    toDate: new Date().toISOString().split('T')[0],
                },
                timeout: 15000
            });

            if (!res.data || !Array.isArray(res.data)) {
                return [];
            }

            // Filter executed trades for this symbol
            const trades = res.data
                .filter(order =>
                    order.tradingSymbol === symbol &&
                    order.orderStatus === "TRADE" &&
                    order.transactionType &&
                    order.price > 0
                )
                .map(order => ({
                    date: new Date(order.updateTime).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
                    action: order.transactionType === "BUY" ? "BUY" : "SELL",
                    price: Number(order.price).toFixed(2),
                    qty: order.quantity,
                    amount: (Number(order.price) * order.quantity).toFixed(2),
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

            return trades;
        } catch (err) {
            console.error("Dhan order history error:", err.response?.data || err.message);
            throw new Error("Failed to fetch trades from Dhan");
        }
    };

    BrokerConnection.remoteMethod("orderHistory", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } }
        ],
        returns: { arg: "data", type: "array", root: true },
        http: { path: "/order-history", verb: "get" },
        description: "Fetch executed trade history for a symbol"
    });

    // ──────────────────────────────────────
    // DAILY P&L – TODAY'S PROFIT/LOSS (Dec 2025)
    // ──────────────────────────────────────
    BrokerConnection.getTodayPnL = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        try {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // 1. Today's Realised P&L from executed orders
            const ordersRes = await axios.get("https://api.dhan.co/v2/orders", {
                headers: { "access-token": record.accessToken },
                params: { fromDate: todayStr, toDate: todayStr },
                timeout: 15000
            });

            let todayRealisedPL = 0;
            if (ordersRes.data && Array.isArray(ordersRes.data)) {
                todayRealisedPL = ordersRes.data
                    .filter(o => o.orderStatus === "TRADE")
                    .reduce((sum, o) => {
                        const qty = o.quantity;
                        const price = Number(o.price);
                        const value = o.transactionType === "BUY" ? -price * qty : price * qty;
                        return sum + value;
                    }, 0);
            }

            // 2. Today's Unrealised P&L = Current market value - Yesterday's close value
            const positionsRes = await axios.get("https://api.dhan.co/v2/positions", {
                headers: { "access-token": record.accessToken }
            });

            let todayUnrealisedPL = 0;
            if (positionsRes.data && Array.isArray(positionsRes.data)) {
                positionsRes.data.forEach(p => {
                    const qty = Math.abs(Number(p.netQty || 0));
                    const ltp = Number(p.ltp || 0);
                    const yesterdayClose = Number(p.previousClose || p.ltp || 0); // fallback
                    const dailyChange = (ltp - yesterdayClose) * qty;
                    todayUnrealisedPL += dailyChange;
                });
            }

            const todayTotalPL = todayRealisedPL + todayUnrealisedPL;

            return {
                todayRealisedPL: Number(todayRealisedPL.toFixed(2)),
                todayUnrealisedPL: Number(todayUnrealisedPL.toFixed(2)),
                todayTotalPL: Number(todayTotalPL.toFixed(2)),
                date: todayStr
            };
        } catch (err) {
            console.error("Daily P&L error:", err.message);
            return {
                todayRealisedPL: 0,
                todayUnrealisedPL: 0,
                todayTotalPL: 0,
                date: new Date().toISOString().split('T')[0]
            };
        }
    };

    BrokerConnection.remoteMethod("getTodayPnL", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/today-pnl", verb: "get" }
    });

    // Trade History (from Dhan API v2/trades)
    BrokerConnection.getTradeHistory = async function (req, data = {}) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);
        const { fromDate = '2024-01-01', toDate = new Date().toISOString().split('T')[0], page = 0 } = data;

        const cacheKey = `trades:${userId}:${fromDate}:${toDate}:${page}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        try {
            const res = await axios.get(
                `https://api.dhan.co/v2/trades/${fromDate}/${toDate}/${page}`,
                {
                    headers: { "access-token": record.accessToken },
                    timeout: 15000,
                }
            );

            const result = res.data || [];
            await cache.set(cacheKey, result, 60);
            return result;
        } catch (err) {
            console.error("getTradeHistory error:", err.message);
            return [];
        }
    };

    BrokerConnection.remoteMethod("getTradeHistory", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "query" } }, // fromDate, toDate, page
        ],
        returns: { root: true },
        http: { path: "/trade-history", verb: "get" },
    });

    // Ledger (from Dhan API v2/ledger)
    BrokerConnection.getLedger = async function (req, data = {}) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);
        const { fromDate = '2025-01-01', toDate = '2025-12-31' } = data;

        const cacheKey = `ledger:${userId}:${fromDate}:${toDate}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        // Dhan API: https://api.dhan.co/v2/ledger?from-date={from}&to-date={to}
        const res = await axios.get(
            `https://api.dhan.co/v2/ledger?from-date=${fromDate}&to-date=${toDate}`,
            {
                headers: { "access-token": record.accessToken, "Accept": "application/json" },
                timeout: 15000,
            }
        );

        await cache.set(cacheKey, res.data, 60);
        return res.data; // Array of ledger entries
    };

    BrokerConnection.remoteMethod("getLedger", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "query" } },
        ],
        returns: { root: true },
        http: { path: "/ledger", verb: "get" },
    });

    // Export TradeBook CSV (merged trades + ledger)
    BrokerConnection.exportTradeBook = async function (req, data = {}) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);
        const { fromDate = '2025-01-01', toDate = '2025-12-31' } = data;

        const [trades, ledger] = await Promise.all([
            BrokerConnection.getTradeHistory(req, { fromDate, toDate, page: 0 }),
            BrokerConnection.getLedger(req, { fromDate, toDate }),
        ]);

        // Merge: trades first, then ledger (funds)
        const merged = [...trades, ...ledger];

        // Simple CSV generation
        const headers = [
            'Date', 'Type', 'Symbol', 'Qty', 'Price', 'Amount', 'Narration', 'Balance'
        ];
        const csv = [
            headers.join(','),
            ...merged.map(t => [
                t.exchangeTime || t.voucherdate || '',
                t.transactionType || 'FUND',
                t.tradingSymbol || t.voucherdesc || '',
                t.tradedQuantity || '',
                t.tradedPrice || '',
                (t.tradedQuantity * t.tradedPrice) || (t.debit || t.credit) || '',
                t.narration || '',
                t.runbal || '',
            ].map(f => `"${f}"`).join(','))
        ].join('\n');

        return { csv, filename: `tradebook_${fromDate}_to_${toDate}.csv` };
    };

    BrokerConnection.remoteMethod("exportTradeBook", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "query" } },
        ],
        returns: { root: true },
        http: { path: "/export-tradebook", verb: "get" },
    });

    // ──────────────────────────────────────
    // COMBINED TRADEBOOK → ONLY REAL TRADES (no ledger/funds)
    // ──────────────────────────────────────
    BrokerConnection.getTradeBook = async function (req) {
        const from = req.query.from || '2024-01-01';
        const to = req.query.to || new Date().toISOString().split('T')[0];
        const page = parseInt(req.query.page) || 0;

        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        const cacheKey = `tradebook:${userId}:${from}:${to}:${page}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        try {
            const res = await axios.get(
                `https://api.dhan.co/v2/trades/${from}/${to}/${page}`,
                {
                    headers: { "access-token": record.accessToken },
                    timeout: 15000,
                }
            );

            const trades = (res.data || []).map(t => ({
                ...t,
                // make sure every item has a unique id for React keyExtractor
                _id: `${t.exchangeTime || t.orderId || t.tradeId}-${t.tradedQuantity}-${t.tradedPrice}`,
            }));

            const result = {
                trades: trades,
                ledger: [],           // ← explicitly empty
                hasMore: trades.length === 50   // Dhan returns max 50 per page
            };

            await cache.set(cacheKey, result, 60);
            return result;

        } catch (err) {
            console.error("getTradeBook error:", err.response?.data || err.message);
            return { trades: [], ledger: [], hasMore: false };
        }
    };

    BrokerConnection.remoteMethod("getTradeBook", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/tradebook", verb: "get" }
    });

    // ──────────────────────────────────────
    // ORDER HISTORY BY SECURITY ID – Using /v2/trades (Executed Only)
    // ──────────────────────────────────────
    BrokerConnection.orderHistoryBySecurity = async function (req) {
        const securityId = req.query.securityId?.trim();
        let fy = req.query.fy?.trim() || null;
        if (!securityId) throw new Error("Missing securityId");

        const record = await getDhanRecord(req.accessToken.userId);

        // Parse FY (e.g., "FY 2025-2026" → startYear=2025)
        let startYear;
        if (fy) {
            const match = fy.match(/FY (\d{4})/);
            if (match) {
                startYear = parseInt(match[1]);
            } else {
                fy = null; // Invalid, fallback to current
            }
        }

        // Current date (use server time)
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Compute from/to
        let fromDate, toDate;
        if (!fy) {
            // Default: Current FY
            startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        }
        fromDate = `${startYear}-04-01`;
        toDate = `${startYear + 1}-03-31`;

        // Clamp toDate to today if in future
        if (toDate > today) {
            toDate = today;
        }

        // Fetch ALL trades for the range, then filter by securityId
        let allTrades = [];
        let page = 0;
        let hasMore = true;

        try {
            while (hasMore) {
                const res = await axios.get(
                    `https://api.dhan.co/v2/trades/${fromDate}/${toDate}/${page}`,
                    {
                        headers: { "access-token": record.accessToken, "Accept": "application/json" },
                        timeout: 15000,
                    }
                );

                const pageTrades = res.data || [];
                // console.log('res.data', res.data);
                const filtered = pageTrades.filter(trade =>
                    String(trade.securityId) === securityId &&
                    trade.tradedQuantity > 0 &&
                    trade.tradedPrice > 0
                );

                allTrades = [...allTrades, ...filtered];
                hasMore = pageTrades.length === 50;  // Dhan paginates at 50
                page++;
            }

            // Format for frontend
            const formatted = allTrades
                .map(trade => ({
                    date: new Date(trade.exchangeTime).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    }),
                    action: trade.transactionType === "BUY" ? "BUY" : "SELL",
                    price: Number(trade.tradedPrice).toFixed(2),
                    qty: trade.tradedQuantity,
                    amount: (Number(trade.tradedPrice) * trade.tradedQuantity).toFixed(2),
                    raw: { ...trade }
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            return formatted;

        } catch (err) {
            console.error("Dhan trades error:", err.response?.data || err.message);
            throw new Error("Failed to fetch trade history");
        }
    };

    BrokerConnection.remoteMethod("orderHistoryBySecurity", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { type: "array", root: true },
        http: { path: "/order-history-by-security", verb: "get" },
        description: "Fetch executed trade history for a specific securityId (FY range)"
    });

    BrokerConnection.getTodayOrders = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);
        const dhan = getDhanConfig();

        const accessToken = dhan.isSandbox ? dhan.accessToken : record.accessToken;

        console.log('dhan record.accessToken', record.accessToken);
        try {
            const todayStr = new Date().toISOString().split('T')[0];

            const ordersRes = await axios.get(`${dhan.baseUrl}/v2/orders`, {
                headers: { "access-token": accessToken, "Accept": "application/json" },
                timeout: 15000
            });

            const orders = ordersRes.data || [];
            console.log('Todays orders', orders);
            return {
                orders: orders.map(order => ({
                    dhanClientId: order.dhanClientId,
                    orderId: order.orderId,
                    exchangeOrderId: order.exchangeOrderId,
                    correlationId: order.correlationId,
                    orderStatus: order.orderStatus,
                    transactionType: order.transactionType,
                    exchangeSegment: order.exchangeSegment,
                    productType: order.productType,
                    orderType: order.orderType,
                    orderValidity: order.validity,
                    tradingSymbol: order.tradingSymbol,
                    orderSecurityId: order.securityId,
                    quantity: order.quantity,
                    disclosedQuantity: order.disclosedQuantity || 0,
                    price: order.price,
                    triggerPrice: order.triggerPrice || 0,
                    afterMarketOrder: order.afterMarketOrder,
                    boProfitValue: order.boProfitValue,
                    boStopLossValue: order.boStopLossValue,
                    legName: order.legName,
                    orderCreateTime: order.createTime,
                    orderUpdateTime: order.updateTime,
                    exchangeTime: order.exchangeTime,
                    omsErrorCode: order.omsErrorCode,
                    omsErrorDescription: order.omsErrorDescription,
                    algoId: order.algoId,
                    remainingQuantity: order.remainingQuantity,
                    averageTradedPrice: order.averageTradedPrice || 0,
                    filledQty: order.filledQty || 0,
                })),
                date: todayStr,
                count: orders.length
            };
        } catch (err) {
            console.error("Get today orders error:", err.message || err);
            return {
                orders: [],
                date: new Date().toISOString().split('T')[0],
                count: 0,
                error: err.response?.data?.errorMessage || err.message || "Failed to fetch orders"
            };
        }
    };

    BrokerConnection.remoteMethod("getTodayOrders", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/todayOrders", verb: "get" }
    });

    BrokerConnection.modifyPendingOrder = async function (data, req) {
        const userId = req.accessToken.userId;
        const { orderId, orderType, validity, price, quantity, triggerPrice, legName } = data;

        if (!orderId) {
            return {
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "orderId is required",
                    recoverable: false
                }
            };
        }

        const dhan = getDhanConfig();
        const record = dhan.isSandbox ? null : await getDhanRecord(userId);

        const accessToken = dhan.isSandbox ? dhan.accessToken : record.accessToken;
        const dhanClientId = dhan.isSandbox ? dhan.clientId : record.clientId;

        try {
            // 1. Fetch current order details
            const orderRes = await axios.get(
                `${dhan.baseUrl}/v2/orders/${orderId}`,
                {
                    headers: { "access-token": accessToken },
                    timeout: 15000
                }
            );

            const currentOrder = orderRes.data; // v2 returns object directly

            if (!currentOrder || !currentOrder.orderId) {
                return {
                    success: false,
                    error: {
                        code: "ORDER_NOT_FOUND",
                        message: "Order not found or invalid at broker",
                        recoverable: false
                    }
                };
            }

            if (!["PENDING", "TRANSIT"].includes(currentOrder.orderStatus)) {
                return {
                    success: false,
                    error: {
                        code: "ORDER_NOT_MODIFIABLE",
                        message: `Cannot modify order in ${currentOrder.orderStatus} state`,
                        brokerStatus: currentOrder.orderStatus,
                        recoverable: false
                    }
                };
            }

            // 2. Build minimal payload — only include changed fields + required
            const body = {
                dhanClientId,
                orderId: currentOrder.orderId
            };

            // Only send if different
            if (orderType && orderType !== currentOrder.orderType) {
                body.orderType = orderType;
            }
            if (validity && validity !== currentOrder.validity) {
                body.validity = validity;
            }
            if (quantity !== undefined && Number(quantity) !== currentOrder.quantity) {
                body.quantity = Number(quantity); // Must be TOTAL quantity
            }
            if (price !== undefined && ["LIMIT", "STOP_LOSS"].includes(orderType || currentOrder.orderType)) {
                body.price = Number(price);
            }
            if (triggerPrice !== undefined && ["STOP_LOSS", "STOP_LOSS_MARKET"].includes(orderType || currentOrder.orderType)) {
                body.triggerPrice = Number(triggerPrice);
                if (body.triggerPrice <= 0) {
                    return {
                        success: false,
                        error: {
                            code: "INVALID_TRIGGER_PRICE",
                            message: "Trigger price must be greater than 0",
                            recoverable: false
                        }
                    };
                }
            }
            if (legName && legName !== "NA") {
                body.legName = legName;
            }

            // If no meaningful changes, return success (no API call needed)
            if (Object.keys(body).length === 2) {
                return {
                    success: true,
                    message: "No changes detected",
                    data: currentOrder
                };
            }

            // 3. Modify the order
            const modifyRes = await axios.put(
                `${dhan.baseUrl}/v2/orders/${orderId}`,
                body,
                {
                    headers: {
                        "access-token": accessToken,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    timeout: 15000
                }
            );

            const result = modifyRes.data;

            if (result.orderStatus === "TRANSIT") {
                return {
                    success: true,
                    warning: {
                        code: "ORDER_IN_TRANSIT",
                        message: "Modification accepted. Awaiting exchange confirmation.",
                        nextAction: "POLL_ORDER_STATUS"
                    },
                    data: result
                };
            }

            return {
                success: true,
                data: result
            };

        } catch (err) {
            const brokerErr = err.response?.data;
            return {
                success: false,
                error: {
                    code: brokerErr?.errorCode || "BROKER_ERROR",
                    message: brokerErr?.errorMessage || err.message || "Failed to modify order",
                    brokerMessage: brokerErr || null,
                    recoverable: true
                }
            };
        }
    };

    BrokerConnection.remoteMethod("modifyPendingOrder", {
        accepts: [
            { arg: "data", type: "object", http: { source: "body" }, required: true },
            { arg: "req", type: "object", http: { source: "req" } }
        ],
        returns: { root: true },
        http: { path: "/modifypendingorder", verb: "put" }
    });

    BrokerConnection.getLivePrice = async function (payload, req) {
        console.log('[getLivePrice] Request received. Payload:', JSON.stringify(payload));
        console.log('[getLivePrice] req.accessToken.userId:', req.accessToken?.userId);

        const userId = req.accessToken?.userId;
        if (!userId) {
            console.error('[getLivePrice] AUTH_ERROR: No userId');
            return {
                success: false,
                error: { code: "AUTH_ERROR", message: "User not authenticated", recoverable: false }
            };
        }

        // Extract securityId & segment
        let securityId = null;
        let exchangeSegment = null;

        if (typeof payload === 'object' && payload !== null) {
            for (const segment in payload) {
                if (Object.prototype.hasOwnProperty.call(payload, segment) &&
                    Array.isArray(payload[segment]) && payload[segment].length > 0) {
                    exchangeSegment = segment;
                    securityId = payload[segment][0];
                    break;
                }
            }
        }

        console.log('[getLivePrice] Extracted → securityId:', securityId, 'exchangeSegment:', exchangeSegment);

        if (!securityId || !exchangeSegment) {
            console.error('[getLivePrice] VALIDATION_ERROR: Bad payload');
            return {
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid payload: must contain exchangeSegment with at least one securityId",
                    example: '{ "NSE_EQ": ["11536"] }',
                    recoverable: false
                }
            };
        }

        try {
            const dhan = getDhanConfig();
            const record = dhan.isSandbox ? null : await getDhanRecord(userId);
            const accessToken = dhan.isSandbox ? dhan.accessToken : record.accessToken;
            const dhanClientId = dhan.isSandbox ? dhan.clientId : record.clientId;

            console.log('[getLivePrice] Using accessToken (first 20 chars):', accessToken?.substring(0, 20));
            console.log('[getLivePrice] dhanClientId:', dhanClientId);
            console.log('[getLivePrice] Sandbox mode:', dhan.isSandbox);

            const marketFeedPayload = {
                [securityId]: true   // Key: securityId as string, value: true
            };
            console.log('[getLivePrice] Corrected payload →', JSON.stringify(marketFeedPayload));

            const response = await axios.post(
                `${dhan.baseUrl}/v2/marketfeed/ltp`,
                marketFeedPayload,
                {
                    headers: {
                        "access-token": accessToken,
                        "client-id": dhanClientId,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    timeout: 15000
                }
            );

            console.log('[getLivePrice] Dhan response status:', response.status);
            console.log('[getLivePrice] Dhan full response:', JSON.stringify(response.data));

            const ltpData = response.data?.data?.[securityId]?.last_price;

            if (ltpData === undefined || ltpData === null) {
                console.warn('[getLivePrice] NO_LTP_DATA – Broker returned no price');
                return {
                    success: false,
                    error: {
                        code: "NO_LTP_DATA",
                        message: "No LTP returned from broker",
                        brokerResponse: response.data,
                        recoverable: true
                    }
                };
            }

            console.log('[getLivePrice] SUCCESS → LTP:', ltpData);
            return {
                success: true,
                data: {
                    ltp: Number(ltpData),
                    timestamp: Date.now()
                }
            };

        } catch (err) {
            console.error('[getLivePrice] EXCEPTION:', err.message);
            if (err.response) {
                console.error('[getLivePrice] Broker error response:', JSON.stringify(err.response.data));
                console.error('[getLivePrice] Status:', err.response.status);
            } else if (err.request) {
                console.error('[getLivePrice] No response received (network/Dhan down?)');
            }

            const brokerErr = err.response?.data;
            return {
                success: false,
                error: {
                    code: brokerErr?.errorCode || "BROKER_ERROR",
                    message: brokerErr?.errorMessage || err.message || "Failed to fetch live price",
                    brokerMessage: brokerErr || null,
                    recoverable: true
                }
            };
        }
    };

    // Remote method definition (POST with body)
    BrokerConnection.remoteMethod("getLivePrice", {
        accepts: [
            { arg: "payload", type: "object", http: { source: "body" }, required: true },
            { arg: "req", type: "object", http: { source: "req" } }
        ],
        returns: { root: true },
        http: { path: "/live-price", verb: "post" }
    });


};