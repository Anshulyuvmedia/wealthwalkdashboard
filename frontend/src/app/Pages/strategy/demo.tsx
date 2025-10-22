import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlusCircle, CircleAlert, ChartCandlestick, ChartNoAxesColumnIncreasing, ChevronsUpDown, ChevronRight, Trash2, Check, ChevronDown, Ban, Copy, ChevronsDownUp, ChevronDownIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem, } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import { cn } from "@/lib/utils"


const AddStrategy = () => {
    const navigate = useNavigate();
    const [strategyType, setStrategyType] = useState("timebased")
    const [isCE, setIsCE] = useState(true);
    const [isBuy, setIsBuy] = useState(true);
    const [isWeekly, setIsWeekly] = useState(true);
    const [firstSelection, setFirstSelection] = useState("ATM pt");
    const [secondSelection, setSecondSelection] = useState("ATM");

    const [tpSelection, setTpSelection] = useState("TP pt");

    const [slSelection, setSlSelection] = useState("SL pt");
    const [onSelection, setOnSelection] = useState("On Price");
    const [onSelectionSec, SetOnSelectionSec] = useState("On Price");

    const [selected, setSelected] = useState("");
    const [period, setPeriod] = useState("10");
    const [type, setType] = useState("SMA");
    const frameworks = [
        { value: "moving-average", label: "Moving Average", type: "input" },
        { value: "vwap", label: "VWAP" },
        { value: "macd", label: "MACD" },
        { value: "rsi", label: "RSI" },
        { value: "supertrend", label: "SuperTrend" },
        { value: "macd-signal", label: "MACD-Signal" },
        { value: "candle", label: "Candle" },
        { value: "number", label: "Number" },
        { value: "camrila", label: "Camrila" },
        { value: "pivot-point", label: "Pivot Point" },
    ];

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

    const tpOptions = [
        "TP pt",
        "TP %",
    ];
    const slOptions = [
        "SL pt",
        "SL %",
    ];
    const priceOptions = [
        "On Price",
        "On Close",
    ];



    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 50)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Create Strategy" />
                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <form className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex-1 me-4">
                                <Input type="text" id="strategy name" placeholder="Enter Strategy Name" className="" />
                            </div>
                            <div className="space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="cursor-pointer"
                                >
                                    <Ban size={16} className="text-white " />

                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="cursor-pointer"
                                >
                                    <Trash2 size={16} className="text-white " />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Strategy Type</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ToggleGroup type="single" variant="outline" size="lg" value={strategyType}
                                    onValueChange={(val) => val && setStrategyType(val)}
                                >
                                    <ToggleGroupItem value="timebased" className="text-xs">
                                        Time Based
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="indicatorbased" className="text-xs">
                                        Indicator Based
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </CardContent>
                            <CardHeader>
                                <CardTitle className="text-lg">Select Instruments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-[150px] h-[100px] flex flex-col justify-center items-center">
                                    <PlusCircle className="mb-2 h-12 w-12" />
                                    <div>
                                        Add Instruments
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4">
                                <div className="flex space-x-4">
                                    <div className="">
                                        <Label>Order Type</Label>
                                        <div className="mt-3">
                                            <ToggleGroup type="single" variant="outline" size="lg">
                                                <ToggleGroupItem className="text-xs" value="MIS">MIS</ToggleGroupItem>
                                                <ToggleGroupItem className="text-xs" value="CNC">CNC</ToggleGroupItem>
                                                <ToggleGroupItem className="text-xs" value="BTST">BTST</ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    </div>
                                    <div className="">
                                        <Label>Start Time</Label>
                                        <div className="mt-3">
                                            <Input type="time" defaultValue="09:15" />
                                        </div>
                                    </div>
                                    <div className="">
                                        <Label>Square off</Label>
                                        <div className="mt-3">
                                            <Input type="time" defaultValue="03:15" />
                                        </div>
                                    </div>
                                    <div className="">
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
                                    <div className="">
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
                                    <div className="">
                                        <Label>Chart type</Label>
                                        <div className="mt-3 flex">
                                            <ToggleGroup type="single" variant="outline" size="lg">
                                                <ToggleGroupItem className="text-xs" value="candle"> <ChartNoAxesColumnIncreasing size={28} /> Candle</ToggleGroupItem>
                                                <ToggleGroupItem className="text-xs" value="heikinashi"> <ChartCandlestick size={28} /> Heikin Ashi</ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    </div>
                                    <div className="">
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

                        <Card>
                            <CardHeader>
                                <div className="flex justify-between w-full">
                                    <div className="flex">
                                        <CardTitle>Entry conditions</CardTitle>
                                        <div className="flex items-center space-x-2 ms-4">
                                            <Switch id="combinedChart" />
                                            <Label htmlFor="combinedChart">Use Combined Chart</Label>
                                            <Tooltip>
                                                <TooltipContent>
                                                    <p>By selecting this you can use below indicator calculations on <br /> option strikes combined chart rather than underlying script <br /> like [Banknifty, Nifty etc.]</p>
                                                </TooltipContent>
                                                <TooltipTrigger><CircleAlert size={16} /></TooltipTrigger>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <Tooltip>
                                            <TooltipContent>
                                                <p>Indicators like +di-di hekinashi test, TR test, ATR test, ADX <br /> test, Stochastic test, Parabolic jar test, Bolinger bond are not <br /> available for backtest</p>
                                            </TooltipContent>
                                            <TooltipTrigger><CircleAlert size={16} /></TooltipTrigger>
                                        </Tooltip>
                                    </div>
                                </div>
                            </CardHeader>


                            <CardContent className="space-y-4">
                                <Card>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                {/* Long Entry */}
                                                <div className="space-y-2">
                                                    <div className="text-green-600 font-medium text-center">Long Entry Condition</div>

                                                    {/* Equal width columns using Grid */}
                                                    <div className="grid grid-cols-3 gap-2 w-full">

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-[425px]">
                                                                    <DialogHeader>
                                                                        <h3 className="sr-only">Select Indicator</h3> {/* Screen-reader only title for accessibility */}
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <Command>
                                                                            <CommandInput placeholder="Search framework..." className="h-9" />
                                                                            <CommandList>
                                                                                <CommandEmpty>No framework found.</CommandEmpty>
                                                                                <CommandGroup>
                                                                                    <RadioGroup value={selected} onValueChange={setSelected}>
                                                                                        {frameworks.map((framework) => (
                                                                                            <CommandItem
                                                                                                key={framework.value}
                                                                                                value={framework.value}
                                                                                                onSelect={() => setSelected(framework.value)}
                                                                                                className="flex flex-col gap-2"
                                                                                            >
                                                                                                <div className="flex items-center space-x-2 w-full">
                                                                                                    <RadioGroupItem value={framework.value} id={framework.value} />
                                                                                                    <Label htmlFor={framework.value}>{framework.label}</Label>
                                                                                                </div>
                                                                                                {selected === framework.value && framework.value === "moving-average" && (
                                                                                                    <div className="flex gap-2 pl-6">
                                                                                                        <Input
                                                                                                            placeholder="Period (e.g. 10)"
                                                                                                            className="w-20"
                                                                                                            value={period}
                                                                                                            onChange={(e) => setPeriod(e.target.value)}
                                                                                                        />
                                                                                                        <Select value={type} onValueChange={setType}>
                                                                                                            <SelectTrigger className="w-24">
                                                                                                                <SelectValue placeholder="SMA" />
                                                                                                            </SelectTrigger>
                                                                                                            <SelectContent>
                                                                                                                <SelectItem value="SMA">SMA</SelectItem>
                                                                                                                <SelectItem value="EMA">EMA</SelectItem>
                                                                                                            </SelectContent>
                                                                                                        </Select>
                                                                                                    </div>
                                                                                                )}
                                                                                            </CommandItem>
                                                                                        ))}
                                                                                    </RadioGroup>
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <DialogClose asChild>
                                                                            <Button variant="outline">Cancel</Button>
                                                                        </DialogClose>
                                                                        <Button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                console.log("Selected:", selected, "Period:", period, "Type:", type);
                                                                                // Add your save logic here
                                                                            }}
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select comparator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                    </div>
                                                </div>



                                                {/* Short Entry */}
                                                <div className="space-y-2 mt-3">
                                                    <div className="text-red-600 font-medium text-center">Short Entry Condition</div>
                                                    <div className="flex space-x-2 w-full">

                                                        {/* Indicator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        {/* Comparator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select comparator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        {/* Second Indicator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trash Icon on Right */}
                                            <Trash2 size={20} className="text-red-600 cursor-pointer" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex items-center w-full space-x-2">
                                    <Separator className="flex-1" />

                                    <ToggleGroup type="single" variant="outline" size="lg">
                                        <ToggleGroupItem className="text-xs" value="and">AND</ToggleGroupItem>
                                        <ToggleGroupItem className="text-xs" value="or">OR</ToggleGroupItem>
                                    </ToggleGroup>

                                    <Separator className="flex-1" />
                                </div>

                                {/* Add Condition Button */}
                                <div className="w-full flex justify-center">
                                    <Button variant="outline" className="flex items-center space-x-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Add Condition</span>
                                    </Button>
                                </div>

                            </CardContent>

                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Switch id="exitConditions" />
                                    <Label htmlFor="exitConditions">Exit conditions (Optional)</Label>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Card>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                {/* Long Entry */}
                                                <div className="space-y-2">
                                                    <div className="text-green-600 font-medium text-center">Long Exit Condition</div>

                                                    {/* Equal width colu mns using Grid */}
                                                    <div className="grid grid-cols-3 gap-2 w-full">

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select comparator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                    </div>
                                                </div>



                                                {/* Short Entry */}
                                                <div className="space-y-2 mt-3">
                                                    <div className="text-red-600 font-medium text-center">Short Exit Condition</div>
                                                    <div className="flex space-x-2 w-full">

                                                        {/* Indicator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        {/* Comparator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select comparator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        {/* Second Indicator */}
                                                        <div className="flex-1 w-full">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                        <span>Select indicator</span>
                                                                        <ChevronRight size={20} />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                                            </Dialog>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trash Icon on Right */}
                                            <Trash2 size={20} className="text-red-600 cursor-pointer" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="flex items-center w-full space-x-2">
                                    <Separator className="flex-1" />

                                    <ToggleGroup type="single" variant="outline" size="lg">
                                        <ToggleGroupItem className="text-xs" value="and">AND</ToggleGroupItem>
                                        <ToggleGroupItem className="text-xs" value="or">OR</ToggleGroupItem>
                                    </ToggleGroup>

                                    <Separator className="flex-1" />
                                </div>

                                {/* Add Condition Button */}
                                <div className="w-full flex justify-center">
                                    <Button variant="outline" className="flex items-center space-x-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Add Condition</span>
                                    </Button>
                                </div>
                            </CardContent>

                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full space-x-2">
                                    <CardTitle className="text-lg">Option Position builder</CardTitle>
                                    <Button variant="default" className="flex items-center ">
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
                                                    {/* Long Entry */}
                                                    <div className="space-y-2">
                                                        <div className="flex space-x-2 items-center">
                                                            <div className="text-green-600 font-medium text-start">When Long Condition</div>

                                                            <div onClick={() => setIsCE(!isCE)}
                                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isCE ? "border-green-600" : "border-red-600"}`}>
                                                                <span className={isCE ? "text-green-600" : "text-red-600"}>
                                                                    {isCE ? "CE" : "PE"}
                                                                </span>
                                                                <ChevronsDownUp className={isCE ? "text-green-600" : "text-red-600"} size={16} />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 w-full">

                                                            <div onClick={() => setIsBuy(!isBuy)}
                                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isBuy ? "border-green-600" : "border-red-600"}`}>
                                                                <span className={isBuy ? "text-green-600" : "text-red-600"}>
                                                                    {isBuy ? "Buy" : "Sell"}
                                                                </span>
                                                                <ChevronsDownUp className={isBuy ? "text-green-600" : "text-red-600"} size={16} />
                                                            </div>

                                                            <div className="w-20">
                                                                <Input id="qty" type="number" autoComplete="off" placeholder="1" value={1} />
                                                            </div>

                                                            <div onClick={() => setIsWeekly(!isWeekly)}
                                                                className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isWeekly ? "border-yellow-600" : "border-purple-600"}`}>
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
                                                                                    <ChevronDownIcon className="size-3" />
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
                                                                                    <ChevronDownIcon className="size-3" />
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
                                                            <div onClick={() => setIsCE(!isCE)}
                                                                className={`flex items-center border text-sm bg-dark rounded-md px-3 py-1 ${!isCE ? "border-green-600" : "border-red-600"}`}>
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
                                                                                    <ChevronDownIcon className="size-3" />
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
                                                                                    <ChevronDownIcon className="size-3" />
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
                                                                                    <ChevronDownIcon className="size-3" />
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
                                                                                    <ChevronDownIcon className="size-3" />
                                                                                </InputGroupButton>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                                                {priceOptions.map((option) => (
                                                                                    <DropdownMenuItem
                                                                                        key={option}
                                                                                        onSelect={() => SetOnSelectionSec(option)}>
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
                                    {/* Trash Icon on Right */}
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

                        <div className="flex justify-end gap-4">
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Save Strategy
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider >
    );
};

export default AddStrategy;