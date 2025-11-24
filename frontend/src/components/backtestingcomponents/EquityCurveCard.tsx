// components/backtestingcomponents/EquityCurveCard.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

import type { Stats } from "@/components/backtestingcomponents/bktestingTypes";
import { equityChartConfig } from "@/components/backtestingcomponents/bktestingTypes";

type DailyPLPoint = { date: string; pl: number };

type Props = {
    stats: Stats;
    isProfitable: boolean;
    dailyPLData: DailyPLPoint[];
};

export const EquityCurveCard: React.FC<Props> = ({
    stats,
    isProfitable,
    dailyPLData,
}) => {
    const [chartType, setChartType] = React.useState<"area" | "bar">("area");

    // ✅ gradient offset based on DAILY P&L values (exactly like example)
    const gradientOffset = React.useMemo(() => {
        if (!dailyPLData.length) return 0.5;
        const dataMax = Math.max(...dailyPLData.map((d) => d.pl));
        const dataMin = Math.min(...dailyPLData.map((d) => d.pl));
        if (dataMax <= 0) return 0; // all <= 0 => all red
        if (dataMin >= 0) return 1; // all >= 0 => all green
        return dataMax / (dataMax - dataMin);
    }, [dailyPLData]);

    const plValues = dailyPLData.map((d) => d.pl);
    const minPL = plValues.length ? Math.min(...plValues) : 0;
    const maxPL = plValues.length ? Math.max(...plValues) : 0;
    const plPadding = (maxPL - minPL) * 0.2 || 1000;

    return (
        <Card className="overflow-hidden border-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        {chartType === "area" ? "Daily P&L (Area)" : "Daily P&L (Bars)"}
                        <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant={chartType === "area" ? "default" : "outline"}
                                onClick={() => setChartType("area")}
                                className="h-8 w-8"
                            >
                                <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant={chartType === "bar" ? "default" : "outline"}
                                onClick={() => setChartType("bar")}
                                className="h-8 w-8"
                            >
                                <BarChart3 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                    <div className="flex flex-row gap-2">
                        <Badge
                            variant={isProfitable ? "secondary" : "destructive"}
                            className={`px-4 py-2 text-start font-semibold leading-snug flex flex-row gap-0.5 ${isProfitable ? "dark:bg-green-600" : "dark:bg-red-600"}`}
                        >
                            <span className="text-xs  uppercase tracking-wide opacity-80">
                                P&amp;L:
                            </span>
                            <span className="text-base">
                                {stats.totalPL >= 0 ? "+₹" : "₹-"}
                                {Math.abs(stats.totalPL).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </Badge>
                        <Badge
                            variant={isProfitable ? "secondary" : "destructive"}
                            className={`px-4 py-2 text-start font-semibold leading-snug flex flex-row gap-0.5 ${isProfitable ? "dark:bg-green-600" : "dark:bg-red-600"}`}
                        >
                            <span className="text-[10px] uppercase tracking-wide opacity-80 mt-1">
                                Max. Draw down:
                            </span>
                            <span className="text-sm">
                                ₹{Math.abs(stats.maxDD).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </Badge>
                    </div>

                </div>
            </CardHeader>

            <CardContent className="p-0">
                <ChartContainer config={equityChartConfig} className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "area" ? (
                            // ✅ AREA = DAILY P&L with split green/red gradient
                            <AreaChart
                                data={dailyPLData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="splitPL" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop
                                            offset={`${gradientOffset * 100}%`}
                                            stopColor="#10b981"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset={`${gradientOffset * 100}%`}
                                            stopColor="#ef4444"
                                            stopOpacity={0.1}
                                        />
                                        <stop offset="1" stopColor="#ef4444" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    tickFormatter={(v) =>
                                        new Date(v).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <YAxis
                                    domain={[minPL - plPadding, maxPL + plPadding]}
                                    tickLine={false}
                                    tickFormatter={(v) => {
                                        const num = Number(v);
                                        if (Math.abs(num) >= 100_000) {
                                            return `₹${(num / 100_000).toFixed(1)}L`;
                                        }
                                        if (Math.abs(num) >= 1_000) {
                                            return `${num >= 0 ? "+₹" : "−₹"}${(
                                                Math.abs(num) / 1_000
                                            ).toFixed(0)}k`;
                                        }
                                        return num >= 0 ? `+₹${num}` : `−₹${Math.abs(num)}`;
                                    }}
                                />
                                <Tooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(l) =>
                                                new Date(l).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                            }
                                            formatter={(v) => {
                                                const val = Number(v);
                                                return val >= 0
                                                    ? `+₹${val.toLocaleString("en-IN")}`
                                                    : `−₹${Math.abs(val).toLocaleString("en-IN")}`;
                                            }}
                                        />
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pl"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                    fill="url(#splitPL)"
                                    fillOpacity={1}
                                />
                            </AreaChart>
                        ) : (
                            // ✅ BAR = SAME DAILY P&L VALUES
                            <BarChart
                                data={dailyPLData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    tickFormatter={(v) =>
                                        new Date(v).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <YAxis
                                    domain={[minPL - plPadding, maxPL + plPadding]}
                                    tickLine={false}
                                    tickFormatter={(v) => {
                                        const num = Number(v);
                                        if (Math.abs(num) >= 100_000) {
                                            return `₹${(num / 100_000).toFixed(1)}L`;
                                        }
                                        if (Math.abs(num) >= 1_000) {
                                            return `${num >= 0 ? "+₹" : "−₹"}${(
                                                Math.abs(num) / 1_000
                                            ).toFixed(0)}k`;
                                        }
                                        return num >= 0 ? `+₹${num}` : `−₹${Math.abs(num)}`;
                                    }}
                                />
                                <Tooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(l) =>
                                                new Date(l).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                            }
                                            formatter={(v) => {
                                                const val = Number(v);
                                                return val >= 0
                                                    ? `+₹${val.toLocaleString("en-IN")}`
                                                    : `−₹${Math.abs(val).toLocaleString("en-IN")}`;
                                            }}
                                        />
                                    }
                                />
                                <Bar dataKey="pl" radius={[8, 8, 0, 0]}>
                                    {dailyPLData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.pl >= 0 ? "#10b981" : "#ef4444"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
