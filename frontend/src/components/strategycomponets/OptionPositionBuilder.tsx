import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, Copy, ChevronsDownUp, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";

interface OptionLeg {
    id: string;
    longIsCE: "CE" | "PE";
    shortIsCE: "CE" | "PE";
    isBuy: "Buy" | "Sell";
    isWeekly: "Weekly" | "Monthly";
    qty: number;
    firstSelection: string;
    secondSelection: string;
    tpSelection: string;
    tpValue: number;
    tpOn: string;
    slSelection: string;
    slValue: number;
    slOn: string;
    prePunchSL: boolean;
}

interface OptionPositionBuilderData {
    positions: OptionLeg[];
}

interface OptionPositionBuilderProps {
    onPositionsChange: (data: OptionPositionBuilderData) => void;
    initialPositions?: OptionLeg[]; // Pre-populated data from API
}

const OptionPositionBuilder: React.FC<OptionPositionBuilderProps> = ({
    onPositionsChange,
    initialPositions = [],
}) => {
    const [legs, setLegs] = useState<OptionLeg[]>([]);

    const firstOptions = ["ATM pt", "ATM %", "CP", "CP >=", "CP <="];
    const secondOptions = [
        "ITM 1950", "ITM 1900", "ITM 1850", "ITM 1800", "ITM 1750",
        "ITM 1700", "ITM 1650", "ITM 1600", "ITM 1550", "ITM 1500",
        "ITM 1450", "ITM 1400", "ITM 1350", "ITM 1300", "ITM 1250",
        "ITM 1200", "ITM 1150", "ITM 1100", "ITM 1050", "ITM 1000",
        "ITM 950", "ITM 900", "ITM 850", "ITM 800", "ITM 750",
        "ITM 700", "ITM 650", "ITM 600", "ITM 550", "ITM 500",
        "ITM 450", "ITM 400", "ITM 350", "ITM 300", "ITM 250",
        "ITM 200", "ITM 150", "ITM 100", "ITM 50", "ATM",
        "OTM 50", "OTM 100", "OTM 150", "OTM 200", "OTM 250",
        "OTM 300", "OTM 350", "OTM 400", "OTM 450", "OTM 500",
        "OTM 550", "OTM 600", "OTM 650", "OTM 700", "OTM 750",
        "OTM 800", "OTM 850", "OTM 900", "OTM 950", "OTM 1000",
        "OTM 1050", "OTM 1100", "OTM 1150", "OTM 1200", "OTM 1250",
        "OTM 1300", "OTM 1350", "OTM 1400", "OTM 1450", "OTM 1500",
        "OTM 1550", "OTM 1600", "OTM 1650", "OTM 1700", "OTM 1750",
        "OTM 1800", "OTM 1850", "OTM 1900", "OTM 1950", "OTM 2000",
    ];
    const tpOptions = ["TP pt", "TP %"];
    const slOptions = ["SL pt", "SL %"];
    const priceOptions = ["On Price", "On Close"];

    // Initialize with API data or default leg
    useEffect(() => {
        if (initialPositions.length > 0) {
            setLegs(initialPositions);
        } else if (legs.length === 0) {
            setLegs([
                {
                    id: uuidv4(),
                    longIsCE: "CE",
                    shortIsCE: "PE",
                    isBuy: "Buy",
                    isWeekly: "Weekly",
                    qty: 1,
                    firstSelection: "ATM pt",
                    secondSelection: "ATM",
                    tpSelection: "TP pt",
                    tpValue: 30,
                    tpOn: "On Price",
                    slSelection: "SL pt",
                    slValue: 30,
                    slOn: "On Price",
                    prePunchSL: false,
                },
            ]);
        }
    }, [initialPositions]);

    // Notify parent of changes
    useEffect(() => {
        onPositionsChange({ positions: legs });
    }, [legs, onPositionsChange]);

    const addLeg = useCallback(() => {
        setLegs((prev) => [
            ...prev,
            {
                id: uuidv4(),
                longIsCE: "CE",
                shortIsCE: "PE",
                isBuy: "Buy",
                isWeekly: "Weekly",
                qty: 1,
                firstSelection: "ATM pt",
                secondSelection: "ATM",
                tpSelection: "TP pt",
                tpValue: 30,
                tpOn: "On Price",
                slSelection: "SL pt",
                slValue: 30,
                slOn: "On Price",
                prePunchSL: false,
            },
        ]);
    }, []);

    const deleteLeg = useCallback((id: string) => {
        setLegs((prev) => prev.filter((leg) => leg.id !== id));
    }, []);

    const duplicateLeg = useCallback((id: string) => {
        setLegs((prev) => {
            const legToDuplicate = prev.find((leg) => leg.id === id);
            if (!legToDuplicate) return prev;
            return [...prev, { ...legToDuplicate, id: uuidv4() }];
        });
    }, []);

    const updateLeg = useCallback((id: string, field: keyof OptionLeg, value: any) => {
        setLegs((prev) =>
            prev.map((leg) =>
                leg.id === id ? { ...leg, [field]: value } : leg
            )
        );
    }, []);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full space-x-2">
                    <CardTitle className="text-lg">Option Position Builder</CardTitle>
                    <Button type="button" variant="default" className="flex items-center" onClick={addLeg}>
                        <span>Add Leg</span>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {legs.map((leg) => (
                    <div key={leg.id} className="flex items-center">
                        <Card className="flex-1">
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-4">
                                        <div className="space-y-2">
                                            <div className="flex space-x-2 items-center">
                                                <div className="text-green-600 font-medium text-start">When Long Condition</div>
                                                <div
                                                    onClick={() => updateLeg(leg.id, "longIsCE", leg.longIsCE === "CE" ? "PE" : "CE")}
                                                    className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${leg.longIsCE === "CE" ? "border-green-600" : "border-red-600"}`}
                                                >
                                                    <span className={leg.longIsCE === "CE" ? "text-green-600" : "text-red-600"}>
                                                        {leg.longIsCE}
                                                    </span>
                                                    <ChevronsDownUp className={leg.longIsCE === "CE" ? "text-green-600" : "text-red-600"} size={16} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <div
                                                    onClick={() => updateLeg(leg.id, "isBuy", leg.isBuy === "Buy" ? "Sell" : "Buy")}
                                                    className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${leg.isBuy === "Buy" ? "border-green-600" : "border-red-600"}`}
                                                >
                                                    <span className={leg.isBuy === "Buy" ? "text-green-600" : "text-red-600"}>
                                                        {leg.isBuy}
                                                    </span>
                                                    <ChevronsDownUp className={leg.isBuy === "Buy" ? "text-green-600" : "text-red-600"} size={16} />
                                                </div>
                                                <div className="w-25">
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id={`qty-${leg.id}`}
                                                            type="number"
                                                            autoComplete="off"
                                                            placeholder="1"
                                                            value={leg.qty}
                                                            onChange={(e) => updateLeg(leg.id, "qty", parseInt(e.target.value) || 1)}
                                                        />
                                                        <InputGroupAddon>
                                                            <InputGroupText>Qty:</InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                                <div
                                                    onClick={() => updateLeg(leg.id, "isWeekly", leg.isWeekly === "Weekly" ? "Monthly" : "Weekly")}
                                                    className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${leg.isWeekly === "Weekly" ? "border-yellow-600" : "border-purple-600"}`}
                                                >
                                                    <span className={leg.isWeekly === "Weekly" ? "text-yellow-600" : "text-purple-600"}>
                                                        {leg.isWeekly}
                                                    </span>
                                                    <ChevronsDownUp className={leg.isWeekly === "Weekly" ? "text-yellow-600" : "text-purple-600"} size={16} />
                                                </div>
                                                <div>
                                                    <InputGroup className="[--radius:1rem] flex justify-between">
                                                        <InputGroupAddon align="inline-start">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer">
                                                                        {leg.firstSelection}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {firstOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "firstSelection", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                        <InputGroupAddon align="inline-end">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                        {leg.secondSelection}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {secondOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "secondSelection", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex space-x-2 items-center">
                                                <div className="text-red-600 font-medium text-center">When Short Condition</div>
                                                <div
                                                    onClick={() => updateLeg(leg.id, "shortIsCE", leg.shortIsCE === "CE" ? "PE" : "CE")}
                                                    className={`flex items-center border text-sm bg-dark rounded-md px-3 py-1 ${leg.shortIsCE === "CE" ? "border-green-600" : "border-red-600"}`}
                                                >
                                                    <span className={leg.shortIsCE === "CE" ? "text-green-600" : "text-red-600"}>
                                                        {leg.shortIsCE}
                                                    </span>
                                                    <ChevronsDownUp className={leg.shortIsCE === "CE" ? "text-green-600" : "text-red-600"} size={16} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <div>
                                                    <InputGroup className="[--radius:1rem] flex justify-between">
                                                        <InputGroupAddon align="inline-start">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                        {leg.slSelection}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {slOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "slSelection", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            placeholder="30"
                                                            className="w-20"
                                                            type="number"
                                                            value={leg.slValue}
                                                            onChange={(e) => updateLeg(leg.id, "slValue", parseFloat(e.target.value) || 30)}
                                                        />
                                                        <InputGroupAddon>
                                                            <InputGroupText>Qty:</InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupAddon align="inline-end">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                        {leg.slOn}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {priceOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "slOn", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                                <div>
                                                    <InputGroup className="[--radius:1rem] flex justify-between">
                                                        <InputGroupAddon align="inline-start">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                        {leg.tpSelection}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {tpOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "tpSelection", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            placeholder="30"
                                                            className="w-20"
                                                            type="number"
                                                            value={leg.tpValue}
                                                            onChange={(e) => updateLeg(leg.id, "tpValue", parseFloat(e.target.value) || 30)}
                                                        />
                                                        <InputGroupAddon>
                                                            <InputGroupText>Qty:</InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupAddon align="inline-end">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                        {leg.tpOn}
                                                                        <ChevronDown className="size-3" />
                                                                    </InputGroupButton>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                    {priceOptions.map((option) => (
                                                                        <DropdownMenuItem
                                                                            key={option}
                                                                            onSelect={() => updateLeg(leg.id, "tpOn", option)}
                                                                        >
                                                                            {option}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center w-full space-x-2">
                                    <Separator className="flex-1" />
                                    Advance Feature
                                    <ChevronDown />
                                    <Separator className="flex-1" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`prepunchsl-${leg.id}`}
                                        checked={leg.prePunchSL}
                                        onCheckedChange={(checked) => updateLeg(leg.id, "prePunchSL", checked === true)}
                                    />
                                    <Label htmlFor={`prepunchsl-${leg.id}`}>Pre Punch SL</Label>
                                </div>
                            </CardContent>
                        </Card>
                        <Trash2
                            size={20}
                            className="text-red-600 cursor-pointer ms-3"
                            onClick={() => deleteLeg(leg.id)}
                        />
                        <Copy
                            size={20}
                            className="text-yellow-600 cursor-pointer ms-3"
                            onClick={() => duplicateLeg(leg.id)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default OptionPositionBuilder;