// app/Pages/strategy/backTest/[id].tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp, Play } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { PeriodSelector } from "@/components/backtestingcomponents/PeriodSelector";
import { EquityCurveCard } from "@/components/backtestingcomponents/EquityCurveCard";
import { SummaryGrid } from "@/components/backtestingcomponents/SummaryGrid";
import { MaxProfitLossCard } from "@/components/backtestingcomponents/MaxProfitLossCard";
import { MonthlyHeatmapCard } from "@/components/backtestingcomponents/MonthlyHeatmapCard";
import { RecentTradesCard } from "@/components/backtestingcomponents/RecentTradesCard";

import { apiService } from "../apiservice";
import { calculateStats } from "@/lib/backtesting-api";
import type { PeriodValue } from "@/components/backtestingcomponents/PeriodSelector";
import type { Trade, Stats } from "@/components/backtestingcomponents/bktestingTypes";

interface BacktestResult {
    trades: Trade[];
    equityCurve: { date: string; equity: number }[];
    heatmapData?: any[];
    totalTrades: number;
    winRate: number;
    totalPL: number;
    maxDrawdown: number;
    sharpeRatio: number;
    cagr: number;
    strategyName?: string;
}

const BackTestById: React.FC = () => {
    const { id: strategyId } = useParams<{ id: string }>();
    const isFirstRun = React.useRef(true);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>("1y"); // default
    const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
    const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
    const [hasRun, setHasRun] = useState(false); // track if user clicked Run

    const [topN, setTopN] = useState<"10" | "20" | "30" | "all">("10");

    const runBacktest = async () => {
        if (!strategyId) return;

        setLoading(true);
        setError(null);
        setHasRun(true);

        try {
            const payload: any = { period: selectedPeriod };
            if (selectedPeriod === "custom" && customStartDate && customEndDate) {
                payload.startDate = customStartDate.toISOString().split('T')[0];
                payload.endDate = customEndDate.toISOString().split('T')[0];
            }

            const result = await apiService.runBacktest(strategyId, payload);
            setBacktestResult(result);
        } catch (err: any) {
            if (!err.cancelled) {
                setError(err.message || "Backtest failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Only run when user clicks "Run Backtest"
    const handleRunBacktest = () => {
        runBacktest();
    };

    // Auto-run only after first manual run (optional smooth UX)
    useEffect(() => {
        // Skip auto-run on first mount
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (hasRun && !loading) {
            runBacktest();
        }
    }, [selectedPeriod, customStartDate, customEndDate, hasRun, loading]);

    const trades = backtestResult?.trades || [];
    const equityCurve = backtestResult?.equityCurve || [];
    const stats = useMemo<Stats | null>(() => {
        if (!trades.length) return null;
        return calculateStats(trades, 250);
    }, [trades]);

    const dailyPLData = useMemo(() => {
        const out: { date: string; pl: number }[] = [];
        for (let i = 1; i < equityCurve.length; i++) {
            const change = equityCurve[i].equity - equityCurve[i - 1].equity;
            if (change !== 0) {
                out.push({
                    date: equityCurve[i].date,
                    pl: Math.round(change * 100) / 100,
                });
            }
        }
        return out;
    }, [equityCurve]);

    const heatmapData = useMemo(() => {
        if (backtestResult?.heatmapData) return backtestResult.heatmapData;

        const monthly: Record<string, { pl: number }> = {};
        trades.forEach(t => {
            const key = t.date.slice(0, 7);
            monthly[key] = monthly[key] || { pl: 0 };
            monthly[key].pl += t.pl;
        });

        return Object.entries(monthly).map(([month, data]) => ({
            month: new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" }),
            total: data.pl,
            squares: [],
        }));
    }, [trades, backtestResult?.heatmapData]);

    const barTrades = useMemo(() => {
        const sorted = [...trades].sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl));
        return topN === "all" ? sorted : sorted.slice(0, Number(topN));
    }, [trades, topN]);

    const recentTrades = useMemo(() => trades.slice(-10).reverse(), [trades]);

    const isProfitable = stats && (stats.totalPL || 0) > 0;

    return (
        <SidebarProvider style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={`Backtest Strategy`} />

                <div className="p-6 md:p-8 ">
                    {/* === PERIOD SELECTOR + RUN BUTTON === */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold mb-6">Select Backtest Period</h2>

                        <PeriodSelector
                            selectedPeriod={selectedPeriod}
                            onChange={setSelectedPeriod}
                            customStartDate={customStartDate}
                            customEndDate={customEndDate}
                            onCustomDateChange={(start, end) => {
                                setCustomStartDate(start);
                                setCustomEndDate(end);
                                if (start && end) setSelectedPeriod("custom");
                            }}
                        />

                        <Button
                            size="lg"
                            onClick={handleRunBacktest}
                            disabled={loading}
                            className="mt-6 w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Running Backtest...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5" />
                                    Run Backtest
                                </>
                            )}
                        </Button>
                    </div>

                    {/* === ERROR STATE === */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8">
                            <h3 className="font-bold text-lg mb-2">Backtest Failed</h3>
                            <p>{error}</p>
                            <Button variant="outline" onClick={handleRunBacktest} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* === NO TRADES === */}
                    {hasRun && !loading && (!trades.length || !stats) && (
                        <div className="text-center py-20">
                            <p className="text-2xl text-muted-foreground">
                                No trades found for the selected period
                            </p>
                            <p className="text-muted-foreground mt-2">
                                Try a longer period or different settings
                            </p>
                        </div>
                    )}

                    {/* === RESULTS === */}
                    {backtestResult && stats && trades.length > 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <EquityCurveCard stats={stats} isProfitable={isProfitable} dailyPLData={dailyPLData} />
                            <SummaryGrid stats={stats} trades={trades} />
                            <MaxProfitLossCard isProfitable={isProfitable} trades={barTrades} topN={topN} onTopNChange={setTopN} />
                            <MonthlyHeatmapCard months={heatmapData} />
                            <RecentTradesCard trades={recentTrades} />
                        </div>
                    )}

                    {/* Floating action button (mobile) */}
                    <Button
                        onClick={handleRunBacktest}
                        disabled={loading}
                        className="fixed bottom-6 right-6 rounded-full shadow-2xl size-14 z-50 md:hidden"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6" />}
                    </Button>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default BackTestById;