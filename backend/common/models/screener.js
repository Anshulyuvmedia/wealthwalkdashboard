// common/models/screener.js
const cron = require('node-cron');

module.exports = function (Screener) {

    // GET /api/screeners/{id}/stocks
    Screener.stocks = async function (id) {
        const app = Screener.app;
        const Stock = app.models.Stocks;

        let filter = { limit: 50 };

        switch (id) {
            case 'breakouts':
                filter.where = { isBreakout: true };
                break;
            case 'gainers':
                filter = {
                    where: { changePercent: { gt: 0 } },
                    order: 'changePercent DESC'
                };
                break;
            case 'losers':
                filter = {
                    where: { changePercent: { lt: 0 } },
                    order: 'changePercent ASC'
                };
                break;
            case 'oversold':
                filter = {
                    where: { rsi: { lt: 30 } },
                    order: 'rsi ASC'
                };
                break;
            case 'overbought':
                filter = {
                    where: { rsi: { gt: 70 } },
                    order: 'rsi DESC'
                };
                break;
            case 'volume':
                filter = {
                    where: { volume: { gt: 10000000 } },
                    order: 'volume DESC'
                };
                break;
            default:
                return [];
        }

        try {
            return await Stock.find(filter);
        } catch (err) {
            throw err;
        }
    };

    Screener.remoteMethod('stocks', {
        accepts: [{ arg: 'id', type: 'string', required: true }],
        returns: { arg: 'stocks', type: ['Stock'], root: true },
        http: { path: '/:id/stocks', verb: 'get' }
    });

    // AUTO REFRESH DUMMY DATA + UPDATE SUBTITLE COUNTS EVERY 3 MINUTES
    async function refreshDummyData() {
        const app = Screener.app;
        if (!app || !app.models.Stocks) {
            console.log("App or Stock model not ready yet, skipping refresh...");
            return;
        }

        const Stock = app.models.Stocks;

        const symbols = [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "BHARTIARTL", "ICICIBANK", "SBIN",
            "ADANIPORTS", "WIPRO", "LT", "MARUTI", "AXISBANK", "KOTAKBANK", "TITAN",
            "ONGC", "NTPC", "SUNPHARMA", "ASIANPAINT", "HCLTECH", "POWERGRID", "BAJFINANCE",
            "ULTRACEMCO", "NESTLEIND", "TECHM", "JSWSTEEL"
        ];

        const updates = symbols.map(symbol => {
            const changePercent = (Math.random() * 20 - 10).toFixed(2);
            const price = Math.floor(500 + Math.random() * 4000);
            const volume = Math.floor(Math.random() * 50_000_000);
            const rsi = Math.floor(Math.random() * 80 + 10);
            const isBreakout = parseFloat(changePercent) > 5 && Math.random() > 0.4;

            return {
                symbol,
                companyName: symbol,
                price,
                changePercent: parseFloat(changePercent),
                volume,
                rsi,
                isBreakout,
                updatedAt: new Date()
            };
        });

        try {
            // Refresh stock data
            await Stock.destroyAll();
            await Stock.create(updates);

            // Count stocks in each category
            const counts = {
                breakouts: await Stock.count({ isBreakout: true }),
                gainers: await Stock.count({ changePercent: { gt: 0 } }),
                losers: await Stock.count({ changePercent: { lt: 0 } }),
                oversold: await Stock.count({ rsi: { lt: 30 } }),
                overbought: await Stock.count({ rsi: { gt: 70 } }),
                volume: await Stock.count({ volume: { gt: 10000000 } })
            };

            // UPDATE SUBTITLES SAFELY — using replaceById (NO validation errors)
            await Promise.all([
                Screener.replaceById('breakouts', { subtitle: `${counts.breakouts} Stocks` }),
                Screener.replaceById('gainers', { subtitle: `${counts.gainers} Stocks` }),
                Screener.replaceById('losers', { subtitle: `${counts.losers} Stocks` }),
                Screener.replaceById('oversold', { subtitle: `${counts.oversold} Stocks` }),
                Screener.replaceById('overbought', { subtitle: `${counts.overbought} Stocks` }),
                Screener.replaceById('volume', { subtitle: `${counts.volume} Stocks` })
            ]);

            console.log(`Dummy data refreshed! → Breakouts: ${counts.breakouts} | Gainers: ${counts.gainers} | Volume: ${counts.volume}`);
        } catch (err) {
            console.error("Error in refreshDummyData:", err);
        }
    }

    // Start cron job only after app is fully booted
    Screener.observe('loaded', function (ctx, next) {
        // Initial refresh after 3 seconds
        setTimeout(() => {
            console.log("Initial dummy data load...");
            refreshDummyData();
        }, 3000);

        // Then every 3 minutes
        cron.schedule('*/3 * * * *', () => {
            console.log("Running scheduled dummy data refresh...");
            refreshDummyData();
        });

        next();
    });
};