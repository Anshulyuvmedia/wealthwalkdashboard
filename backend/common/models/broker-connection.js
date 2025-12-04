// common/models/broker-connection.js
const axios = require("axios");

module.exports = function (BrokerConnection) {
    console.log("Dhan Integration – 100% Working (Dec 2025)");

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

    // 3. Handle Callback – FINAL FIX (renders HTML + auto-closes)
    BrokerConnection.handleCallback = async function (tokenId, ctx) {   // ← ctx added
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
            return `<h1 style="color:red">Session expired. Try again.</h1>`;
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
            if (!accessToken) {
                console.error("NO ACCESS TOKEN FROM DHAN:", tokenRes.data);
                throw new Error("No access token received");
            }
            console.log("RAW accessToken received:", typeof accessToken, accessToken.substring(0, 40) + "...");

            await record.updateAttribute("accessToken", accessToken);

            const saved = await BrokerConnection.findById(record.id);
            console.log("TOKEN SAVED IN DB:");
            console.log("  Type:", typeof saved.accessToken);
            console.log("  Value:", saved.accessToken ? saved.accessToken.substring(0, 40) + "..." : "NULL");
            console.log("  Length:", saved.accessToken?.length);
            console.log(`Dhan connected successfully for user ${userId}`);

            delete pending[consentAppId];
            BrokerConnection.app.set("dhanPendingConsents", pending);

            // THIS IS THE MAGIC PART
            ctx.res.redirect('/dhan-success.html');
            // ctx.res.status(200);

        } catch (err) {
            ctx.res.set('Content-Type', 'text/html');
            return `<h1 style="color:red">Connection failed</h1><pre>${err.message}</pre>`;
        }
    };

    BrokerConnection.remoteMethod("handleCallback", {
        accepts: [
            { arg: "tokenId", type: "string", source: "query", required: true },
            { arg: "ctx", type: "object", http: { source: "context" } }   // ← ADD THIS
        ],
        returns: { arg: "body", type: "string", root: true },
        http: { path: "/callback", verb: "get" },
    });

    // Profile & Holdings
    BrokerConnection.getProfile = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        if (!record.accessToken) {
            throw new Error("No Dhan access token found");
        }

        console.log("DEBUG: Sending request to Dhan with token:");
        console.log(`Token: ${record.accessToken.substring(0, 30)}...${record.accessToken.slice(-10)}`);
        console.log("Token length:", record.accessToken.length);

        try {
            const res = await axios.get("https://api.dhan.co/v2/profile", {  // Keep /v2/profile
                headers: {
                    "access-token": record.accessToken,  // ← FIXED: No "Bearer"
                    "Accept": "application/json"
                },
                timeout: 10000
            });

            console.log("Dhan Profile SUCCESS:", res.data);
            return res.data;

        } catch (err) {
            console.error("Dhan Profile FAILED:");
            console.error("Status:", err.response?.status);
            console.error("Data:", err.response?.data);
            console.error("Headers sent:", err.config?.headers);
            throw err;
        }
    };

    BrokerConnection.remoteMethod("getProfile", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/profile", verb: "get" },
    });

    BrokerConnection.getHoldings = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        const res = await axios.get("https://api.dhan.co/v2/holdings", {
            headers: {
                "access-token": record.accessToken   // ← SAME HEADER HERE
            }
        });

        console.log(`HOLDINGS SUCCESS → ${res.data.length} items`);
        return res.data;  // returns array directly
    };

    BrokerConnection.remoteMethod("getHoldings", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/holdings", verb: "get" },
    });

    BrokerConnection.getPortfolio = async function (req) {
        const userId = req.accessToken.userId;
        const record = await getDhanRecord(userId);

        if (!record.accessToken) throw new Error("No Dhan access token");

        console.log("Fetching Dhan Portfolio (Holdings + Positions)...");

        try {
            // Fetch Holdings
            const holdingsRes = await axios.get("https://api.dhan.co/v2/holdings", {
                headers: { "access-token": record.accessToken }
            });
            const holdings = holdingsRes.data || [];

            // Fetch Positions (for P&L)
            const positionsRes = await axios.get("https://api.dhan.co/v2/positions", {
                headers: { "access-token": record.accessToken }
            });
            const positions = positionsRes.data || [];

            // Merge: Holdings first, then add positions (avoid duplicates by symbol)
            const merged = [...holdings];
            positions.forEach(pos => {
                const existing = merged.find(h => h.tradingSymbol === pos.tradingSymbol);
                if (existing) {
                    // Add P&L to holding
                    existing.unrealizedProfitLoss = pos.unrealizedProfit || 0;
                    existing.realizedProfitLoss = pos.realizedProfit || 0;
                    existing.ltp = pos.buyAvg + (pos.unrealizedProfit / pos.netQty) || 0;  // Approximate LTP from MTM
                    existing.holdingQuantity = pos.netQty || 0;
                    existing.exchangeSegment = pos.exchangeSegment;
                } else {
                    // Add position as standalone
                    merged.push({
                        ...pos,
                        isin: pos.securityId,
                        holdingQuantity: pos.netQty || 0,
                        avgCostPrice: pos.buyAvg || 0,
                        unrealizedProfitLoss: pos.unrealizedProfit || 0,
                        realizedProfitLoss: pos.realizedProfit || 0,
                        ltp: pos.buyAvg + (pos.unrealizedProfit / pos.netQty) || 0,
                        exchangeSegment: pos.exchangeSegment
                    });
                }
            });

            console.log(`PORTFOLIO SUCCESS → ${merged.length} items (Holdings: ${holdings.length}, Positions: ${positions.length})`);
            return merged;
        } catch (err) {
            console.error("Portfolio FAILED:", err.response?.status, err.response?.data);
            throw err;
        }
    };

    BrokerConnection.remoteMethod("getPortfolio", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/portfolio", verb: "get" },
    });
};