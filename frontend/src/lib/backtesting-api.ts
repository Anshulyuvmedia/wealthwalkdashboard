// lib/backtesting-api.ts
import type {
    Trade,
    Stats,
    HeatmapMonth,
    HeatmapSquare,
} from "@/components/backtestingcomponents/bktestingTypes";

// ─────────────────────────────────────────────
// Seeded random for deterministic demo data
// ─────────────────────────────────────────────
class SeededRandom {
    private seed: number;
    constructor(seed: number = 12345) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}
const rand = new SeededRandom(42);

// ─────────────────────────────────────────────
// Shared starting capital
// ─────────────────────────────────────────────
export const STARTING_CAPITAL = 100_000;
export const FAKE_TODAY = new Date("2024-12-31");

const BANK_HOLIDAYS = [
    "2022-01-26", "2022-03-18", "2022-04-14", "2022-08-15", "2022-10-05", "2022-10-24",
    "2023-01-26", "2023-03-30", "2023-04-04", "2023-09-19", "2023-10-02", "2023-11-27",
    "2024-01-26", "2024-03-25", "2024-04-11", "2024-08-15", "2024-10-02", "2024-11-01",
];

// ─────────────────────────────────────────────
// Trade Legs (for UI detail)
// ─────────────────────────────────────────────
export type TradeLeg = {
    symbol: string;
    qty: number;
    entryPrice: number;
    entryTime: string;
    exitPrice: number;
    exitTime: string;
    pl: number;
    side: "Buy" | "Sell";
    exitType: string;
};

export const generateTradeLegsForDay = (date: string, dailyPL: number): TradeLeg[] => {
    const rand2 = new SeededRandom(Number(date.replace(/-/g, "")));
    const isProfitDay = dailyPL > 0;
    const absPL = Math.abs(dailyPL);

    const expiryDate = new Date(date);
    expiryDate.setDate(expiryDate.getDate() + ((4 - expiryDate.getDay() + 7) % 7 || 7));
    const expiryStr = expiryDate.toISOString().slice(2, 10).replace(/-/g, "");

    const strikes = [50000, 50500, 51000, 51500, 52000, 52100, 52200, 52500, 53000];
    const strike = strikes[Math.floor(rand2.next() * strikes.length)];
    const type = rand2.next() > 0.5 ? "CE" : "PE";
    const symbol = `BANKNIFTY${expiryStr}${strike}${type}`;

    const legCount = rand2.next() < 0.7 ? 1 : rand2.next() < 0.9 ? 2 : 3;
    const legs: TradeLeg[] = [];
    let remainingPL = dailyPL;

    for (let i = 0; i < legCount; i++) {
        const isLast = i === legCount - 1;
        const thisPL = isLast ? remainingPL : (remainingPL * (0.3 + rand2.next() * 0.5));

        const qty = type === "CE" ? 75 : 150;
        const priceMove = thisPL / qty;
        const entryPrice = Math.round((200 + rand2.next() * 400) * 10) / 10;
        const exitPrice = Math.round((entryPrice + priceMove) * 10) / 10;

        const entryHour = 9 + Math.floor(rand2.next() * 5);
        const entryMin = Math.floor(rand2.next() * 60);
        const exitHour = entryHour + 1 + Math.floor(rand2.next() * 3);
        const exitMin = Math.floor(rand2.next() * 60);

        const exitTypes = isProfitDay
            ? ["Target Hit", "EOD Exit", "Trailing Stop", "Manual Exit"]
            : ["Stop Loss", "Long SL", "Time Stop", "Manual Exit"];

        legs.push({
            symbol: i > 0 ? symbol.replace(strike.toString(), (strike + (i % 2 === 0 ? 100 : -100)).toString()) : symbol,
            qty,
            entryPrice,
            entryTime: `${entryHour.toString().padStart(2, "0")}:${entryMin.toString().padStart(2, "0")}`,
            exitPrice,
            exitTime: `${exitHour % 12 || 12}:${exitMin.toString().padStart(2, "0")} ${exitHour >= 12 ? "PM" : "AM"}`,
            pl: Number(thisPL.toFixed(2)),
            side: rand2.next() > 0.5 ? "Buy" : "Sell",
            exitType: exitTypes[Math.floor(rand2.next() * exitTypes.length)],
        });

        remainingPL -= thisPL;
    }

    return legs;
};

