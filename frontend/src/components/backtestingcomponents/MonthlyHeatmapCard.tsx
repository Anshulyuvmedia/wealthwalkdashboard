// MonthlyHeatmapCard.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapMonth } from "@/components/backtestingcomponents/bktestingTypes";

type Props = {
    months: HeatmapMonth[];
};

export const MonthlyHeatmapCard: React.FC<Props> = ({ months }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Performance Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {months.map((month) => (
                        <div key={month.month} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {month.month}
                                </p>
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                                {month.squares.map((day) => (
                                    <div
                                        key={day.day}
                                        className={`aspect-square ${day.intensity} border border-border`}
                                        title={`₹${day.profit.toFixed(0)}`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <p
                                    className={`text-sm font-semibold ${month.total >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {month.total >= 0 ? "+" : ""}₹
                                    {Math.abs(month.total).toLocaleString("en-IN", {
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
