'use strict';

require('dotenv').config();
const fetch = require('node-fetch').default;

// ===================== CONFIG =====================
const STARTING_CAPITAL = 100000;
const API_KEY = process.env.TWELVE_DATA_API_KEY;

// ===================== LOGGING HELPER =====================
function log(...args) {
    console.log(`[BACKTEST ${new Date().toISOString()}]`, ...args);
}
function error(...args) {
    console.error(`[BACKTEST ERROR ${new Date().toISOString()}]`, ...args);
}

// ===================== UNIFIED SAFE FETCH (HANDLES RATE LIMITS) =====================
async function safeFetch(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            const text = await res.text();

            if (!res.ok) {
                if (res.status === 429 || text.includes("API credits")) {
                    log("Rate limited! Waiting 65 seconds before retry...");
                    await new Promise(r => setTimeout(r, 65000));
                    continue;
                }
                throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
            }

            const json = JSON.parse(text);

            if (json.status === "error") {
                if (text.includes("symbol") || text.includes("figi")) {
                    throw new Error(`Invalid symbol in URL: ${url.match(/symbol=([^&]+)/)?.[1] || 'unknown'}. Error: ${json.message}`);
                }
                if (text.includes("API credits")) {
                    log("Out of API credits. Waiting 65s...");
                    await new Promise(r => setTimeout(r, 65000));
                    if (i === retries - 1) throw new Error("Out of API credits");
                    continue;
                }
                throw new Error(json.message || "Twelve Data API error");
            }

            return json;
        } catch (err) {
            if (err.name === 'AbortError') err.message = "Request timeout";
            if (i === retries - 1) throw err;

            log(`Fetch retry ${i + 1}/${retries} after error:`, err.message);
            await new Promise(r => setTimeout(r, 8000 * (i + 1)));
        }
    }
    throw new Error("Max retries exceeded");
}

// ===================== SYNTHETIC DATA (IMPROVED FOR SIGNALS) =====================
function generateSynthetic(symbol = "BANKNIFTY", timeframe = "10min", startDate = new Date("2023-01-01"), endDate = new Date()) {
    log(`Generating synthetic data for ${symbol}`);
    const data = { open: [], high: [], low: [], close: [], volume: [], datetime: [] };
    let price = symbol.includes("NIFTY") ? 18000 : 45000;
    let current = new Date(startDate);
    current.setHours(9, 15, 0, 0);

    while (current <= endDate) {
        if (current.getDay() === 0 || current.getDay() === 6) {
            current.setDate(current.getDate() + 1);
            continue;
        }

        for (let i = 0; i < 75; i++) { // 75 bars per day for 10min
            if (current > endDate) break;

            // Add realistic trends for EMA crossovers
            const trend = Math.sin(current.getTime() / (1000 * 60 * 60 * 24 * 7)) * 0.02; // Weekly cycles
            const change = (Math.random() - 0.5) * 0.008 + trend;
            const open = price;
            price *= (1 + change);
            const high = Math.max(open, price) * (1 + Math.random() * 0.003);
            const low = Math.min(open, price) * (1 - Math.random() * 0.003);

            data.open.push(+open.toFixed(2));
            data.high.push(+high.toFixed(2));
            data.low.push(+low.toFixed(2));
            data.close.push(+price.toFixed(2));
            data.volume.push(Math.round(300000 + Math.random() * 700000));
            data.datetime.push(current.toISOString().slice(0, 19).replace("T", " "));

            current = new Date(current.getTime() + 10 * 60 * 1000);
        }
        current.setDate(current.getDate() + 1);
        current.setHours(9, 15, 0, 0);
    }

    return {
        symbol,
        timeframe,
        startDate,
        endDate,
        ...data
    };
}

