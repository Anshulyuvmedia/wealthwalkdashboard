import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleAlert } from "lucide-react";

const RiskManagement: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <div className="flex">
                        <CardTitle className="text-lg me-3">Risk management</CardTitle>
                        <Tooltip>
                            <TooltipContent>
                                <p>Max profit and Max loss is available for live market only.</p>
                            </TooltipContent>
                            <TooltipTrigger><CircleAlert size={16} /></TooltipTrigger>
                        </Tooltip>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="profit">Exit When Over All Profit In Amount (INR)</Label>
                        <Input type="number" id="profit" placeholder="Exit When Over All Profit In Amount (INR)" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="loss">Exit When Over All Loss In Amount(INR)</Label>
                        <Input type="number" id="loss" placeholder="Exit When Over All Loss In Amount(INR)" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="total">Max Total Trade</Label>
                        <Input type="number" id="total" placeholder="Max Total Trade" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="time">No Trade After</Label>
                        <Input type="time" id="time" placeholder="No Trade After" />
                    </div>
                </div>
            </CardContent>
            <CardContent className="space-y-4">
                <div className="flex">
                    <CardTitle className="text-base me-3">Profit Trailing</CardTitle>
                    <Tooltip>
                        <TooltipContent>
                            <p>For Indicator based, this feature can be used in live market only, not in backtest</p>
                        </TooltipContent>
                        <TooltipTrigger><CircleAlert size={16} /></TooltipTrigger>
                    </Tooltip>
                </div>
                <Tabs defaultValue="notrailing" className="">
                    <TabsList>
                        <TabsTrigger value="notrailing">No Trailing</TabsTrigger>
                        <TabsTrigger value="lockfixprofit">Lock Fix Profit</TabsTrigger>
                        <TabsTrigger value="trailprofit">Trail Profit</TabsTrigger>
                        <TabsTrigger value="lockandtrail">Lock and Trail</TabsTrigger>
                    </TabsList>
                    <TabsContent value="notrailing"></TabsContent>
                    <TabsContent value="lockfixprofit">
                        <div className="flex space-x-4 mt-3">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="ifprofit" placeholder="If Profit Reaches" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="profitat" placeholder="Lock Profit at" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="trailprofit">
                        <div className="flex space-x-4 mt-3">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="everyincrease" placeholder="On every increase of" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="trailprofitby" placeholder="Trail profit by" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="lockandtrail">
                        <div className="flex space-x-4 mt-3">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="ifprofit" placeholder="If profit reaches" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="profitat" placeholder="Lock profit at" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="everyincrease" placeholder="On every increase of" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Input type="number" id="trailprofitby" placeholder="Trail profit by" />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default RiskManagement;