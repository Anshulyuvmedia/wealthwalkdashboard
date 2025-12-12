// common/models/broker-connection/broker-connection.js
module.exports = async function (BrokerConnection) {
    console.log("Dhan Broker → Initializing (lazy loading enabled)...");

    // ===================================================================
    // 1. Shared getDhanRecord with sandbox fallback
    // ===================================================================
    BrokerConnection.getDhanRecord = async function (userId) {
        if (!userId) throw new Error("userId is required");

        const userIdStr = String(userId);

        let record = await BrokerConnection.findOne({
            where: { userId: userIdStr, broker: "dhan" },
        });

        if (!record && process.env.DHAN_ENV === "sandbox") {
            console.log("SANDBOX MODE: Using static sandbox credentials");
            return {
                userId: userIdStr,
                broker: "dhan",
                clientId: process.env.DHAN_SANDBOX_CLIENT_ID,
                accessToken: process.env.DHAN_SANDBOX_ACCESSTOKEN,
                dhanClientId: process.env.DHAN_SANDBOX_CLIENT_ID,
                name: "Sandbox User",
                email: "sandbox@dhan.co",
                createdAt: new Date().toISOString(),
            };
        }

        if (!record?.accessToken) {
            throw new Error("Dhan account not linked or token missing");
        }

        return record;
    };

    // ===================================================================
    // 2. Fake /profile for sandbox
    // ===================================================================
    BrokerConnection.remoteMethod("getProfile", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/profile", verb: "get" },
    });

    BrokerConnection.getProfile = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const record = await BrokerConnection.getDhanRecord(userId);

        if (process.env.DHAN_ENV === "sandbox") {
            return {
                dhanClientId: process.env.DHAN_SANDBOX_CLIENT_ID,
                name: "Sandbox User",
                email: "sandbox@dhan.co",
                phone: "9999999999",
            };
        }

        const axios = require("axios");
        const res = await axios.get("https://api.dhan.co/v2/profile", {
            headers: { "access-token": record.accessToken },
        });
        return res.data;
    };

    // ===================================================================
    // 3. Wait for app (needed only for market.service)
    // ===================================================================
    const app = await new Promise((resolve) => {
        if (BrokerConnection.app) {
            resolve(BrokerConnection.app);
        } else {
            BrokerConnection.once("attached", () => resolve(BrokerConnection.app));
        }
    });

    // ===================================================================
    // 4. LAZY LOAD SERVICES ONLY WHEN FIRST USED
    // ===================================================================
    if (!BrokerConnection._lazyServices) {
        BrokerConnection._lazyServices = new Set();
    }

    const lazyLoad = (serviceFile) => {
        if (BrokerConnection._lazyServices.has(serviceFile)) return;

        console.log(`Lazy loading Dhan service: ${serviceFile}`);
        try {
            // All services are in the subfolder broker-connection/
            require(`./broker-connection/${serviceFile}`)(BrokerConnection, app);
            BrokerConnection._lazyServices.add(serviceFile);
        } catch (err) {
            console.error(`Failed to load service ${serviceFile}:`, err.message);
        }
    };

    // Trigger lazy loading based on method name
    BrokerConnection.beforeRemote('**', function (ctx, unused, next) {
        const method = ctx.method.name;

        const mapping = {
            // Portfolio
            getHoldings: 'portfolio.service',
            getPositions: 'portfolio.service',
            getPortfolioSummary: 'portfolio.service',
            getPortfolio: 'portfolio.service',

            // Funds
            getFunds: 'funds.service',

            // Orders / Tradebook
            getTradeBook: 'orders.service',
            orderHistoryBySecurity: 'orders.service',
            getTodayPnL: 'orders.service',

            // Market (live prices)
            startLiveFeed: 'market.service',
            subscribeSymbols: 'market.service',
        };

        const serviceFile = mapping[method] ||
            (method.toLowerCase().includes('order') && 'orders.service') ||
            (method.toLowerCase().includes('portfolio') && 'portfolio.service') ||
            (method.toLowerCase().includes('fund') && 'funds.service');

        if (serviceFile) {
            lazyLoad(serviceFile);
        }

        next();
    });

    // ===================================================================
    // 5. Debug endpoint
    // ===================================================================
    BrokerConnection.remoteMethod("debugEnv", {
        returns: { root: true },
        http: { path: "/debug-env", verb: "get" },
    });

    BrokerConnection.debugEnv = async function () {
        const isSandbox = process.env.DHAN_ENV === "sandbox";

        return {
            environment: isSandbox ? "SANDBOX" : "PRODUCTION",
            lazyLoading: "enabled",
            servicesLoaded: Array.from(BrokerConnection._lazyServices || []),
            hasSandboxToken: !!process.env.DHAN_SANDBOX_ACCESSTOKEN,
            timestamp: new Date().toISOString(),
        };
    };

    console.log("Dhan Broker → Ready (lazy loading active)");
};