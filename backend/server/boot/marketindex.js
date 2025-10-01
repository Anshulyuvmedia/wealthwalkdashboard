// File: backend/server/boot/market-index.js
module.exports = function (server) {
    console.log("Market Index API boot script loaded");
    const mongoDB = server.datasources.mongoDB;
    const MarketIndex = server.models.MarketIndex;
    // const getIntradayData = server.datasources.getIntradayData; // Uncomment when API is available

    // Initial static data as a base with realistic index values
    const initialIndicesData = [
        {
            name: "NIFTY 50",
            data: [
                { name: "Others", value: 52.14, color: "#34C759" },
                { name: "HDFCLIFE", value: 12.82, color: "#FF3B30" },
                { name: "JSWSTEEL", value: 12.41, color: "#28A745" },
                { name: "SHRIRAMFIN", value: 12.04, color: "#20C997" },
                { name: "ADANIPORTS", value: 10.32, color: "#17A2B8" },
                { name: "TECHM", value: 9.32, color: "#007BFF" },
                { name: "TITAN", value: 8.76, color: "#6610F2" },
                { name: "Apollohosp", value: 16.90, color: "#28A745" },
                { name: "Grasim", value: 16.80, color: "#20C997" },
                { name: "Ultracemco", value: 19.11, color: "#17A2B8" },
            ],
            change: "145 pts",
            baseValue: 18500, // Approximate NIFTY 50 value
        },
        {
            name: "SENSEX",
            data: [
                { name: "Reliance", value: 28.50, color: "#34C759" },
                { name: "TCS", value: 15.75, color: "#28A745" },
                { name: "HDFC Bank", value: -10.20, color: "#FF3B30" },
                { name: "Infosys", value: 12.30, color: "#20C997" },
                { name: "ICICI Bank", value: 9.80, color: "#17A2B8" },
                { name: "SBI", value: 7.45, color: "#007BFF" },
                { name: "Axis Bank", value: 6.90, color: "#6610F2" },
                { name: "Bajaj Finance", value: 5.60, color: "#28A745" },
                { name: "Kotak Bank", value: 4.80, color: "#20C997" },
                { name: "L&T", value: 3.90, color: "#17A2B8" },
            ],
            change: "320 pts",
            baseValue: 61500, // Approximate SENSEX value
        },
        {
            name: "BANK NIFTY",
            data: [
                { name: "HDFC Bank", value: 25.40, color: "#34C759" },
                { name: "ICICI Bank", value: 20.10, color: "#28A745" },
                { name: "SBI", value: -15.30, color: "#FF3B30" },
                { name: "Axis Bank", value: 12.80, color: "#20C997" },
                { name: "Kotak Bank", value: 10.50, color: "#17A2B8" },
                { name: "IndusInd Bank", value: 8.20, color: "#007BFF" },
                { name: "Bank of Baroda", value: 6.90, color: "#6610F2" },
                { name: "PNB", value: 5.60, color: "#28A745" },
                { name: "Federal Bank", value: 4.30, color: "#20C997" },
                { name: "IDFC First", value: 3.80, color: "#17A2B8" },
            ],
            change: "210 pts",
            baseValue: 45000, // Approximate BANK NIFTY value
        },
        {
            name: "NIFTY IT",
            data: [
                { name: "Infosys", value: 30.20, color: "#34C759" },
                { name: "TCS", value: 25.10, color: "#28A745" },
                { name: "Wipro", value: -8.50, color: "#FF3B30" },
                { name: "HCL Tech", value: 15.30, color: "#20C997" },
                { name: "Tech Mahindra", value: 12.40, color: "#17A2B8" },
                { name: "LTIMindtree", value: 9.80, color: "#007BFF" },
                { name: "Mphasis", value: 7.20, color: "#6610F2" },
                { name: "Coforge", value: 5.90, color: "#28A745" },
                { name: "Persistent", value: 4.60, color: "#20C997" },
                { name: "L&T Tech", value: 3.70, color: "#17A2B8" },
            ],
            change: "180 pts",
            baseValue: 35000, // Approximate NIFTY IT value
        },
    ];

    // Seed initial static data
    MarketIndex.count({}, function (err, count) {
        if (err) throw err;
        if (count === 0) {
            MarketIndex.create(initialIndicesData, function (err) {
                if (err) throw err;
                console.log("Initial market index data seeded successfully");
            });
        }
    });

    // Function to simulate dynamic data with realistic market values
    const simulateDynamicData = () => {
        const updatedIndicesData = initialIndicesData.map((index) => {
            // Calculate total positive weight for normalization
            const totalPositiveWeight = index.data.reduce((sum, item) => sum + (item.value > 0 ? item.value : 0), 0);
            const updatedData = index.data.map((item) => {
                let baseWeight = item.value;
                if (item.value < 0) {
                    baseWeight = 0; // Exclude negative values from normalization
                }
                const adjustedWeight = (baseWeight / totalPositiveWeight) * 100; // Normalize to 100%
                const fluctuation = (Math.random() * 0.5 - 0.25) * adjustedWeight; // ±0.25% fluctuation
                const newWeight = Math.max(0, adjustedWeight + fluctuation); // Ensure non-negative
                return {
                    ...item,
                    value: Number(newWeight.toFixed(2)),
                };
            });

            // Adjust weights to sum to 100% (handle negative values separately)
            const sumPositive = updatedData.reduce((sum, item) => sum + (item.value > 0 ? item.value : 0), 0);
            const adjustmentFactor = 100 / sumPositive;
            const finalData = updatedData.map((item) => ({
                ...item,
                value: item.value > 0 ? Number((item.value * adjustmentFactor).toFixed(2)) : item.value,
            }));

            // Simulate realistic index change (±2% of base value)
            const percentageChange = (Math.random() * 4 - 2) / 100; // -2% to +2%
            const changePoints = Number((index.baseValue * percentageChange).toFixed(0));
            const newChange = `${changePoints} pts`;

            return {
                ...index,
                data: finalData,
                change: newChange,
                baseValue: index.baseValue, // Explicitly preserve baseValue
            };
        });

        updatedIndicesData.forEach((index) => {
            MarketIndex.upsert(index, function (err) {
                if (err) console.error(`Simulation error updating ${index.name}:`, err);
            });
        });
        console.log("Market index data updated with simulated realistic values");
    };

    // Run simulation immediately and then every 30 seconds
    simulateDynamicData(); // Initial run
    setInterval(simulateDynamicData, 30000); // Update every 30 seconds

    // Placeholder for dynamic API integration (uncomment and configure when API is available)
    /*
    const updateMarketIndex = (indexName, data) => {
        const updateData = {
            name: indexName,
            data: [{ name: "Live", value: data.lastTradedPrice || 0, color: "#34C759" }],
            change: `${data.change || 0} pts`,
        };
        MarketIndex.upsert(updateData, function (err) {
            if (err) console.error(`Error updating ${indexName}:`, err);
        });
    };

    const indices = ["NIFTY-I", "SENSEX", "BANKNIFTY", "NIFTYIT"];
    indices.forEach((symbol) => {
        getIntradayData.getcurrentIntraday(symbol, (err, result) => {
            if (!err && result) {
                let indexName;
                switch (symbol) {
                    case "NIFTY-I":
                        indexName = "NIFTY 50";
                        break;
                    case "SENSEX":
                        indexName = "SENSEX";
                        break;
                    case "BANKNIFTY":
                        indexName = "BANK NIFTY";
                        break;
                    case "NIFTYIT":
                        indexName = "NIFTY IT";
                        break;
                    default:
                        indexName = symbol;
                }
                updateMarketIndex(indexName, result);
            } else {
                console.error(`Error fetching intraday data for ${symbol}:`, err);
            }
        });
    });

    setInterval(() => {
        indices.forEach((symbol) => {
            getIntradayData.getcurrentIntraday(symbol, (err, result) => {
                if (!err && result) {
                    let indexName;
                    switch (symbol) {
                        case "NIFTY-I":
                            indexName = "NIFTY 50";
                            break;
                        case "SENSEX":
                            indexName = "SENSEX";
                            break;
                        case "BANKNIFTY":
                            indexName = "BANK NIFTY";
                            break;
                        case "NIFTYIT":
                            indexName = "NIFTY IT";
                            break;
                        default:
                            indexName = symbol;
                    }
                    updateMarketIndex(indexName, result);
                }
            });
        });
    }, 5 * 60 * 1000); // 5 minutes interval
    */

    // Define custom endpoints
    const router = server.loopback.Router();

    router.get("/api/indices", function (req, res) {
        MarketIndex.find({}, function (err, indices) {
            if (err) {
                res.status(500).send({ error: "Error fetching indices" });
                return;
            }
            res.json(indices);
        });
    });

    router.get("/api/indices/:name", function (req, res) {
        const indexName = req.params.name;
        MarketIndex.findOne({ where: { name: indexName } }, function (err, index) {
            if (err) {
                res.status(500).send({ error: "Error fetching index" });
                return;
            }
            if (!index) {
                res.status(404).send({ error: "Index not found" });
                return;
            }
            res.json(index);
        });
    });

    server.use(router);
};