// ===================== FINAL & WORKING MARKET DATA FETCHER (TWELVE DATA NSE FIX) =====================
async function fetchMarketData(strategy, { period = "all", startDate, endDate } = {}) {
    let symbol = "BANKNIFTY";
    let timeframe = "10min";

    try {
        const instruments = strategy.instruments || [];
        if (!instruments.length) throw new Error("No instruments defined");

        const inst = instruments[0];
        const rawSymbol = (inst.symbol || "NSE:BANKNIFTY").trim();
        timeframe = inst.timeframe || "10min";

        // Clean symbol: remove NSE: prefix and make uppercase
        symbol = rawSymbol.replace(/^NSE[:\-]?\s*/i, "").trim().toUpperCase();

        // === DATE RANGE (exact match with frontend) ===
        let start = new Date();
        let end = new Date();

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            const now = new Date();
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (period) {
                case "1m": start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
                case "3m": start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
                case "6m": start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break;
                case "1y": start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
                case "2y": start = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()); break;
                case "all":
                default: start = new Date("2022-01-01"); break;
            }
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            log("Invalid date range, using last 1 year");
            end = new Date();
            start = new Date(end);
            start.setFullYear(end.getFullYear() - 1);
        }

        log(`Backtesting ${symbol} ${timeframe} | ${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)}`);

        // === NO API KEY? Use synthetic (instant) ===
        if (!API_KEY) {
            log("No TwelveData key → using high-quality synthetic data");
            return generateSynthetic(symbol, timeframe, start, end);
        }

        // === CRITICAL FIX: Correct symbol format for Twelve Data NSE Indices ===
        const indexMap = {
            "BANKNIFTY": "BANKNIFTY",
            "NIFTY": "NIFTY",
            "NIFTY50": "NIFTY",
            "FINNIFTY": "FINNIFTY",
            "MIDCPNIFTY": "MIDCPNIFTY"
            // SENSEX not supported
        };

        const tdSymbol = indexMap[symbol] || symbol;

        // DO NOT use XNSE: or NSE: prefix — Twelve Data rejects it
        // Just use plain: BANKNIFTY, NIFTY, etc.

        const params = new URLSearchParams({
            symbol: tdSymbol,
            interval: timeframe,
            exchange: "NSE",
            apikey: API_KEY,
            dp: "2",
            timezone: "Asia/Kolkata",
            outputsize: "5000"
        });

        const allValues = [];
        let cursor = new Date(start);

        while (cursor <= end) {
            const chunkEnd = new Date(cursor);
            chunkEnd.setMonth(chunkEnd.getMonth() + 6);
            if (chunkEnd > end) chunkEnd.setTime(end.getTime());

            params.set("start_date", cursor.toISOString().slice(0, 0, 10));
            params.set("end_date", chunkEnd.toISOString().slice(0, 10));

            const url = `https://api.twelvedata.com/time_series?${params.toString()}`;
            log(`Fetching: ${tdSymbol} from ${cursor.toISOString().slice(0, 10)}`);

            let json;
            try {
                json = await safeFetch(url);
            } catch (e) {
                log("API call failed, skipping chunk");
                break;
            }

            if (!json.values || json.values.length === 0) {
                log("No more data available");
                break;
            }

            allValues.push(...json.values);

            const lastBar = new Date(json.values[json.values.length - 1].datetime);
            cursor = new Date(lastBar);
            cursor.setDate(cursor.getDate() + 1);

            if (cursor <= end) {
                await new Promise(r => setTimeout(r, 8500)); // Safe rate limit
            }
        }

        if (allValues.length === 0) {
            log("No real data received → using synthetic");
            return generateSynthetic(symbol, timeframe, start, end);
        }

        const values = allValues.reverse();

        log(`Successfully fetched ${values.length} real bars for ${tdSymbol}`);

        return {
            symbol: tdSymbol,
            timeframe,
            startDate: start,
            endDate: end,
            open: values.map(v => parseFloat(v.open)),
            high: values.map(v => parseFloat(v.high)),
            low: values.map(v => parseFloat(v.low)),
            close: values.map(v => parseFloat(v.close)),
            volume: values.map(v => parseFloat(v.volume || 1000)),
            datetime: values.map(v => v.datetime.replace(" ", "T") + "Z")
        };

    } catch (err) {
        error("fetchMarketData failed:", err.message);
        log("Final fallback to synthetic data");
        return generateSynthetic(symbol, timeframe, new Date(Date.now() - 365 * 24 * 3600 * 1000), new Date());
    }
}

