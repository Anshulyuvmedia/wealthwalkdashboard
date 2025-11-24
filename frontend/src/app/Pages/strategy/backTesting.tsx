// app/Pages/strategy/backTesting.tsx
import * as React from "react";
import { TrendingUp } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { PeriodSelector } from "@/components/backtestingcomponents/PeriodSelector";
import { EquityCurveCard } from "@/components/backtestingcomponents/EquityCurveCard";
import { SummaryGrid } from "@/components/backtestingcomponents/SummaryGrid";
import { MaxProfitLossCard } from "@/components/backtestingcomponents/MaxProfitLossCard";
import { MonthlyHeatmapCard } from "@/components/backtestingcomponents/MonthlyHeatmapCard";
import { RecentTradesCard } from "@/components/backtestingcomponents/RecentTradesCard";

import { backtestingApi, calculateStats, generateHeatmap } from "@/lib/backtesting-api";
import type { PeriodValue } from "@/components/backtestingcomponents/bktestingTypes";

const BackTesting: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodValue>("1y");
    const [topN, setTopN] = React.useState<"10" | "20" | "30" | "all">("10");

    const FAKE_TODAY = new Date("2024-12-31");
    const cutoff = React.useMemo(() => {
        switch (selectedPeriod) {
            case "1m":
                return new Date(FAKE_TODAY.getFullYear(), FAKE_TODAY.getMonth() - 1, FAKE_TODAY.getDate());
            case "3m":
                return new Date(FAKE_TODAY.getFullYear(), FAKE_TODAY.getMonth() - 3, FAKE_TODAY.getDate());
            case "6m":
                return new Date(FAKE_TODAY.getFullYear(), FAKE_TODAY.getMonth() - 6, FAKE_TODAY.getDate());
            case "1y":
                return new Date(FAKE_TODAY.getFullYear() - 1, FAKE_TODAY.getMonth(), FAKE_TODAY.getDate());
            case "2y":
                return new Date(FAKE_TODAY.getFullYear() - 2, FAKE_TODAY.getMonth(), FAKE_TODAY.getDate());
            case "all":
            default:
                return new Date("2022-01-01");
        }
    }, [selectedPeriod]);

    const periodTrades = React.useMemo(() => backtestingApi.getTradesInPeriod(cutoff), [cutoff]);
    const periodTradingDays = React.useMemo(
        () => backtestingApi.getTradingDaysInPeriod(cutoff),
        [cutoff]
    );
    const stats = React.useMemo(
        () => calculateStats(periodTrades, periodTradingDays.length),
        [periodTrades, periodTradingDays.length]
    );

    const equityData = React.useMemo(
        () => backtestingApi.getEquityCurve().filter((d) => new Date(d.date) >= cutoff),
        [cutoff]
    );

    // ✅ DAILY P&L (same series used by both charts in EquityCurveCard)
    const dailyPLData = React.useMemo(() => {
        const out: { date: string; pl: number }[] = [];
        for (let i = 1; i < equityData.length; i++) {
            const prev = equityData[i - 1].equity;
            const curr = equityData[i].equity;
            const change = curr - prev;
            if (change !== 0) {
                out.push({
                    date: equityData[i].date,
                    pl: Math.round(change * 100) / 100,
                });
            }
        }
        return out;
    }, [equityData]);

    const heatmapData = React.useMemo(() => generateHeatmap(cutoff), [cutoff]);

    const barTrades = React.useMemo(() => {
        const sorted = [...periodTrades].sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl));
        return topN === "all" ? sorted : sorted.slice(0, Number(topN));
    }, [periodTrades, topN]);

    if (!stats) {
        return (
            <SidebarProvider
                style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Back Testing" />
                    <div className="p-8">
                        <PeriodSelector selectedPeriod={selectedPeriod} onChange={setSelectedPeriod} />
                        <p className="text-center text-muted-foreground mt-8">
                            No trades in the selected period.
                        </p>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const isProfitable = stats.totalPL > 0;

    return (
        <SidebarProvider
            style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Back Testing" />
                <div className="flex flex-col gap-8 p-4 pt-0 md:p-8">
                    <PeriodSelector selectedPeriod={selectedPeriod} onChange={setSelectedPeriod} />

                    {/* ✅ pass dailyPLData */}
                    <EquityCurveCard stats={stats} isProfitable={isProfitable} dailyPLData={dailyPLData} />

                    <SummaryGrid stats={stats} trades={periodTrades} />
                    <MaxProfitLossCard
                        isProfitable={isProfitable}
                        trades={barTrades}
                        topN={topN}
                        onTopNChange={setTopN}
                    />
                    <MonthlyHeatmapCard months={heatmapData} />
                    <RecentTradesCard trades={backtestingApi.getRecentTrades(10)} />

                    <Button className="fixed bottom-6 right-6 rounded-full shadow-2xl size-14 md:hidden z-50 bg-primary">
                        <TrendingUp className="h-6 w-6" />
                    </Button>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default BackTesting;
