const WebSocket = require('ws');
const WS_CLIENTS = new Map(); // clientId -> ws
const redis = require('../../server/redis');

module.exports = function (DhanInstrument) {


    DhanInstrument.search = async function (q, segment, type, limit = 30) {
        const filter = {
            where: { and: [] },
            limit
        };

        if (q) {
            filter.where.and.push({
                or: [
                    { symbol: { like: q, options: 'i' } },
                    { displayName: { like: q, options: 'i' } }
                ]
            });
        }

        if (segment) {
            filter.where.and.push({ exchangeSegment: segment });
        }

        if (type) {
            filter.where.and.push({ instrumentType: type });
        }

        return DhanInstrument.find(filter);
    };

    DhanInstrument.remoteMethod('search', {
        accepts: [
            { arg: 'q', type: 'string' },
            { arg: 'segment', type: 'string' },
            { arg: 'type', type: 'string' },
            { arg: 'limit', type: 'number', default: 30 }
        ],
        returns: { arg: 'data', type: ['DhanInstrument'], root: true },
        http: { path: '/search', verb: 'get' }
    });

    DhanInstrument.initSubscription = async function (req, clientId) {
        const brokerToken = req.headers['x-broker-token'];
        if (!brokerToken) throw new Error('Missing broker token');
        if (!req.accessToken?.id) throw new Error('Unauthorized');
        if (!clientId) throw new Error('clientId required');

        const BrokerConnection = DhanInstrument.app.models.BrokerConnection;
        const connection = await BrokerConnection.findOne({ where: { clientId, broker: 'dhan' } });

        if (!connection || connection.accessToken !== brokerToken) {
            throw new Error('Invalid broker session');
        }

        // Prevent duplicate sockets
        if (WS_CLIENTS.has(clientId)) return { status: 'already_connected' };

        const isMarketOpen = () => {
            const now = new Date();
            const t = now.getHours() * 60 + now.getMinutes();
            return t >= 555 && t <= 930; // 9:15–15:30 IST
        };

        // Fetch holdings safely
        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const holdingsRes = await fetch(`${baseUrl}/api/BrokerConnections/holdings`, {
            headers: { Authorization: `Bearer ${req.accessToken.id}`, 'x-broker-token': brokerToken }
        });
        const holdings = await holdingsRes.json();

        const instruments = holdings
            .filter(h => h.securityId)
            .map(h => ({
                ExchangeSegment: h.exchange === 'BSE' ? 'BSE_EQ' : 'NSE_EQ',
                SecurityId: String(h.securityId)
            }));

        if (!instruments.length) return { status: 'empty_portfolio' };
        if (!isMarketOpen()) return { status: 'market_closed' };

        // WebSocket
        const ws = new WebSocket(`wss://api.dhan.co/v2/marketfeed/live?access-token=${brokerToken}&client-id=${clientId}`);

        const redisKey = `dhan:live:${clientId}`;
        let closed = false;

        const safeReconnect = async () => {
            if (closed) return; // Stop if WS is closed manually
            const conn = await BrokerConnection.findOne({ where: { clientId, broker: 'dhan' } });
            if (!conn) return console.log(`[Dhan WS] User ${clientId} disconnected, skipping reconnect`);
            try {
                await DhanInstrument.initSubscription(req, clientId);
            } catch (e) {
                console.warn(`[Dhan WS reconnect] Could not reconnect user ${clientId}:`, e.message);
            }
        };

        ws.on('open', () => {
            ws.send(JSON.stringify({ RequestCode: 15, InstrumentCount: instruments.length, InstrumentList: instruments }));
            console.log(`[Dhan WS] Subscribed ${instruments.length} instruments`);
        });

        ws.on('message', async msg => {
            if (closed) return;
            try {
                const data = JSON.parse(msg.toString());
                if (!Array.isArray(data?.values)) return;
                for (const q of data.values) {
                    if (!q.securityId) continue;
                    await redis.hset(redisKey, q.securityId, JSON.stringify({ ltp: q.ltp, chg: q.chg, ts: Date.now() }));
                }
                await redis.expire(redisKey, 60);
            } catch (e) {
                console.warn('[Dhan WS parse]', e.message);
            }
        });

        ws.on('close', () => {
            closed = true;
            WS_CLIENTS.delete(clientId);
            console.log(`[Dhan WS] Closed for user ${clientId}`);
            setTimeout(safeReconnect, 3000);
        });

        ws.on('error', err => {
            closed = true;
            WS_CLIENTS.delete(clientId);
            console.error('[Dhan WS error]', err.message);
            setTimeout(safeReconnect, 3000);
        });

        // Store WS reference to allow manual disconnect
        WS_CLIENTS.set(clientId, {
            ws,
            close: () => {
                closed = true;
                ws.close();
                WS_CLIENTS.delete(clientId);
                console.log(`[Dhan WS] Manually disconnected user ${clientId}`);
            }
        });

        return { status: 'subscribed', instruments: instruments.length };
    };

    DhanInstrument.remoteMethod('initSubscription', {
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'clientId', type: 'string', required: true, http: { source: 'path' } }
        ],
        returns: { arg: 'data', type: 'object', root: true },
        http: { path: '/user/:clientId/init-subscription', verb: 'post' }
    });

    // Endpoint to fetch live quotes
    DhanInstrument.portfolioQuote = async function (req, clientId) {
        const redisKey = `dhan:live:${clientId}`;
        const data = await redis.hgetall(redisKey);
        if (!data || Object.keys(data).length === 0) return [];
        return Object.entries(data).map(([securityId, v]) => {
            const q = JSON.parse(v);
            return { securityId, ltp: q.ltp, chg: q.chg };
        });
    };

    // Method to manually disconnect WS for a user
    DhanInstrument.disconnectUserWS = function (clientId) {
        const client = WS_CLIENTS.get(clientId);
        if (client) {
            client.close();
        }
    };

};