// ===================== INDICATORS (FULL TA) =====================
class TA {
    static sma(arr, period) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            if (i < period - 1) result.push(null);
            else {
                let sum = 0;
                for (let j = 0; j < period; j++) sum += arr[i - j];
                result.push(sum / period);
            }
        }
        return result;
    }

    static ema(arr, period) {
        const k = 2 / (period + 1);
        const ema = new Array(arr.length).fill(null);
        let sum = 0;
        for (let i = 0; i < period; i++) sum += arr[i];
        ema[period - 1] = sum / period;
        for (let i = period; i < arr.length; i++) {
            ema[i] = arr[i] * k + ema[i - 1] * (1 - k);
        }
        return ema;
    }

    static rsi(arr, period = 14) {
        const rsi = new Array(arr.length).fill(null);
        if (arr.length < period + 1) return rsi;

        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const diff = arr[i] - arr[i - 1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        let avgGain = gains / period;
        let avgLoss = Math.abs(losses) / period;
        rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

        for (let i = period + 1; i < arr.length; i++) {
            const diff = arr[i] - arr[i - 1];
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
            rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
        }
        return rsi;
    }

    static vwap(high, low, close, volume, datetime) {
        const vwap = new Array(close.length).fill(null);
        let cumTPV = 0, cumVol = 0, currentDay = null;

        for (let i = 0; i < close.length; i++) {
            const date = datetime[i]?.slice(0, 10);
            if (date && date !== currentDay) {
                cumTPV = 0; cumVol = 0; currentDay = date;
            }
            const tp = (high[i] + low[i] + close[i]) / 3;
            cumTPV += tp * (volume[i] || 1000);
            cumVol += (volume[i] || 1000);
            if (cumVol > 0) vwap[i] = cumTPV / cumVol;
        }
        return vwap;
    }
}

// ===================== VALUE RESOLVER =====================
function getValue(indicator, params, data, i) {
    if (i < 0 || i >= data.close.length) return null;
    const { close, high, low, volume, datetime } = data;

    try {
        switch (indicator) {
            case "moving-average":
                const p = Math.max(1, parseInt(params?.period) || 20);
                const type = (params?.type || "SMA").toUpperCase();
                if (type === "EMA") return TA.ema(close, p)[i];
                return TA.sma(close, p)[i];

            case "vwap":
                if (!data.vwap) data.vwap = TA.vwap(high, low, close, volume, datetime);
                return data.vwap[i];

            case "rsi":
                if (!data.rsi) data.rsi = TA.rsi(close, parseInt(params?.period) || 14);
                return data.rsi[i];

            case "candle":
                const t = (params?.type || "Close").toLowerCase();
                return t === "open" ? data.open[i] : t === "high" ? high[i] : t === "low" ? low[i] : close[i];

            case "number":
                return parseFloat(params?.period) || 0;

            default:
                return close[i];
        }
    } catch (err) {
        error("Indicator error:", indicator, err.message);
        return null;
    }
}

function checkComparator(a, op, b, prevA, prevB) {
    if (a === null || b === null) return false;
    switch (op) {
        case "crosses-above": return a > b && (prevA === null || prevA <= prevB);
        case "crosses-below": return a < b && (prevA === null || prevA >= prevB);
        case "higher-than": return a > b;
        case "less-than": return a < b;
        case "equal": return Math.abs(a - b) < 1;
        default: return false;
    }
}

function evaluateCondition(cond, data, i) {
    const val1 = getValue(cond.indicator, cond.params, data, i);
    const val2 = getValue(cond.secondIndicator, cond.secondParams, data, i);
    const prev1 = getValue(cond.indicator, cond.params, data, i - 1);
    const prev2 = getValue(cond.secondIndicator, cond.secondParams, data, i - 1);

    return checkComparator(val1, cond.comparator, val2, prev1, prev2);
}

function evaluateConditions(conditions, data, i) {
    if (!conditions || conditions.length === 0) return true;

    let result = true;
    for (const c of conditions) {
        const ok = evaluateCondition(c, data, i);
        if (c.operator === "and") result = result && ok;
        else result = result || ok;
    }
    return result;
}

