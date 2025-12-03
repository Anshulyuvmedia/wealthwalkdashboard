// MaxProfitLossCard.tsx
import * as React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Cell,
    ReferenceLine,   // ← added
} from "recharts";
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

    // ──────────────────────────────────────────────────────────────
    // Calculate average profit and average loss (only from the trades that are shown)
    // ──────────────────────────────────────────────────────────────
    const profitableTrades = trades.filter((t) => t.pl > 0);
    const losingTrades = trades.filter((t) => t.pl < 0);

    const avgProfit =
        profitableTrades.length > 0
            ? profitableTrades.reduce((sum, t) => sum + t.pl, 0) / profitableTrades.length
            : 0;

    const avgLoss =
        losingTrades.length > 0
            ? losingTrades.reduce((sum, t) => sum + t.pl, 0) / losingTrades.length
            : 0;

    return (
        <Card >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Max Profit and Loss</CardTitle>

                    {/* Simple radio selector for Top N */}
                    <div className="flex items-center gap-4">
                        {(["10", "20", "30", "all"] as const).map((v) => (
                            <label
                                key={v}
                                className="flex items-center space-x-2 text-sm cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="topN"
                                    value={v}
                                    checked={topN === v}
                                    onChange={() => onTopNChange(v)}
                                />
                                <span className="capitalize">
                                    {v === "all" ? "All" : `Top ${v}`}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <ChartContainer config={barChartConfig} className="h-80 w-full">
                    <BarChart
                        data={trades}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="exitDate"   // assuming your Trade type has exitDate (or entryDate)
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={40}
                            tickFormatter={(dateStr) => {
                                const date = new Date(dateStr);
                                if (isNaN(date.getTime())) return "";

                                // Smart formatting: shorter when many trades
                                if (trades.length > 30) {
                                    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                                }
                                return date.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit"
                                });
                            }}
                            interval={trades.length > 50 ? "preserveStartEnd" : 0} // avoids overcrowding
                            tick={{ fontSize: 11, fill: "#64748b" }}
                        />

                        <YAxis
                            tickFormatter={(v) =>
                                `₹${(Math.abs(Number(v)) / 1000).toFixed(0)}k`
                            }
                        />

                        {/* Average Profit line – clean label */}
                        {avgProfit > 0 && (
                            <ReferenceLine
                                y={avgProfit}
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="8 4"
                                label={{
                                    value: `Avg Profit ₹${(avgProfit / 1000).toFixed(1)}k`,
                                    position: "insideTopRight",
                                    fill: "#10b981",
                                    fontSize: 11,
                                    fontWeight: "600",
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    padding: 4,
                                    borderRadius: 4,
                                }}
                            />
                        )}

                        {/* Average Loss line – clean label */}
                        {avgLoss < 0 && (
                            <ReferenceLine
                                y={avgLoss}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="8 4"
                                label={{
                                    value: `Avg Loss ₹${(Math.abs(avgLoss) / 1000).toFixed(1)}k`,
                                    position: "insideBottomRight",
                                    fill: "#ef4444",
                                    fontSize: 11,
                                    fontWeight: "600",
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    padding: 4,
                                    borderRadius: 4,
                                }}
                            />
                        )}

                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(v) => {
                                        const num = Number(v);
                                        const text = `${num > 0 ? "+" : ""}₹${Math.abs(
                                            num
                                        ).toLocaleString("en-IN", {
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