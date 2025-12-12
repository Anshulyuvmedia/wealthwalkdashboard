// common/models/broker-connection/services/auth.service.js
const axios = require("axios");

let app;
console.log("Dhan auth.service.js LOADED", {
    DHAN_ENV: process.env.DHAN_ENV,
    isSandbox: process.env.DHAN_ENV === "sandbox",
    BASE_URL: process.env.BASE_URL,
});

const DHAN_GENERATE_CONSENT = "https://auth.dhan.co/app/generate-consent";
const DHAN_CONSUME_CONSENT = "https://auth.dhan.co/app/consumeApp-consent";
const DHAN_LOGIN_BASE = "https://auth.dhan.co/login/consentApp-login";

module.exports = function (BrokerConnection, loopbackApp) {
    app = loopbackApp;

    const now = () => Date.now();

    const getRecord = async (userId) => {
        const rec = await BrokerConnection.findOne({
            where: { userId: String(userId), broker: "dhan" },
        });
        if (!rec) throw new Error("Dhan credentials not saved for this user");
        return rec;
    };

    // --- Utility: read baseUrl with fallback to request host if missing
    const buildCallbackUrl = (req) => {
        if (process.env.BASE_URL) return `${process.env.BASE_URL}/api/BrokerConnections/callback`;
        try {
            // req may be undefined in some usage paths; guard it
            const host = req?.get?.("host") || req?.headers?.host;
            const proto = req?.headers?.["x-forwarded-proto"] || "https";
            if (host) return `${proto}://${host}/api/BrokerConnections/callback`;
        } catch (e) {
            // ignore and fallback
        }
        // final fallback (will probably be invalid in production)
        return `https://localhost/api/BrokerConnections/callback`;
    };

    // ============================================================
    // 1. Save Credentials (clientId, apiKey, apiSecret)
    // ============================================================
    BrokerConnection.saveCredentials = async function (req, data) {
        const userId = String(req.accessToken?.userId);
        if (!userId) throw new Error("Unauthorized");

        const { clientId, apiKey, apiSecret } = data || {};
        if (!clientId || !apiKey || !apiSecret) {
            throw new Error("clientId, apiKey, apiSecret are required");
        }

        console.log(`[SAVE_CREDENTIALS] user=${userId} clientId=${clientId}`);

        await BrokerConnection.upsertWithWhere(
            { userId, broker: "dhan" },
            {
                userId,
                broker: "dhan",
                clientId: clientId.trim(),
                apiKey: apiKey.trim(),
                apiSecret: apiSecret.trim(),
                linkedAt: new Date(),
                accessToken: null,
            }
        );

        return { success: true };
    };

    // ============================================================
    // 2. START LOGIN (Generate consent -> return loginUrl)
    // ============================================================
    BrokerConnection.startLogin = async function (req) {
        console.log("\n===== [START_LOGIN METHOD ENTER] =====");
        console.log("Headers:", req?.headers);
        console.log("AccessToken:", req?.accessToken);
        console.log("User:", req?.accessToken?.userId);

        const reqUserId = req?.accessToken?.userId;
        if (!reqUserId) {
            console.error("[START_LOGIN] unauthorized request (no accessToken)");
            throw new Error("Not logged in");
        }
        const userId = String(reqUserId);
        console.log("[START_LOGIN] user:", userId);

        const record = await getRecord(userId);

        // compute callback url (prefer env, fallback to request host)
        const CALLBACK_URL = buildCallbackUrl(req);
        console.log("[START_LOGIN] callbackUrl:", CALLBACK_URL);

        const pending = app.get("dhanPendingConsents") || {};

        // Generate consent (Dhan docs: app/generate-consent?client_id=)
        let genRes;
        try {
            console.log("[GENERATE_CONSENT] calling Dhan with clientId:", record.clientId);
            genRes = await axios.post(
                `${DHAN_GENERATE_CONSENT}?client_id=${encodeURIComponent(record.clientId)}`,
                {},
                {
                    headers: {
                        app_id: record.apiKey,
                        app_secret: record.apiSecret,
                    },
                    timeout: 15000,
                }
            );
            console.log("[GENERATE_CONSENT] response:", {
                status: genRes.status,
                data: JSON.stringify(genRes.data, null, 2),
            });
            
        } catch (err) {
            console.error(
                "[GENERATE_CONSENT] failed:",
                err.response?.status,
                err.response?.data || err.message
            );
            // surface useful error message for debugging (but not sensitive secrets)
            throw new Error("Failed to generate Dhan consent. See server logs for details.");
        }

        const consentAppId = genRes?.data?.consentAppId;
        if (!consentAppId) {
            console.error("[GENERATE_CONSENT] no consentAppId in response:", genRes?.data);
            throw new Error("No consentAppId returned from Dhan");
        }

        // Save pending consent session
        pending[consentAppId] = {
            userId,
            createdAt: now(),
            clientId: record.clientId,
        };
        app.set("dhanPendingConsents", pending);
        console.log("[START_LOGIN] pending consents count:", Object.keys(pending).length);

        // Auto cleanup after 10 minutes
        setTimeout(() => {
            const curr = app.get("dhanPendingConsents") || {};
            if (curr[consentAppId]) {
                delete curr[consentAppId];
                app.set("dhanPendingConsents", curr);
                console.log("[PENDING_CLEANUP] removed expired consent:", consentAppId);
            }
        }, 10 * 60 * 1000);

        const loginUrl =
            `${DHAN_LOGIN_BASE}?consentAppId=${encodeURIComponent(consentAppId)}` +
            `&redirect_url=${encodeURIComponent(CALLBACK_URL)}`;

        console.log("[START_LOGIN] loginUrl generated for user:", userId, "consentAppId:", consentAppId);
        return { loginUrl };
    };

    // ============================================================
    // 3. CALLBACK HANDLER (tokenId -> exchange for access token)
    // ============================================================
    BrokerConnection.handleCallback = async function (tokenId, ctx) {
        const remoteIp = ctx?.req?.headers?.["x-forwarded-for"] || ctx?.req?.connection?.remoteAddress;
        console.log("[CALLBACK] received tokenId:", tokenId, "remoteIp:", remoteIp);

        if (!tokenId) {
            console.warn("[CALLBACK] missing tokenId");
            return ctx.res.status(400).send("Missing tokenId");
        }

        const pending = app.get("dhanPendingConsents") || {};
        let session = null;
        let consentAppId = null;

        for (const [id, s] of Object.entries(pending)) {
            if (now() - s.createdAt < 10 * 60 * 1000) {
                session = s;
                consentAppId = id;
                break;
            }
        }

        if (!session) {
            console.warn("[CALLBACK] no matching pending session for tokenId:", tokenId);
            return ctx.res.send(`
        <h1 style="color:#FF6B6B">Session Expired</h1>
        <p>Please return to the app and try connecting again.</p>
        <pre>tokenId: ${tokenId}</pre>
      `);
        }

        console.log("[CALLBACK] matched pending session:", consentAppId, "user:", session.userId);

        let record;
        try {
            record = await getRecord(session.userId);
        } catch (err) {
            console.error("[CALLBACK] getRecord failed:", err.message);
            return ctx.res.status(500).send("Internal server error");
        }

        // consume consent
        let tokenResp;
        try {
            console.log("[CONSUME_CONSENT] calling Dhan to consume tokenId");
            tokenResp = await axios.post(
                `${DHAN_CONSUME_CONSENT}?tokenId=${encodeURIComponent(tokenId)}`,
                {},
                {
                    headers: {
                        app_id: record.apiKey,
                        app_secret: record.apiSecret,
                    },
                    timeout: 15000,
                }
            );
            console.log("[CONSUME_CONSENT] response:", { status: tokenResp.status, data: tokenResp.data });
        } catch (err) {
            console.error("[CONSUME_CONSENT] failed:", err.response?.status, err.response?.data || err.message);
            return ctx.res.status(500).send("Failed to exchange token with Dhan (see server logs)");
        }

        const accessToken = tokenResp?.data?.accessToken;
        if (!accessToken) {
            console.error("[CONSUME_CONSENT] missing accessToken in response:", tokenResp?.data);
            return ctx.res.status(500).send("No access token received from Dhan");
        }

        // Save token (upsert)
        try {
            await BrokerConnection.upsert({
                id: record.id,
                accessToken,
                linkedAt: new Date(),
            });
            console.log("[CALLBACK] accessToken saved for user:", session.userId);
        } catch (err) {
            console.error("[CALLBACK] failed to save access token:", err.message);
            // proceed to cleanup/presentation even on DB error (but log it)
        }

        // cleanup pending
        if (pending[consentAppId]) {
            delete pending[consentAppId];
            app.set("dhanPendingConsents", pending);
            console.log("[CALLBACK] cleaned pending consent:", consentAppId);
        }

        // Success HTML — robustly try to post message to WebView multiple times
        const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </head>
        <body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,Helvetica,sans-serif;">
          <div style="text-align:center;">
            <h1 style="color:#00D09C">Dhan Connected Successfully!</h1>
            <p>You can close this window.</p>
            <pre style="color:#aaa">User: ${session.userId}</pre>
          </div>
          <script>
            (function attemptPost() {
              try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage('DHAN_OAUTH_SUCCESS');
                  console.log('posted DHAN_OAUTH_SUCCESS');
                } else if (window.parent && window.parent.postMessage) {
                  window.parent.postMessage('DHAN_OAUTH_SUCCESS', '*');
                  console.log('posted to parent');
                } else {
                  console.log('no RN bridge yet');
                  setTimeout(attemptPost, 300);
                  return;
                }
              } catch (e) {
                console.log('postMessage error', e);
              }
              setTimeout(() => { try { window.close(); } catch(e) { /* ignore */ } }, 1200);
            })();
          </script>
        </body>
      </html>
    `;

        ctx.res.setHeader("Content-Type", "text/html");
        ctx.res.send(html);
    };

    // ============================================================
    // 4. isLinked() — returns whether access token exists
    // ============================================================
    BrokerConnection.isLinked = async function (req) {
        const userId = String(req.accessToken?.userId);
        const rec = await BrokerConnection.findOne({
            where: { userId, broker: "dhan" },
        });
        return {
            isLinked: !!rec?.accessToken,
            environment: process.env.DHAN_ENV || "production",
        };
    };

    // ============================================================
    // Remote Methods
    // ============================================================
    BrokerConnection.remoteMethod("saveCredentials", {
        accepts: [
            { arg: "req", type: "object", http: { source: "req" } },
            { arg: "data", type: "object", http: { source: "body" } },
        ],
        returns: { root: true },
        http: { verb: "post", path: "/save-credentials" },
    });

    BrokerConnection.remoteMethod("startLogin", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { verb: "get", path: "/start-login" },
    });

    BrokerConnection.remoteMethod("handleCallback", {
        accepts: [
            { arg: "tokenId", type: "string", source: "query" },
            { arg: "ctx", type: "object", http: { source: "context" } },
        ],
        returns: { root: true },
        http: { verb: "get", path: "/callback" },
    });

    BrokerConnection.remoteMethod("isLinked", {
        accepts: [{ arg: "req", type: "object", http: { source: "req" } }],
        returns: { root: true },
        http: { verb: "get", path: "/is-linked" },
    });
};
