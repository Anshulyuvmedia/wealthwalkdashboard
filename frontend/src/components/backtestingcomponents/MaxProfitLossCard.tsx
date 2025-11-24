// MaxProfitLossCard.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import type { Trade } from "@/components/backtestingcomponents/bktestingTypes";

type Props = {
    isProfitable: boolean;
    trades: Trade[];
    topN: "10" | "20" | "30" | "all";
    onTopNChange: (val: "10" | "20" | "30" | "all") => void;
};

const getBarChartConfig = (isProfitable: boolean) =>
({
    pl: {
        label: "P&L",
        color: isProfitable ? "#10b981" : "#ef4444",
    },
} satisfies ChartConfig);

export const MaxProfitLossCard: React.FC<Props> = ({
    isProfitable,
    trades,
    topN,
    onTopNChange,
}) => {
    const barChartConfig = React.useMemo(
        () => getBarChartConfig(isProfitable),
        [isProfitable]
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Max Profit and Loss</CardTitle>

                    {/* Simple radio selector for Top N */}
                    <div className="flex items-center gap-4">
                        {["10", "20", "30", "all"].map((v) => (
                            <label
                                key={v}
                                className="flex items-center space-x-2 text-sm cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="topN"
                                    value={v}
                                    checked={topN === (v as "10" | "20" | "30" | "all")}
                                    onChange={() => onTopNChange(v as "10" | "20" | "30" | "all")}
                                />
                                <span className="capitalize">
                                    {v === "all" ? "All" : `Top ${v}`}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={barChartConfig} className="h-80 w-full">
                    <BarChart data={trades} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="id" tickLine={false} axisLine={false} tickFormatter={() => ""} />
                        <YAxis
                            tickFormatter={(v) => `₹${(Math.abs(Number(v)) / 1000).toFixed(0)}k`}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(v) => {
                                        const num = Number(v);
                                        const text = `${num > 0 ? "+" : ""
                                            }₹${Math.abs(num).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}`;
                                        return (
                                            <span
                                                className={num > 0 ? "text-green-600" : "text-red-600"}
                                            >
                                                {text}
                                            </span>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar dataKey="pl" radius={6}>
                            {trades.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.pl > 0 ? "#10b981" : "#ef4444"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
