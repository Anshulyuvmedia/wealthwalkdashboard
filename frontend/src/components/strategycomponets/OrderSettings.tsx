import React, { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert, ChartNoAxesColumnIncreasing, ChartCandlestick } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReadymadeTemplates from "@/components/strategycomponets/ReadymadeTemplates";

interface OrderSettingsData {
    orderType: string;
    startTime: string;
    squareOff: string;
    days: string[];
    transactionType?: string;
    chartType?: string;
    interval?: string;
}

interface OrderSettingsProps {
    strategyType: "timebased" | "indicatorbased";
    template: string;
    onTemplateSelect: (template: string) => void;
    onSettingsChange: (data: OrderSettingsData) => void;
    initialSettings?: OrderSettingsData; // Pre-populated data from API
}

const OrderSettings: React.FC<OrderSettingsProps> = ({
    strategyType,
    template,
    onTemplateSelect,
    onSettingsChange,
    initialSettings,
}) => {
    const [orderType, setOrderType] = useState<string>(initialSettings?.orderType || "MIS");
    const [startTime, setStartTime] = useState<string>(initialSettings?.startTime || "09:15");
    const [squareOff, setSquareOff] = useState<string>(initialSettings?.squareOff || "15:15");
    const [days, setDays] = useState<string[]>(initialSettings?.days || []);
    const [transactionType, setTransactionType] = useState<string>(
        initialSettings?.transactionType || "bothside"
    );
    const [chartType, setChartType] = useState<string>(initialSettings?.chartType || "candle");
    const [interval, setInterval] = useState<string>(initialSettings?.interval || "1");

    const settingsData = useMemo(
        () => ({
            orderType,
            startTime,
            squareOff,
            days,
            ...(strategyType === "indicatorbased" && {
                transactionType,
                chartType,
                interval,
            }),
        }),
        [orderType, startTime, squareOff, days, transactionType, chartType, interval, strategyType]
    );

    // Sync with parent only if settings have changed
    useEffect(() => {
        const currentSettings = {
            orderType,
            startTime,
            squareOff,
            days,
            ...(strategyType === "indicatorbased" && { transactionType, chartType, interval }),
        };
        const isEqual = JSON.stringify(currentSettings) === JSON.stringify(initialSettings);
        if (!isEqual) {
            onSettingsChange(settingsData);
        }
    }, [settingsData, onSettingsChange, initialSettings, strategyType]);

    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <div>
                        <Label htmlFor="order-type">Order Type</Label>
                        <ToggleGroup
                            id="order-type"
                            type="single"
                            variant="outline"
                            size="lg"
                            value={orderType}
                            onValueChange={(value) => value && setOrderType(value)}
                            className="mt-3"
                        >
                            {["MIS", "CNC", "BTST"].map((type) => (
                                <ToggleGroupItem key={type} value={type} className="text-xs">
                                    {type}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                    <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                            id="start-time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-3"
                        />
                    </div>
                    <div>
                        <Label htmlFor="square-off">Square Off</Label>
                        <Input
                            id="square-off"
                            type="time"
                            value={squareOff}
                            onChange={(e) => setSquareOff(e.target.value)}
                            className="mt-3"
                        />
                    </div>
                    <div>
                        <Label htmlFor="days">Days</Label>
                        <ToggleGroup
                            id="days"
                            type="multiple"
                            variant="outline"
                            size="lg"
                            value={days}
                            onValueChange={setDays}
                            className="mt-3"
                        >
                            {["MON", "TUE", "WED", "THU", "FRI"].map((day) => (
                                <ToggleGroupItem key={day} value={day} className="text-xs">
                                    {day}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                </div>
            </CardContent>
            {strategyType === "timebased" ? (
                <CardContent className="space-y-4 flex items-center space-x-2">
                    <ReadymadeTemplates onTemplateSelect={onTemplateSelect} />
                    <div className="text-sm text-gray-400">(Selected: {template || "None"})</div>
                </CardContent>
            ) : (
                <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                        <div>
                            <Label htmlFor="transaction-type">Transaction Type</Label>
                            <div className="mt-3 flex items-center space-x-3">
                                <ToggleGroup
                                    id="transaction-type"
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={transactionType}
                                    onValueChange={(value) => value && setTransactionType(value)}
                                >
                                    {["bothside", "onlylong", "onlyshort"].map((type) => (
                                        <ToggleGroupItem key={type} value={type} className="text-xs">
                                            {type === "bothside"
                                                ? "Both Side"
                                                : type === "onlylong"
                                                    ? "Only Long"
                                                    : "Only Short"}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                                <Tooltip>
                                    <TooltipContent>
                                        <p>Only short and only long are available for live market only.</p>
                                    </TooltipContent>
                                    <TooltipTrigger>
                                        <CircleAlert size={16} />
                                    </TooltipTrigger>
                                </Tooltip>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="chart-type">Chart Type</Label>
                            <div className="mt-3 flex">
                                <ToggleGroup
                                    id="chart-type"
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={chartType}
                                    onValueChange={(value) => value && setChartType(value)}
                                >
                                    <ToggleGroupItem value="candle" className="text-xs">
                                        <ChartNoAxesColumnIncreasing size={28} /> Candle
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="heikinashi" className="text-xs">
                                        <ChartCandlestick size={28} /> Heikin Ashi
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="interval">Interval</Label>
                            <div className="mt-3 flex">
                                <ToggleGroup
                                    id="interval"
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={interval}
                                    onValueChange={(value) => value && setInterval(value)}
                                >
                                    {["1", "3", "5", "10", "15", "30", "60"].map((val) => (
                                        <ToggleGroupItem key={val} value={val} className="text-xs">
                                            {val === "60" ? "1 H" : `${val} Min`}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default OrderSettings;