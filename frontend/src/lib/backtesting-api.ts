// lib/backtesting-api.ts
import type {
    Trade,
    Stats,
    HeatmapMonth,
    HeatmapSquare,
    PeriodValue,
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

const BANK_HOLIDAYS = [
    "2022-01-26",
    "2022-03-18",
    "2022-04-14",
    "2022-08-15",
    "2022-10-05",
    "2022-10-24",
    "2023-01-26",
    "2023-03-30",
    "2023-04-04",
    "2023-09-19",
    "2023-10-02",
    "2023-11-27",
    "2024-01-26",
    "2024-03-25",
    "2024-04-11",
    "2024-08-15",
    "2024-10-02",
    "2024-11-01",
];

const generateTradingDays = (): string[] => {
    const days: string[] = [];
    let cur = new Date("2022-01-01");
    const end = new Date("2024-12-31");

    while (cur <= end) {
        const dateStr = cur.toISOString().split("T")[0];
        const day = cur.getDay();
        if (
            day !== 0 &&
            day !== 6 &&
            !BANK_HOLIDAYS.includes(dateStr)
        ) {
            days.push(dateStr);
        }
        cur.setDate(cur.getDate() + 1);
    }
    return days;
};

const TRADING_DAYS = generateTradingDays();

// ─────────────────────────────────────────────
// Trade generator with bull / bear bias
// ─────────────────────────────────────────────
const generateBankNiftyTrades = (): Trade[] => {
    const trades: Trade[] = [];
    let id = 1;

    const monthlyBias: Record<
        string,
        "bull" | "neutral" | "bear"
    > = {
        "2022-01": "bull",
        "2022-02": "bull",
        "2022-03": "bear",
        "2022-04": "neutral",
        "2022-05": "bear",
        "2022-06": "bear",
        "2022-07": "bull",
        "2022-08": "bull",
        "2022-09": "neutral",
        "2022-10": "bear",
        "2022-11": "bull",
        "2022-12": "bull",

        "2023-01": "neutral",
        "2023-02": "bull",
        "2023-03": "bull",
        "2023-04": "neutral",
        "2023-05": "bear",
        "2023-06": "bear",
        "2023-07": "neutral",
        "2023-08": "bull",
        "2023-09": "bull",
        "2023-10": "bull",
        "2023-11": "bull",
        "2023-12": "bull",

        "2024-01": "bull",
        "2024-02": "bull",
        "2024-03": "neutral",
        "2024-04": "bear",
        "2024-05": "neutral",
        "2024-06": "bull",
        "2024-07": "bull",
        "2024-08": "bull",
        "2024-09": "bull",
        "2024-10": "bull",
        "2024-11": "bull",
        "2024-12": "bull",
    };

    for (const dateStr of TRADING_DAYS) {
        const monthKey = dateStr.slice(0, 7);
        const bias = monthlyBias[monthKey] || "neutral";

        // Trade frequency
        const tradeChance =
            bias === "bull" ? 0.78 : bias === "bear" ? 0.62 : 0.7;
        if (rand.next() > tradeChance) continue;

        // Win rate
        const winRate =
            bias === "bull" ? 0.65 : bias === "bear" ? 0.48 : 0.56;
        const isProfit = rand.next() < winRate;

        let pl: number;

        if (isProfit) {
            // +8k to +48k
            pl = Math.floor(rand.next() * 40000) + 8000;
        } else {
            // -6k to -42k
            pl = -(Math.floor(rand.next() * 36000) + 6000);
        }

        // Occasional big loss in bear months
        if (bias === "bear" && rand.next() < 0.12) {
            pl =
                -(Math.floor(rand.next() * 50000) + 30000); // -30k to -80k
        }

        trades.push({ id: id++, date: dateStr, pl });
    }

    // Always sorted by date
    return trades.sort((a, b) =>
        a.date.localeCompare(b.date)
    );
};

const ALL_TRADES = generateBankNiftyTrades();

// ─────────────────────────────────────────────
// Equity curve
// ─────────────────────────────────────────────
export const buildEquityCurve = (): {
    date: string;
    equity: number;
}[] => {
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
    const end = new Date("2024-12-31");

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
// Stats
// ─────────────────────────────────────────────
export const calculateStats = (
    trades: Trade[],
    tradingDaysCount: number
): Stats | null => {
    if (!trades.length) return null;

    const sortedTrades = [...trades].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    const profitTrades = sortedTrades.filter((t) => t.pl > 0);
    const lossTrades = sortedTrades.filter((t) => t.pl < 0);

    const totalPL = sortedTrades.reduce(
        (sum, t) => sum + t.pl,
        0
    );
    const winRate = (
        (profitTrades.length / sortedTrades.length) *
        100
    ).toFixed(1);

    const avgWin = profitTrades.length
        ? profitTrades.reduce((s, t) => s + t.pl, 0) /
        profitTrades.length
        : 0;
    const avgLoss = lossTrades.length
        ? Math.abs(
            lossTrades.reduce((s, t) => s + t.pl, 0) /
            lossTrades.length
        )
        : 0;

    const maxProfit = Math.max(
        0,
        ...sortedTrades.map((t) => t.pl)
    );
    const maxLoss = Math.abs(
        Math.min(0, ...sortedTrades.map((t) => t.pl))
    );

    // Max drawdown
    let peak = STARTING_CAPITAL;
    let maxDD = 0;
    let equity = STARTING_CAPITAL;

    for (const t of sortedTrades) {
        equity += t.pl;
        if (equity > peak) peak = equity;
        const dd = peak - equity;
        if (dd > maxDD) maxDD = dd;
    }

    // Current streak
    let currentStreak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const t of [...sortedTrades].reverse()) {
        if (t.pl > 0) {
            if (streakType === "win" || streakType === "none") {
                streakType = "win";
                currentStreak++;
            } else break;
        } else if (t.pl < 0) {
            if (streakType === "loss" || streakType === "none") {
                streakType = "loss";
                currentStreak++;
            } else break;
        } else break;
    }

    return {
        totalTrades: sortedTrades.length,
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
// Heatmap
// ─────────────────────────────────────────────
export const generateHeatmap = (
    cutoff: Date
): HeatmapMonth[] => {
    const dailyPL = new Map<string, number>();
    ALL_TRADES.forEach((t) => {
        dailyPL.set(t.date, (dailyPL.get(t.date) || 0) + t.pl);
    });

    const months: HeatmapMonth[] = [];
    let cur = new Date("2022-01-01");
    const end = new Date("2024-12-31");

    while (cur <= end) {
        const year = cur.getFullYear();
        const month = cur.getMonth();
        const monthKey = cur.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const squares: HeatmapSquare[] = [];
        let monthTotal = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(
                year,
                month,
                day
            )
                .toISOString()
                .split("T")[0];

            const profit = dailyPL.get(dateStr) || 0;
            monthTotal += profit;

            let intensity = "bg-transparent";
            if (profit >= 30000) intensity = "bg-green-700";
            else if (profit >= 10000) intensity = "bg-green-500";
            else if (profit > 0) intensity = "bg-green-300";
            else if (profit <= -25000) intensity = "bg-red-700";
            else if (profit <= -8000) intensity = "bg-red-500";
            else if (profit < 0) intensity = "bg-red-300";

            squares.push({ day: dateStr, profit, intensity });
        }

        months.push({
            month: monthKey,
            squares,
            total: monthTotal,
        });

        cur.setMonth(cur.getMonth() + 1);
        cur.setDate(1);
    }

    return months.filter((m) =>
        m.squares.some(
            (sq) => new Date(sq.day) >= cutoff
        )
    );
};

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
export const backtestingApi = {
    getAllTrades: () => ALL_TRADES,
    getEquityCurve: () => FULL_EQUITY_DATA,
    getRecentTrades: (limit = 10) =>
        ALL_TRADES.slice(-limit).reverse(),
    getTradesInPeriod: (from: Date) =>
        ALL_TRADES.filter((t) => new Date(t.date) >= from),
    getTradingDaysInPeriod: (from: Date) =>
        TRADING_DAYS.filter((d) => new Date(d) >= from),
};

export type {
    PeriodValue,
    Trade,
    Stats,
    HeatmapMonth,
    HeatmapSquare,
};