// ─────────────────────────────────────────────
// Generate trading days
// ─────────────────────────────────────────────
const generateTradingDays = (): string[] => {
    const days: string[] = [];
    let cur = new Date("2022-01-01");
    const end = FAKE_TODAY;

    while (cur <= end) {
        const dateStr = cur.toISOString().split("T")[0];
        const day = cur.getDay();
        if (day !== 0 && day !== 6 && !BANK_HOLIDAYS.includes(dateStr)) {
            days.push(dateStr);
        }
        cur.setDate(cur.getDate() + 1);
    }
    return days;
};
const TRADING_DAYS = generateTradingDays();

// ─────────────────────────────────────────────
// Generate trades with monthly bias
// ─────────────────────────────────────────────
const generateBankNiftyTrades = (): Trade[] => {
    const trades: Trade[] = [];
    let id = 1;

    const monthlyBias: Record<string, "bull" | "neutral" | "bear"> = {
        "2022-01": "bull", "2022-02": "bull", "2022-03": "bear", "2022-04": "neutral",
        "2022-05": "bear", "2022-06": "bear", "2022-07": "bull", "2022-08": "bull",
        "2022-09": "neutral", "2022-10": "bear", "2022-11": "bull", "2022-12": "bull",
        "2023-01": "neutral", "2023-02": "bull", "2023-03": "bull", "2023-04": "neutral",
        "2023-05": "bear", "2023-06": "bear", "2023-07": "neutral", "2023-08": "bull",
        "2023-09": "bull", "2023-10": "bull", "2023-11": "bull", "2023-12": "bull",
        "2024-01": "bull", "2024-02": "bull", "2024-03": "neutral", "2024-04": "bear",
        "2024-05": "neutral", "2024-06": "bull", "2024-07": "bull", "2024-08": "bull",
        "2024-09": "bull", "2024-10": "bull", "2024-11": "bull", "2024-12": "bull",
    };

    for (const dateStr of TRADING_DAYS) {
        const monthKey = dateStr.slice(0, 7);
        const bias = monthlyBias[monthKey] || "neutral";

        const tradeChance = bias === "bull" ? 0.78 : bias === "bear" ? 0.62 : 0.7;
        if (rand.next() > tradeChance) continue;

        const winRate = bias === "bull" ? 0.65 : bias === "bear" ? 0.48 : 0.56;
        const isProfit = rand.next() < winRate;

        let pl: number;
        if (isProfit) {
            pl = Math.floor(rand.next() * 40000) + 8000;
        } else {
            pl = -(Math.floor(rand.next() * 36000) + 6000);
        }

        if (bias === "bear" && rand.next() < 0.12) {
            pl = -(Math.floor(rand.next() * 50000) + 30000);
        }

        trades.push({ id: id++, date: dateStr, pl });
    }

    return trades.sort((a, b) => a.date.localeCompare(b.date));
};

const ALL_TRADES = generateBankNiftyTrades();

// ─────────────────────────────────────────────
// Equity Curve
// ─────────────────────────────────────────────
export const buildEquityCurve = (): { date: string; equity: number }[] => {
    const equityMap = new Map<string, number>();
    let equity = STARTING_CAPITAL;

    TRADING_DAYS.forEach((date) => {
        const trade = ALL_TRADES.find((t) => t.date === date);
        if (trade) equity += trade.pl;
        equityMap.set(date, equity);
    });

    const data: { date: string; equity: number }[] = [];
    let lastEquity = STARTING_CAPITAL;
    let cur = new Date("2022-01-01");
    const end = FAKE_TODAY;

    while (cur <= end) {
        const dateStr = cur.toISOString().split("T")[0];
        if (equityMap.has(dateStr)) {
            lastEquity = equityMap.get(dateStr)!;
        }
        data.push({
            date: dateStr,
            equity: Math.round(lastEquity * 100) / 100,
        });
        cur.setDate(cur.getDate() + 1);
    }
    return data;
};

export const FULL_EQUITY_DATA = buildEquityCurve();

// ─────────────────────────────────────────────
// Stats (unchanged)
// ─────────────────────────────────────────────
export const calculateStats = (
    trades: Trade[],
    tradingDaysCount: number
): Stats | null => {
    if (!trades.length) return null;

    const profitTrades = trades.filter((t) => t.pl > 0);
    const lossTrades = trades.filter((t) => t.pl < 0);

    const totalPL = trades.reduce((sum, t) => sum + t.pl, 0);
    const winRate = ((profitTrades.length / trades.length) * 100).toFixed(1);

    const avgWin = profitTrades.length ? profitTrades.reduce((s, t) => s + t.pl, 0) / profitTrades.length : 0;
    const avgLoss = lossTrades.length ? Math.abs(lossTrades.reduce((s, t) => s + t.pl, 0) / lossTrades.length) : 0;

    const maxProfit = Math.max(0, ...trades.map((t) => t.pl));
    const maxLoss = Math.abs(Math.min(0, ...trades.map((t) => t.pl)));

    let peak = STARTING_CAPITAL;
    let maxDD = 0;
    let equity = STARTING_CAPITAL;

    for (const t of trades) {
        equity += t.pl;
        if (equity > peak) peak = equity;
        const dd = peak - equity;
        if (dd > maxDD) maxDD = dd;
    }

    let currentStreak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const t of [...trades].reverse()) {
        if (t.pl > 0) {
            if (streakType === "win" || streakType === "none") { streakType = "win"; currentStreak++; }
            else break;
        } else if (t.pl < 0) {
            if (streakType === "loss" || streakType === "none") { streakType = "loss"; currentStreak++; }
            else break;
        } else break;
    }

    return {
        totalTrades: trades.length,
        profitTrades: profitTrades.length,
        lossTrades: lossTrades.length,
        winRate,
        totalPL,
        avgWin: Math.round(avgWin),
        avgLoss: Math.round(avgLoss),
        maxProfit,
        maxLoss,
        maxDD,
        currentStreak,
        currentStreakType: streakType,
        tradingDays: tradingDaysCount,
    };
};

// ─────────────────────────────────────────────
// Heatmap — NOW SUPPORTS END DATE
// ─────────────────────────────────────────────
export const generateHeatmap = (
    startDate: Date,
    endDate: Date = FAKE_TODAY
): HeatmapMonth[] => {
    const dailyPL = new Map<string, number>();
    ALL_TRADES.forEach((t) => {
        const tradeDate = new Date(t.date);
        if (tradeDate < startDate || tradeDate > endDate) return;
        dailyPL.set(t.date, (dailyPL.get(t.date) || 0) + t.pl);
    });

    const months: HeatmapMonth[] = [];
    let cur = new Date(startDate);
    cur.setDate(1); // Start from first of month

    while (cur <= endDate) {
        const year = cur.getFullYear();
        const month = cur.getMonth();
        const monthKey = cur.toLocaleString("default", { month: "long", year: "numeric" });
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const squares: HeatmapSquare[] = [];
        let monthTotal = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(year, month, day).toISOString().split("T")[0];
            const date = new Date(dateStr);

            if (date < startDate || date > endDate) {
                squares.push({ day: dateStr, profit: 0, intensity: "bg-transparent" });
                continue;
            }

            const profit = dailyPL.get(dateStr) || 0;
            monthTotal += profit;

            const intensity = profit > 0 ? "bg-green-700" : profit < 0 ? "bg-red-700" : "bg-transparent";
            squares.push({ day: dateStr, profit, intensity });
        }

        if (monthTotal !== 0 || squares.some(sq => new Date(sq.day) >= startDate)) {
            months.push({ month: monthKey, squares, total: monthTotal });
        }

        cur.setMonth(cur.getMonth() + 1);
    }

    return months;
};

// ─────────────────────────────────────────────
// Public API — Now with proper range support
// ─────────────────────────────────────────----
export const backtestingApi = {
    getAllTrades: () => ALL_TRADES,
    getEquityCurve: () => FULL_EQUITY_DATA,

    // New: Full range support
    getTradesInRange: (start: Date, end: Date = FAKE_TODAY) =>
        ALL_TRADES.filter((t) => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        }),

    getTradingDaysInRange: (start: Date, end: Date = FAKE_TODAY) =>
        TRADING_DAYS.filter((d) => {
            const date = new Date(d);
            return date >= start && date <= end;
        }),

    // Legacy (kept for compatibility)
    getTradesInPeriod: (from: Date) => ALL_TRADES.filter(t => new Date(t.date) >= from),
    getTradingDaysInPeriod: (from: Date) => TRADING_DAYS.filter(d => new Date(d) >= from),

    getRecentTrades: (limit = 10) => ALL_TRADES.slice(-limit).reverse(),
};

export type { Trade, Stats, HeatmapMonth, HeatmapSquare };