'use strict';
const axios = require('axios');

module.exports = function (ForexRate) {
    const BASE_URL = 'https://api.india.delta.exchange/v2';
    const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com'; // Twelve Data API base
    const API_KEY = 'YOUR_API_KEY'; // Replace with your Twelve Data API key

    async function getProducts(contractTypes = 'perpetual_futures,call_options,put_options') {
        try {
            // const response = await axios.get(`${BASE_URL}/products?contract_types=${contractTypes}`);
            // console.log('Raw products count:', response.data.result?.length || 0);
            // console.log('Sample products (first 10):', response.data.result?.slice(0, 10).map(p => ({
            //     symbol: p.symbol,
            //     contract_type: p.contract_type,
            //     underlying: p.underlying_asset?.symbol || 'N/A'
            // })));
            // Log potential forex/commodity products
            // console.log('Potential forex/commodity products:', response.data.result
            //     .filter(p => p.symbol.match(/^(EURUSD|USDJPY|GBPUSD|USDCHF|XAUUSD|CLUSD)/) ||
            //         ['EUR', 'GBP', 'JPY', 'CHF', 'XAU', 'CL'].includes(p.underlying_asset?.symbol?.toUpperCase()))
            //     .map(p => ({ symbol: p.symbol, contract_type: p.contract_type, underlying: p.underlying_asset?.symbol || 'N/A' })));
            if (!response.data || !Array.isArray(response.data.result)) {
                throw new Error('Invalid or empty products data from API');
            }
            return response.data.result;
        } catch (error) {
            console.error('Error fetching products:', error.message, error.response?.data);
            throw error;
        }
    }

    function categorizeSymbols(products) {
        const categories = { forex: [], crypto: [], binary: [], commodity: [] };
        let unmatched = []; // For debugging
        products.forEach(product => {
            const symbol = product.symbol;
            const underlying = product.underlying_asset?.symbol;
            if (!underlying) {
                unmatched.push({ symbol, reason: 'No underlying' });
                categories.crypto.push(symbol); // Fallback
                return;
            }
            if (product.contract_type === 'perpetual_futures') {
                const upperUnderlying = underlying.toUpperCase();
                if (['EUR', 'GBP', 'JPY', 'CHF'].includes(upperUnderlying)) {
                    categories.forex.push(symbol);
                } else if (['XAU', 'CL'].includes(upperUnderlying)) {
                    categories.commodity.push(symbol);
                } else if (['BTC', 'ETH', 'SOL', 'XRP', 'AVAX', 'DOGE'].some(u => upperUnderlying.includes(u))) { // Flexible match
                    categories.crypto.push(symbol);
                } else {
                    unmatched.push({ symbol, underlying, reason: 'Unmatched underlying' });
                    categories.crypto.push(symbol);
                }
            } else if (['call_options', 'put_options'].includes(product.contract_type)) {
                categories.binary.push(symbol);
            } else {
                unmatched.push({ symbol, reason: `Unknown contract_type: ${product.contract_type}` });
            }
        });
        // console.log('Unmatched products:', unmatched); // Log for diagnosis
        // console.log('Categorized symbols by category:', categories);
        return categories;
    }

    // New: Fetch forex data from Twelve Data
    async function fetchForexData() {
        try {
            const symbols = 'EUR/USD,GBP/USD,USD/JPY,USD/CHF'; // Common forex pairs
            const response = await axios.get(`${TWELVE_DATA_BASE_URL}/quote?symbol=${symbols}&apikey=${API_KEY}&source=Realtime`);
            const quotes = response.data; // Array of quotes if multiple symbols
            const forexResults = [];
            if (Array.isArray(quotes)) {
                quotes.forEach(quote => {
                    const rate = parseFloat(quote.close) || 0;
                    const changePercent = parseFloat(quote.change_pct) || 0;
                    const timestamp = new Date(quote.datetime);
                    const currencyPair = quote.symbol; // e.g., "EUR/USD"

                    const result = {
                        assetType: 'forex',
                        currencyPair,
                        rate,
                        changePercent,
                        timestamp,
                        isDelayed: false // Realtime source
                    };

                    forexResults.push(result);

                    // Upsert to database
                    ForexRate.upsertWithWhere(
                        { currencyPair: result.currencyPair, assetType: result.assetType },
                        result,
                        { validate: true }
                    ).catch(err => console.error(`Error saving forex ${currencyPair}:`, err.message));
                });
            }
            // console.log('Fetched forex data from Twelve Data:', forexResults);
            return forexResults;
        } catch (error) {
            console.error('Error fetching forex from Twelve Data:', error.message);
            // Fallback: Static data if API fails
            const fallbackResults = [
                { assetType: 'forex', currencyPair: 'EUR/USD', rate: 1.1034, changePercent: 0.5, timestamp: new Date(), isDelayed: true },
                { assetType: 'forex', currencyPair: 'GBP/USD', rate: 1.3125, changePercent: -0.2, timestamp: new Date(), isDelayed: true }
            ];
            fallbackResults.forEach(result => {
                ForexRate.upsertWithWhere(
                    { currencyPair: result.currencyPair, assetType: result.assetType },
                    result,
                    { validate: true }
                ).catch(err => console.error(`Error saving fallback forex ${result.currencyPair}:`, err.message));
            });
            console.log('Using fallback forex data:', fallbackResults);
            return fallbackResults;
        }
    }

    // New: Fetch commodity data from Twelve Data
    async function fetchCommodityData() {
        try {
            const symbols = 'XAU/USD,CL/USD'; // Gold and Crude Oil
            const response = await axios.get(`${TWELVE_DATA_BASE_URL}/quote?symbol=${symbols}&apikey=${API_KEY}&source=Realtime`);
            const quotes = response.data; // Array of quotes
            const commodityResults = [];
            if (Array.isArray(quotes)) {
                quotes.forEach(quote => {
                    const rate = parseFloat(quote.close) || 0;
                    const changePercent = parseFloat(quote.change_pct) || 0;
                    const timestamp = new Date(quote.datetime);
                    const currencyPair = quote.symbol; // e.g., "XAU/USD"

                    const result = {
                        assetType: 'commodity',
                        currencyPair,
                        rate,
                        changePercent,
                        timestamp,
                        isDelayed: false
                    };

                    commodityResults.push(result);

                    // Upsert to database
                    ForexRate.upsertWithWhere(
                        { currencyPair: result.currencyPair, assetType: result.assetType },
                        result,
                        { validate: true }
                    ).catch(err => console.error(`Error saving commodity ${currencyPair}:`, err.message));
                });
            }
            console.log('Fetched commodity data from Twelve Data:', commodityResults);
            return commodityResults;
        } catch (error) {
            console.error('Error fetching commodity from Twelve Data:', error.message);
            // Fallback: Static data
            const fallbackResults = [
                { assetType: 'commodity', currencyPair: 'XAU/USD', rate: 1800.50, changePercent: 1.2, timestamp: new Date(), isDelayed: true },
                { assetType: 'commodity', currencyPair: 'CL/USD', rate: 75.25, changePercent: -0.8, timestamp: new Date(), isDelayed: true }
            ];
            fallbackResults.forEach(result => {
                ForexRate.upsertWithWhere(
                    { currencyPair: result.currencyPair, assetType: result.assetType },
                    result,
                    { validate: true }
                ).catch(err => console.error(`Error saving fallback commodity ${result.currencyPair}:`, err.message));
            });
            console.log('Using fallback commodity data:', fallbackResults);
            return fallbackResults;
        }
    }

    ForexRate.fetchData = async function () {
        try {
            const products = await getProducts();
            if (products.length === 0) {
                throw new Error('No products returned from Delta India API');
            }
            const categories = categorizeSymbols(products);
            let allResults = [];

            // Fetch forex and commodity from Twelve Data
            const forexResults = await fetchForexData();
            const commodityResults = await fetchCommodityData();
            allResults = [...allResults, ...forexResults, ...commodityResults];

            // Fetch crypto and binary from Delta Exchange
            for (const [assetType, symbols] of Object.entries(categories)) {
                for (const symbol of symbols.slice(0, 50)) {
                    try {
                        const response = await axios.get(`${BASE_URL}/tickers/${symbol}`);
                        let data = response.data.result;
                        let rate = 0;
                        let changePercent = 0;
                        let timestamp = new Date();

                        if (data) {
                            if (Array.isArray(data)) data = data[0] || {};
                            else if (typeof data === 'object') data = data;
                            rate = parseFloat(data.mark_price) || parseFloat(data.last_price) || 0;
                            changePercent = parseFloat(data.mark_change_24h) || parseFloat(data.change_percent) || 0;
                            timestamp = data.time ? new Date(data.time) : new Date(data.timestamp ? data.timestamp / 1000 : Date.now());
                        } else {
                            console.warn(`No live ticker data for ${symbol}, using fallback`);
                        }

                        const underlying = (data && data.underlying_asset_symbol) || products.find(p => p.symbol === symbol)?.underlying_asset?.symbol || symbol.split('-')[0] || symbol;
                        const currencyPair = `${underlying.toUpperCase()}/USD`.toUpperCase();

                        const result = {
                            assetType,
                            currencyPair,
                            rate,
                            changePercent,
                            timestamp,
                            isDelayed: !data || !data.time
                        };

                        await ForexRate.upsertWithWhere(
                            { currencyPair: result.currencyPair, assetType: result.assetType },
                            result,
                            { validate: true }
                        );
                        allResults.push(result);
                    } catch (tickerError) {
                        console.error(`Error fetching ticker for ${symbol}:`, tickerError.message, tickerError.response?.data);
                        const currencyPair = `${symbol.split('-')[0] || symbol}/USD`.toUpperCase();
                        const result = {
                            assetType,
                            currencyPair,
                            rate: 0,
                            changePercent: 0,
                            timestamp: new Date(),
                            isDelayed: true
                        };
                        await ForexRate.upsertWithWhere(
                            { currencyPair: result.currencyPair, assetType: result.assetType },
                            result,
                            { validate: true }
                        );
                        allResults.push(result);
                    }
                }
            }

            if (allResults.length === 0) {
                console.warn('No valid data fetched, returning empty array with warning');
            }
            console.log('Fetched and saved all Delta India + Twelve Data:', allResults.length);
            return allResults;
        } catch (error) {
            console.error('Error fetching data:', error.message, error.response?.data);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    };

    ForexRate.remoteMethod('fetchData', {
        returns: { arg: 'data', type: 'array' },
        http: { path: '/fetch', verb: 'get' },
        description: 'Fetches live or delayed data for top 50 products per asset type from Delta Exchange India API'
    });

    ForexRate.getProductsList = async function () {
        try {
            const rates = await ForexRate.find({
                order: 'timestamp DESC',
                limit: 200,
                fields: { currencyPair: true, rate: true, assetType: true, isDelayed: true, changePercent: true, timestamp: true }
            });
            const grouped = rates.reduce((acc, rate) => {
                if (!acc[rate.assetType]) acc[rate.assetType] = [];
                acc[rate.assetType].push({
                    name: rate.currencyPair,
                    rate: rate.rate,
                    changePercent: rate.changePercent,
                    lastUpdated: rate.timestamp.toISOString(),
                    isDelayed: rate.isDelayed
                });
                return acc;
            }, { forex: [], crypto: [], binary: [], commodity: [] });
            // console.log('Products list fetched:', grouped);
            return grouped;
        } catch (error) {
            console.error('Error in getProductsList:', error.message);
            throw new Error(`Failed to fetch products list: ${error.message}`);
        }
    };

    ForexRate.remoteMethod('getProductsList', {
        returns: { arg: 'data', type: 'object' },
        http: { path: '/products', verb: 'get' },
        description: 'Gets list of products with current rates grouped by asset type'
    });

    ForexRate.getProductDetail = async function (currencyPair, assetType) {
        try {
            const searchCurrencyPair = currencyPair.toUpperCase();
            const searchAssetType = assetType.toLowerCase(); // Match database's lowercase 'crypto'
            // console.log(`Searching for currencyPair=${searchCurrencyPair}, assetType=${searchAssetType}`);

            // Try exact match first - Use string format for order in LoopBack/Sequelize compatibility
            let rate = await ForexRate.findOne({
                where: {
                    currencyPair: searchCurrencyPair,
                    assetType: searchAssetType
                },
                order: 'timestamp DESC', // Corrected order syntax for LoopBack
                // logging: (query) => console.log('SQL Query:', query) // Log raw SQL query
            });

            // If not found, try alternative currencyPair format
            if (!rate) {
                const alternativeCurrencyPair = searchCurrencyPair.replace('/', '-');
                console.log(`Trying alternative currencyPair=${alternativeCurrencyPair}`);
                rate = await ForexRate.findOne({
                    where: {
                        currencyPair: alternativeCurrencyPair,
                        assetType: searchAssetType
                    },
                    order: 'timestamp DESC', // Corrected order syntax
                    logging: (query) => console.log('SQL Query:', query)
                });
            }

            if (!rate) {
                console.log(`No records found for currencyPair=${searchCurrencyPair} or ${alternativeCurrencyPair}, assetType=${searchAssetType}`);
                throw new Error('Product not found');
            }

            const detail = {
                name: rate.currencyPair,
                rate: rate.rate,
                changePercent: rate.changePercent,
                lastUpdated: rate.timestamp.toISOString(),
                isDelayed: rate.isDelayed,
                assetType: rate.assetType
            };
            // console.log('Product detail fetched:', detail);
            return detail;
        } catch (error) {
            console.error('Error in getProductDetail:', error.message);
            throw new Error(`Failed to fetch product detail: ${error.message}`);
        }
    };

    ForexRate.remoteMethod('getProductDetail', {
        accepts: [
            { arg: 'currencyPair', type: 'string', required: true },
            { arg: 'assetType', type: 'string', required: true }
        ],
        returns: { arg: 'data', type: 'object' },
        http: { path: '/product-detail', verb: 'get' },
        description: 'Gets detailed data for a single product'
    });
};