import React, { useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert, ChartNoAxesColumnIncreasing, ChartCandlestick } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReadymadeTemplates from "@/components/strategycomponets/ReadymadeTemplates";

export interface OrderSettingsData {
    orderType: string;
    startTime: string;
    squareOff: string;
    days: string[];
    transactionType?: string;
    chartType?: string;
    interval?: string;
    template?: string;
}

interface OrderSettingsProps {
    strategyType: "timebased" | "indicatorbased";
    template: string;
    onTemplateSelect: (template: string) => void;
    onSettingsChange: (data: OrderSettingsData) => void;
    initialSettings?: OrderSettingsData;
}

const OrderSettings: React.FC<OrderSettingsProps> = ({
    strategyType,
    template,
    onTemplateSelect,
    onSettingsChange,
    initialSettings,
}) => {
    // Use initialSettings or fallback to defaults
    const orderType = initialSettings?.orderType ?? "MIS";
    const startTime = initialSettings?.startTime ?? "09:15";
    const squareOff = initialSettings?.squareOff ?? "15:15";
    const days = initialSettings?.days ?? [];
    const transactionType = initialSettings?.transactionType ?? "bothside";
    const chartType = initialSettings?.chartType ?? "candle";
    const interval = initialSettings?.interval ?? "1";

    // Build settings data
    const settingsData = useMemo<OrderSettingsData>(
        () => ({
            orderType,
            startTime,
            squareOff,
            days,
            template,
            ...(strategyType === "indicatorbased" && {
                transactionType,
                chartType,
                interval,
            }),
        }),
        [
            orderType,
            startTime,
            squareOff,
            days,
            template,
            transactionType,
            chartType,
            interval,
            strategyType,
        ]
    );

    // Notify parent on every change
    useEffect(() => {
        onSettingsChange(settingsData);
    }, [settingsData, onSettingsChange]);

    const update = (updates: Partial<OrderSettingsData>) => {
        onSettingsChange({ ...settingsData, ...updates });
    };

    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <Label htmlFor="order-type">Order Type</Label>
                        <ToggleGroup
                            id="order-type"
                            type="single"
                            variant="outline"
                            size="lg"
                            value={orderType}
                            onValueChange={(v) => v && update({ orderType: v })}
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
                            onChange={(e) => update({ startTime: e.target.value })}
                            className="mt-3"
                        />
                    </div>

                    <div>
                        <Label htmlFor="square-off">Square Off</Label>
                        <Input
                            id="square-off"
                            type="time"
                            value={squareOff}
                            onChange={(e) => update({ squareOff: e.target.value })}
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
                            onValueChange={(v) => update({ days: v })}
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
                <CardContent className="flex items-center space-x-2">
                    <ReadymadeTemplates
                        selectedTemplate={template}          // <-- current template name
                        onTemplateSelect={onTemplateSelect} // <-- your existing handler
                    />
                    <div className="text-sm text-gray-400">
                        (Selected: {template || "None"})
                    </div>
                </CardContent>
            ) : (
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <Label htmlFor="transaction-type">Transaction Type</Label>
                            <div className="mt-3 flex items-center space-x-3">
                                <ToggleGroup
                                    id="transaction-type"
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={transactionType}
                                    onValueChange={(v) => v && update({ transactionType: v })}
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
                            <ToggleGroup
                                id="chart-type"
                                type="single"
                                variant="outline"
                                size="lg"
                                value={chartType}
                                onValueChange={(v) => v && update({ chartType: v })}
                                className="mt-3"
                            >
                                <ToggleGroupItem value="candle" className="text-xs">
                                    <ChartNoAxesColumnIncreasing size={28} /> Candle
                                </ToggleGroupItem>
                                <ToggleGroupItem value="heikinashi" className="text-xs">
                                    <ChartCandlestick size={28} /> Heikin Ashi
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        <div>
                            <Label htmlFor="interval">Interval</Label>
                            <ToggleGroup
                                id="interval"
                                type="single"
                                variant="outline"
                                size="lg"
                                value={interval}
                                onValueChange={(v) => v && update({ interval: v })}
                                className="mt-3"
                            >
                                {["1", "3", "5", "10", "15", "30", "60"].map((val) => (
                                    <ToggleGroupItem key={val} value={val} className="text-xs">
                                        {val === "60" ? "1 H" : `${val} Min`}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default OrderSettings;