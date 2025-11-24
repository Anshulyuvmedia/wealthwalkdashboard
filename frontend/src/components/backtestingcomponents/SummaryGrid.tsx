// SummaryGrid.tsx
import * as React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats, Trade } from "@/components/backtestingcomponents/bktestingTypes";
import { Separator } from "@/components/ui/separator"
type Props = {
    stats: Stats;
    // we need trades to derive win / loss days & avg per day
    trades: Trade[];
};

export const SummaryGrid: React.FC<Props> = ({ stats, trades }) => {
    const isProfitable = stats.totalPL > 0;

    // ==== Derive day-wise metrics (win days, loss days, avg per day) ====
    const dayMap = new Map<string, number>();
    trades.forEach((t) => {
        dayMap.set(t.date, (dayMap.get(t.date) || 0) + t.pl);
    });

    let winDays = 0;
    let lossDays = 0;
    let totalProfitByDay = 0;
    let totalLossByDay = 0;

    Array.from(dayMap.values()).forEach((dayPl) => {
        if (dayPl > 0) {
            winDays += 1;
            totalProfitByDay += dayPl;
        } else if (dayPl < 0) {
            lossDays += 1;
            totalLossByDay += dayPl; // negative
        }
    });

    const winDayPct =
        stats.tradingDays > 0 ? ((winDays / stats.tradingDays) * 100).toFixed(2) : "0.00";
    const lossDayPct =
        stats.tradingDays > 0 ? ((lossDays / stats.tradingDays) * 100).toFixed(2) : "0.00";

    const avgProfitPerDay = winDays > 0 ? totalProfitByDay / winDays : 0;
    const avgLossPerDay = lossDays > 0 ? totalLossByDay / lossDays : 0; // negative

    const winTradePct =
        stats.totalTrades > 0
            ? ((stats.profitTrades / stats.totalTrades) * 100).toFixed(2)
            : "0.00";
    const lossTradePct =
        stats.totalTrades > 0 ? ((stats.lossTrades / stats.totalTrades) * 100).toFixed(2) : "0.00";

    return (
        <div>
            <div className="mb-3 text-xl font-bold">
                Backtest Summary
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {/* Trading Days */}
                <Card className="gap-0">
                    <CardHeader className="">
                        <div className="flex justify-between">
                            <CardTitle className="text-base text-muted-foreground p-0">Trading Days</CardTitle>
                            <div className="text-2xl font-bold">{stats.tradingDays}</div>
                        </div>
                    </CardHeader>
                    <Separator className="my-4" />
                    <CardContent>
                        <CardTitle className="text-base text-muted-foreground p-0">Win Days</CardTitle>
                        <div className="flex justify-between">
                            <p className="text-xl font-bold text-green-600">{winDayPct}%</p>
                            <p className="text-xs text-muted-foreground">
                                <ArrowUp className="w-3 h-3 inline mr-1 text-green-600" />
                                {winDays} vs {stats.tradingDays}
                            </p>
                        </div>
                    </CardContent>
                    <Separator className="my-4" />
                    <CardContent>
                        <CardTitle className="text-base text-muted-foreground p-0">Loss Days</CardTitle>
                        <div className="flex justify-between">
                            <p className="text-xl font-bold text-red-600">{lossDayPct}%</p>
                            <p className="text-xs text-muted-foreground">
                                <ArrowDown className="w-3 h-3 inline mr-1 text-red-600" />
                                {lossDays} vs {stats.tradingDays}
                            </p>
                        </div>
                    </CardContent>
                </Card>


                {/* Total Trades */}
                <Card className="gap-0">
                    <CardHeader className="">
                        <div className="flex justify-between">
                            <CardTitle className="text-sm text-muted-foreground">Total Trades</CardTitle>
                            <p className="text-2xl font-bold">{stats.totalTrades}</p>
                        </div>
                    </CardHeader>
                    <Separator className="my-4" />

                    <CardContent>
                        <CardTitle className="text-base text-muted-foreground p-0">Win Trades</CardTitle>
                        <div className="flex justify-between">
                            <p className="text-xl font-bold text-green-600">{winTradePct}%</p>
                            <p className="text-xs text-muted-foreground">
                                <ArrowUp className="w-3 h-3 inline mr-1 text-green-600" />
                                {stats.profitTrades} vs {stats.totalTrades}
                            </p>
                        </div>
                    </CardContent>
                    <Separator className="my-4" />
                    <CardContent>
                        <CardTitle className="text-base text-muted-foreground p-0">Loss Trades</CardTitle>
                        <div className="flex justify-between">
                            <p className="text-xl font-bold text-red-600">{lossTradePct}%</p>
                            <p className="text-xs text-muted-foreground">
                                <ArrowDown className="w-3 h-3 inline mr-1 text-red-600" />
                                {stats.lossTrades} vs {stats.totalTrades}
                            </p>
                        </div>
                    </CardContent>
                </Card>


                {/* Streak */}
                <Card className="gap-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Streak</CardTitle>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 justify-content-center align-center">
                                <p className="text-base text-muted-foreground">Wins</p>
                                <p className="text-base font-bold text-green-600">
                                    <ArrowUp className="w-3 h-3 inline mr-1 text-green-600" />
                                    {stats.currentStreakType === "win" ? stats.currentStreak : 0}
                                </p>
                            </div>
                            <div className="flex gap-2 justify-content-center align-center text-right">
                                <p className="text-base text-muted-foreground">Loss</p>
                                <p className="text-base font-bold text-red-500">
                                    <ArrowDown className="w-3 h-3 inline mr-1 text-red-600" />
                                    {stats.currentStreakType === "loss" ? stats.currentStreak : 0}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator className="my-4" />
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Max Profit</p>
                                <p className="text-xl font-bold text-green-600">
                                    ₹{stats.maxProfit.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Max Loss</p>
                                <p className="text-xl font-bold text-red-500">
                                    -₹{stats.maxLoss.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Per Day */}
                <Card className="gap-0">
                    <CardHeader className="">
                        <CardTitle className="text-sm text-muted-foreground">Average Per Day</CardTitle>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Profit</p>
                                <p className="text-xl font-bold text-green-600">
                                    ₹{Math.round(avgProfitPerDay).toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Loss</p>
                                <p className="text-xl font-bold text-red-500">
                                    -₹{Math.abs(Math.round(avgLossPerDay)).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator className="my-4" />
                    <CardContent>
                        <CardTitle className="text-sm text-muted-foreground">Max Drawdown</CardTitle>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">From Peak</p>
                            <p className="text-2xl font-bold text-red-600">
                                -₹{stats.maxDD.toLocaleString("en-IN")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
};
