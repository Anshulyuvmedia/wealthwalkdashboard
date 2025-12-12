// common/models/broker-connection/services/funds.service.js
const axios = require("axios");
const cache = require("../../util/cache");

// Auto-detect environment
const DHAN_ENV = process.env.DHAN_ENV || "production";
const isSandbox = DHAN_ENV === "sandbox";

const API_BASE = isSandbox
    ? "https://sandbox-api.dhan.co/v2"
    : "https://api.dhan.co/v2";

console.log(`Dhan Funds Service → Using ${isSandbox ? "SANDBOX" : "PRODUCTION"}: ${API_BASE}`);

module.exports = function (BrokerConnection) {

    const dhanClient = (accessToken) =>
        axios.create({
            baseURL: API_BASE,
            headers: {
                "access-token": accessToken,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            timeout: 15000,
        });

    // ===================================================================
    // 1. Get Funds
    // ===================================================================
    BrokerConnection.getFunds = async function (req) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const cacheKey = `dhan:funds:${userId}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            console.log("Funds served from cache");
            return cached;
        }

        try {
            const record = await BrokerConnection.getDhanRecord(userId);
            if (!record || !record.accessToken) {
                throw new Error("No Dhan access token found for user");
            }

            const client = dhanClient(record.accessToken);
            console.log('Funds client created for user:', userId); // Fixed: was consolelog
            const res = await client.get("/fundlimit");

            if (!res.ok) {
                throw new Error(`Dhan API responded with status: ${res.status}`);
            }

            const raw = res.data || {};
            console.log("Raw funds response:", raw); // Add logging to debug response structure

            const funds = {
                availableBalance: Number(raw.availableBalance || raw.availabelBalance || raw.cash || raw.availableFunds || 0),
                withdrawableBalance: Number(raw.withdrawableBalance || raw.availableBalance || 0),
                usedMargin: Number(raw.usedMargin || raw.marginUsed || 0),
                totalBalance: Number(raw.totalBalance || raw.collateralValue || raw.availableBalance || 0),
                blockedAmount: Number(raw.blockedAmount || raw.blockedFunds || 0),
                utilizedAmount: Number(raw.utilizedAmount || raw.utilisedCollateral || 0),
                updatedAt: new Date().toISOString(),
                environment: isSandbox ? "sandbox" : "production",
            };

            console.log("Processed funds:", funds); // Log final processed data

            await cache.set(cacheKey, funds, 15);
            return funds;
        } catch (err) {
            console.error("getFunds error:", {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                userId
            });
            throw new Error(`Failed to fetch funds from Dhan: ${err.message}`);
        }
    };

    // ===================================================================
    // 2. Margin Calculator
    // ===================================================================
    BrokerConnection.calculateMargin = async function (req, orderData) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");
        if (!orderData || typeof orderData !== "object") throw new Error("Order data required");

        try {
            const record = await BrokerConnection.getDhanRecord(userId);
            if (!record || !record.accessToken) {
                throw new Error("No Dhan access token found for user");
            }

            const payload = {
                dhanClientId: record.clientId,
                transactionType: orderData.transactionType?.toUpperCase(),
                exchangeSegment: orderData.exchangeSegment || "NSE_EQ",
                productType: orderData.productType || "INTRADAY",
                securityId: String(orderData.securityId),
                quantity: Number(orderData.quantity),
                price: Number(orderData.price || 0),
                ...(orderData.triggerPrice !== undefined && { triggerPrice: Number(orderData.triggerPrice) }),
            };

            const res = await axios.post(`${API_BASE}/margincalculator`, payload, {
                headers: { "access-token": record.accessToken },
            });

            if (!res.ok) {
                throw new Error(`Margin calculator API responded with status: ${res.status}`);
            }

            return {
                ...res.data,
                calculatedAt: new Date().toISOString(),
                environment: isSandbox ? "sandbox" : "production",
            };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.error("calculateMargin error:", {
                message: msg,
                status: err.response?.status,
                payload
            });
            throw new Error(`Margin calculation failed: ${msg}`);
        }
    };

    // ===================================================================
    // 3. Get Ledger
    // ===================================================================
    BrokerConnection.getLedger = async function (req, query = {}) {
        const userId = req.accessToken?.userId;
        if (!userId) throw new Error("Unauthorized");

        const fromDate = query.fromDate || "2024-01-01";
        const toDate = query.toDate || new Date().toISOString().split("T")[0];

        const cacheKey = `dhan:ledger:${userId}:${fromDate}:${toDate}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            console.log("Ledger served from cache");
            return cached;
        }

        try {
            const record = await BrokerConnection.getDhanRecord(userId);
            if (!record || !record.accessToken) {
                throw new Error("No Dhan access token found for user");
            }

            const res = await axios.get(`${API_BASE}/ledger`, {
                headers: { "access-token": record.accessToken },
                params: {
                    "from-date": fromDate,
                    "to-date": toDate,
                },
                timeout: 15000,
            });

            if (!res.ok) {
                throw new Error(`Ledger API responded with status: ${res.status}`);
            }

            const ledger = Array.isArray(res.data) ? res.data : [];

            await cache.set(cacheKey, ledger, 120); // 2 min cache
            return ledger;
        } catch (err) {
            console.error("getLedger error:", {
                message: err.message,
                status: err.response?.status,
                fromDate,
                toDate,
                userId
            });
            throw new Error(`Failed to fetch ledger from Dhan: ${err.message}`);
        }
    };

    // ===================================================================
    // Remote Methods
    // ===================================================================
    BrokerConnection.remoteMethod("getFunds", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { path: "/funds", verb: "get" },
    });

    BrokerConnection.remoteMethod("calculateMargin", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "body" }, required: true },
        ],
        returns: { root: true },
        http: { path: "/margin-calculator", verb: "post" },
    });

    BrokerConnection.remoteMethod("getLedger", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "query" } },
        ],
        returns: { root: true },
        http: { path: "/ledger", verb: "get" },
    });
};