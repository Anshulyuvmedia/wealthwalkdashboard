import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartNoAxesColumnIncreasing, ChartCandlestick } from "lucide-react";

const OrderSettings: React.FC = () => {
    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <div>
                        <Label>Order Type</Label>
                        <div className="mt-3">
                            <ToggleGroup type="single" variant="outline" size="lg">
                                <ToggleGroupItem className="text-xs" value="MIS">MIS</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="CNC">CNC</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="BTST">BTST</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                    <div>
                        <Label>Start Time</Label>
                        <div className="mt-3">
                            <Input type="time" defaultValue="09:15" />
                        </div>
                    </div>
                    <div>
                        <Label>Square off</Label>
                        <div className="mt-3">
                            <Input type="time" defaultValue="03:15" />
                        </div>
                    </div>
                    <div>
                        <Label>Days</Label>
                        <div className="mt-3">
                            <ToggleGroup type="multiple" variant="outline" size="lg">
                                <ToggleGroupItem className="text-xs" value="MON">MON</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="TUE">TUE</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="WED">WED</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="THU">THU</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="FRI">FRI</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <div>
                        <Label>Transaction type</Label>
                        <div className="mt-3 flex">
                            <ToggleGroup type="single" variant="outline" size="lg">
                                <ToggleGroupItem className="text-xs" value="bothside">Both Side</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="onlylong">Only Long</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="onlyshort">Only Short</ToggleGroupItem>
                            </ToggleGroup>
                            <div className="ms-3 mt-3">
                                <Tooltip>
                                    <TooltipContent>
                                        <p>Only short and only long are available for live market only.</p>
                                    </TooltipContent>
                                    <TooltipTrigger><CircleAlert size={16} /></TooltipTrigger>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label>Chart type</Label>
                        <div className="mt-3 flex">
                            <ToggleGroup type="single" variant="outline" size="lg">
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
                            <ToggleGroup type="single" variant="outline" size="lg">
                                <ToggleGroupItem className="text-xs" value="1">1 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="3">3 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="5">5 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="10">10 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="15">15 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="30">30 Min</ToggleGroupItem>
                                <ToggleGroupItem className="text-xs" value="60">1 H</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSettings;