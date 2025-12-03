// MonthlyHeatmapCard.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import type { HeatmapMonth } from "@/components/backtestingcomponents/bktestingTypes";

type Props = {
    months: HeatmapMonth[];
};

export const MonthlyHeatmapCard: React.FC<Props> = ({ months }) => {
    // Helper to format date exactly like your screenshot
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { weekday: "long" });
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Card>
                <CardHeader>
                    <CardTitle>Daywise Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                        {months.map((month) => (
                            <div key={month.month} className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {month.month}
                                </p>

                                {/* 7 columns → proper week layout */}
                                <div className="grid grid-cols-7 gap-1">
                                    {month.squares.map((square) => {
                                        const date = new Date(square.day);
                                        const isTradingDay = square.profit !== 0;

                                        return (
                                            <Tooltip key={square.day}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`
                                                            aspect-square  border border-border 
                                                            transition-all hover:brightness-75 cursor-pointer
                                                            ${isTradingDay ? square.intensity : "bg-muted/30"}
                                                        `}
                                                    />
                                                </TooltipTrigger>

                                                {isTradingDay && (
                                                    <TooltipContent
                                                        side="top"
                                                        className="bg-black text-white border-none shadow-xl px-4 py-3"
                                                    >
                                                        <div className="flex flex-col items-center space-y-1 text-xs">
                                                            <p className="font-bold text-lg">
                                                                {formatDate(square.day)}
                                                            </p>
                                                            <p className="text-zinc-400">
                                                                {formatDayName(square.day)}
                                                            </p>
                                                            <p
                                                                className={`font-bold text-sm ${square.profit >= 0
                                                                    ? "text-green-400"
                                                                    : "text-red-400"
                                                                    }`}
                                                            >
                                                                PNL : ₹
                                                                {Math.abs(square.profit).toLocaleString("en-IN", {
                                                                    maximumFractionDigits: 1,
                                                                    minimumFractionDigits: 1,
                                                                })}
                                                                {square.profit >= 0 ? " (Profit)" : " (Loss)"}
                                                            </p>
                                                        </div>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center">
                                    <p
                                        className={`text-sm font-bold ${month.total >= 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {month.total >= 0 ? "+" : "-"}₹
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
        </TooltipProvider>
    );
};