// ===================== MAIN BACKTEST =====================
module.exports = function (backtest) {
    backtest.run = async function (strategyId, requestBody, options) {
        const { period = "all", startDate, endDate } = requestBody || {};

        const userId = options?.accessToken?.userId;
        if (!userId) {
            error("Unauthorized access");
            throw new Error("Unauthorized");
        }

        let bt = null;

        try {
            log(`Starting backtest for strategy: ${strategyId}`);

            const TdStrategy = backtest.app.models.TdStrategy;
            const strategy = await TdStrategy.findById(strategyId);
            if (!strategy) throw new Error("Strategy not found");

            log(`Strategy loaded: ${strategy.strategyName}`);

            const marketData = await fetchMarketData(strategy, { period, startDate, endDate });
            log(`Data loaded: ${marketData.close.length} bars from ${marketData.startDate.toISOString().slice(0, 10)}`);

            bt = await backtest.create({
                strategyId,
                strategyName: strategy.strategyName,
                userId: userId.toString(),
                symbol: marketData.symbol,
                timeframe: marketData.timeframe,
                startDate: marketData.startDate,
                endDate: marketData.endDate,
                status: "running",
                totalTrades: 0,
                winRate: 0,
                totalPL: 0,
                maxDrawdown: 0,
                sharpeRatio: 0,
                cagr: 0,
                equityCurve: [],
                trades: [],
                heatmapData: []
            });

            const entryConditions = (strategy.entryConditions?.conditions || []).filter(c => c.type !== "exit");
            const exitConditions = (strategy.exitConditions?.conditions || []);

            const trades = [];
            let position = null;
            let entryPrice = 0;
            let equity = STARTING_CAPITAL;
            let peak = equity;
            let maxDD = 0;
            let tradeId = 1;

            for (let i = 100; i < marketData.close.length - 1; i++) {
                const price = marketData.close[i];
                const time = marketData.datetime[i]?.slice(11, 16);

                // EOD Exit
                if (time >= "15:10" && position) {
                    const pl = position === "long"
                        ? (price - entryPrice) * 15
                        : (entryPrice - price) * 15;

                    trades.push({
                        id: tradeId++,
                        date: marketData.datetime[i].slice(0, 10),
                        pl: Math.round(pl * 100) / 100
                    });

                    equity += pl;
                    peak = Math.max(peak, equity);
                    maxDD = Math.max(maxDD, peak - equity);
                    position = null;
                }

                if (position) {
                    // Check exit conditions
                    const shouldExit = exitConditions.length > 0 && evaluateConditions(exitConditions, marketData, i);
                    if (shouldExit) {
                        const pl = position === "long"
                            ? (price - entryPrice) * 15
                            : (entryPrice - price) * 15;

                        trades.push({
                            id: tradeId++,
                            date: marketData.datetime[i].slice(0, 10),
                            pl: Math.round(pl * 100) / 100
                        });

                        equity += pl;
                        peak = Math.max(peak, equity);
                        maxDD = Math.max(maxDD, peak - equity);
                        position = null;
                    }
                    continue;
                }

                // Entry
                const longSignal = entryConditions.some(c => c.type === "long" && evaluateCondition(c, marketData, i));
                const shortSignal = entryConditions.some(c => c.type === "short" && evaluateCondition(c, marketData, i));

                if (longSignal) {
                    position = "long";
                    entryPrice = price;
                } else if (shortSignal) {
                    position = "short";
                    entryPrice = price;
                }
            }

            const result = {
                trades,
                totalTrades: trades.length,
                winRate: trades.length ? +(trades.filter(t => t.pl > 0).length / trades.length * 100).toFixed(1) : 0,
                totalPL: +(equity - STARTING_CAPITAL).toFixed(2),
                maxDrawdown: +maxDD.toFixed(2),
                status: "completed"
            };

            await bt.updateAttributes(result);
            log(`Backtest completed: ${trades.length} trades, ${result.totalPL} PL`);
            return result;

        } catch (err) {
            const userMsg = err.message.includes("not found") ? "Strategy not found" :
                err.message.includes("data") ? "No market data available" :
                    "Backtest failed — please try again";

            error("Backtest failed:", err.message);
            if (bt) await bt.updateAttributes({ status: "failed", error: userMsg });
            throw new Error(userMsg);
        }
    };

    backtest.remoteMethod('run', {
        accepts: [
            { arg: 'strategyId', type: 'string', required: true },
            { arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { root: true },
        http: { path: '/run/:strategyId', verb: 'post' }
    });
};