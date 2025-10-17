import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch, } from "@/components/ui/switch";
import { PlusCircle, Trash2, Copy, ChevronsDownUp, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";


const OptionPositionBuilder: React.FC = () => {
    const [isCE, setIsCE] = useState(true);
    const [isBuy, setIsBuy] = useState(true);
    const [isWeekly, setIsWeekly] = useState(true);
    const [firstSelection, setFirstSelection] = useState("ATM pt");
    const [secondSelection, setSecondSelection] = useState("ATM");
    const [tpSelection, setTpSelection] = useState("TP pt");
    const [slSelection, setSlSelection] = useState("SL pt");
    const [onSelection, setOnSelection] = useState("On Price");
    const [onSelectionSec, SetOnSelectionSec] = useState("On Price");

    const firstOptions = [
        "ATM pt",
        "ATM %",
        "CP",
        "CP >=",
        "CP <="
    ];

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
        "OTM 1800", "OTM 1850", "OTM 1900", "OTM 1950", "OTM 2000"
    ];

    const tpOptions = ["TP pt", "TP %"];
    const slOptions = ["SL pt", "SL %"];
    const priceOptions = ["On Price", "On Close"];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full space-x-2">
                    <CardTitle className="text-lg">Option Position builder</CardTitle>
                    <Button variant="default" className="flex items-center">
                        <span>Add Leg</span>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex">
                    <Card>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex space-x-4">
                                    <div className="space-y-2">
                                        <div className="flex space-x-2 items-center">
                                            <div className="text-green-600 font-medium text-start">When Long Condition</div>
                                            <div
                                                onClick={() => setIsCE(!isCE)}
                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isCE ? "border-green-600" : "border-red-600"}`}
                                            >
                                                <span className={isCE ? "text-green-600" : "text-red-600"}>
                                                    {isCE ? "CE" : "PE"}
                                                </span>
                                                <ChevronsDownUp className={isCE ? "text-green-600" : "text-red-600"} size={16} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <div
                                                onClick={() => setIsBuy(!isBuy)}
                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isBuy ? "border-green-600" : "border-red-600"}`}
                                            >
                                                <span className={isBuy ? "text-green-600" : "text-red-600"}>
                                                    {isBuy ? "Buy" : "Sell"}
                                                </span>
                                                <ChevronsDownUp className={isBuy ? "text-green-600" : "text-red-600"} size={16} />
                                            </div>
                                            <div className="w-20">
                                                <Input id="qty" type="number" autoComplete="off" placeholder="1" value={1} />
                                            </div>
                                            <div
                                                onClick={() => setIsWeekly(!isWeekly)}
                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isWeekly ? "border-yellow-600" : "border-purple-600"}`}
                                            >
                                                <span className={isWeekly ? "text-yellow-600" : "text-purple-600"}>
                                                    {isWeekly ? "Weekly" : "Monthly"}
                                                </span>
                                                <ChevronsDownUp className={isWeekly ? "text-yellow-600" : "text-purple-600"} size={16} />
                                            </div>
                                            <div>
                                                <InputGroup className="[--radius:1rem] flex justify-between">
                                                    <InputGroupAddon align="inline-start">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer">
                                                                    {firstSelection}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {firstOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => setFirstSelection(option)}
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
                                                                    {secondSelection}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {secondOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => setSecondSelection(option)}
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
                                                onClick={() => setIsCE(!isCE)}
                                                className={`flex items-center border text-sm bg-dark rounded-md px-3 py-1 ${!isCE ? "border-green-600" : "border-red-600"}`}
                                            >
                                                <span className={!isCE ? "text-green-600" : "text-red-600"}>
                                                    {!isCE ? "CE" : "PE"}
                                                </span>
                                                <ChevronsDownUp className={!isCE ? "text-green-600" : "text-red-600"} size={16} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <div>
                                                <InputGroup className="[--radius:1rem] flex justify-between">
                                                    <InputGroupAddon align="inline-start">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                    {slSelection}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {slOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => setSlSelection(option)}
                                                                    >
                                                                        {option}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </InputGroupAddon>
                                                    <InputGroupInput placeholder="30" className="w-20" type="number" />
                                                    <InputGroupAddon align="inline-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                    {onSelection}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {priceOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => setOnSelection(option)}
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
                                                                    {tpSelection}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {tpOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => setTpSelection(option)}
                                                                    >
                                                                        {option}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </InputGroupAddon>
                                                    <InputGroupInput placeholder="30" className="w-20" type="number" />
                                                    <InputGroupAddon align="inline-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <InputGroupButton variant="ghost" className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white">
                                                                    {onSelectionSec}
                                                                    <ChevronDown className="size-3" />
                                                                </InputGroupButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                {priceOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option}
                                                                        onSelect={() => SetOnSelectionSec(option)}
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
                        </CardContent>
                    </Card>
                    <Trash2 size={20} className="text-red-600 cursor-pointer ms-3" />
                    <Copy size={20} className="text-yellow-600 cursor-pointer ms-3" />
                </div>
                <div className="flex items-center w-full space-x-2">
                    <Separator className="flex-1" />
                    Advance Feature
                    <ChevronDown />
                    <Separator className="flex-1" />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="exitConditions" />
                    <Label htmlFor="exitConditions">Pre Punch SL</Label>
                </div>
            </CardContent>
        </Card>
    );
};

export default OptionPositionBuilder;