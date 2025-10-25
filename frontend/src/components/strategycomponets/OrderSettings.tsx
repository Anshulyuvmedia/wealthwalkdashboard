import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartNoAxesColumnIncreasing, ChartCandlestick } from "lucide-react";
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

interface StrategyTypeProps {
    strategyType: "timebased" | "indicatorbased";
    template: string;
    onTemplateSelect: (template: string) => void;
    onSettingsChange: (data: OrderSettingsData) => void;
}

const OrderSettings: React.FC<StrategyTypeProps> = ({ strategyType, template, onTemplateSelect, onSettingsChange }) => {
    const [orderType, setOrderType] = useState<string>("MIS");
    const [startTime, setStartTime] = useState<string>("09:15");
    const [squareOff, setSquareOff] = useState<string>("03:15");
    const [days, setDays] = useState<string[]>([]);
    const [transactionType, setTransactionType] = useState<string>("bothside");
    const [chartType, setChartType] = useState<string>("candle");
    const [interval, setInterval] = useState<string>("1");

    // Memoize onSettingsChange to prevent unnecessary re-renders
    const memoizedOnSettingsChange = useCallback((data: OrderSettingsData) => {
        onSettingsChange(data);
    }, [onSettingsChange]);

    // Notify parent whenever relevant state changes
    useEffect(() => {
        const data: OrderSettingsData = {
            orderType,
            startTime,
            squareOff,
            days,
            ...(strategyType === "indicatorbased" && {
                transactionType,
                chartType,
                interval,
            }),
        };
        memoizedOnSettingsChange(data);
    }, [orderType, startTime, squareOff, days, transactionType, chartType, interval, strategyType, memoizedOnSettingsChange]);

    const handleOrderTypeChange = (value: string) => {
        if (value) {
            setOrderType(value);
        }
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
    };

    const handleSquareOffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSquareOff(e.target.value);
    };

    const handleDaysChange = (value: string[]) => {
        setDays(value);
    };

    const handleTransactionTypeChange = (value: string) => {
        if (value) {
            setTransactionType(value);
        }
    };

    const handleChartTypeChange = (value: string) => {
        if (value) {
            setChartType(value);
        }
    };

    const handleIntervalChange = (value: string) => {
        if (value) {
            setInterval(value);
        }
    };

    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <div>
                        <Label>Order Type</Label>
                        <div className="mt-3">
                            <ToggleGroup
                                type="single"
                                variant="outline"
                                size="lg"
                                value={orderType}
                                onValueChange={handleOrderTypeChange}
                            >
                                <ToggleGroupItem className="text-xs" value="MIS">
                                    MIS
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="CNC">
                                    CNC
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="BTST">
                                    BTST
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                    <div>
                        <Label>Start Time</Label>
                        <div className="mt-3">
                            <Input type="time" value={startTime} onChange={handleStartTimeChange} />
                        </div>
                    </div>
                    <div>
                        <Label>Square off</Label>
                        <div className="mt-3">
                            <Input type="time" value={squareOff} onChange={handleSquareOffChange} />
                        </div>
                    </div>
                    <div>
                        <Label>Days</Label>
                        <div className="mt-3">
                            <ToggleGroup
                                type="multiple"
                                variant="outline"
                                size="lg"
                                value={days}
                                onValueChange={handleDaysChange}
                            >
                                <ToggleGroupItem className="text-xs" value="MON">
                                    MON
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="TUE">
                                    TUE
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="WED">
                                    WED
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="THU">
                                    THU
                                </ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="FRI">
                                    FRI
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>
            </CardContent>

            {strategyType === "timebased" ? (
                <CardContent className="space-y-4 flex items-center space-x-2">
                    <ReadymadeTemplates onTemplateSelect={onTemplateSelect} />
                    <div className="text-sm text-gray-400">(Selected: {template})</div>
                </CardContent>
            ) : (
                <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                        <div>
                            <Label>Transaction type</Label>
                            <div className="mt-3 flex">
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={transactionType}
                                    onValueChange={handleTransactionTypeChange}
                                >
                                    <ToggleGroupItem className="text-xs" value="bothside">
                                        Both Side
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="onlylong">
                                        Only Long
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="onlyshort">
                                        Only Short
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <div className="ms-3 mt-3">
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
                        </div>
                        <div>
                            <Label>Chart type</Label>
                            <div className="mt-3 flex">
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={chartType}
                                    onValueChange={handleChartTypeChange}
                                >
                                    <ToggleGroupItem className="text-xs" value="candle">
                                        <ChartNoAxesColumnIncreasing size={28} /> Candle
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="heikinashi">
                                        <ChartCandlestick size={28} /> Heikin Ashi
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                        <div>
                            <Label>Interval</Label>
                            <div className="mt-3 flex">
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={interval}
                                    onValueChange={handleIntervalChange}
                                >
                                    <ToggleGroupItem className="text-xs" value="1">
                                        1 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="3">
                                        3 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="5">
                                        5 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="10">
                                        10 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="15">
                                        15 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="30">
                                        30 Min
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="60">
                                        1 H
                                    </ToggleGroupItem>
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