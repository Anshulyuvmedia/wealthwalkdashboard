// @/components/backtestingcomponents/bktestingTypes.ts
import type { ChartConfig } from "@/components/ui/chart";

export type PeriodValue = "all" | "1m" | "3m" | "6m" | "1y" | "2y" | "custom";

export type Trade = {
    id: number;
    date: string; // "YYYY-MM-DD"
    pl: number;
};

export type Stats = {
    totalTrades: number;
    profitTrades: number;
    lossTrades: number;
    winRate: string;
    totalPL: number;
    avgWin: number;
    avgLoss: number;
    maxProfit: number;
    maxLoss: number;
    maxDD: number;
    currentStreak: number;
    currentStreakType: "win" | "loss" | "none";
    tradingDays: number;
};

export type HeatmapSquare = {
    day: string;
    profit: number;
    intensity: string;
};

export type HeatmapMonth = {
    month: string;
    squares: HeatmapSquare[];
    total: number;
};

export const equityChartConfig = {
    equity: { label: "Equity", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;