import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch, } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, ChevronRight, CircleAlert, PlusCircle } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Condition {
    id: string;
    longIndicator: string;
    longPeriod: string;
    longType: string;
    longComparator: string;
    longSecondIndicator: string;
    shortIndicator: string;
    shortPeriod: string;
    shortType: string;
    shortComparator: string;
    shortSecondIndicator: string;
    operator: "and" | "or";
}

const EntryConditions: React.FC = () => {
    const [conditions, setConditions] = useState<Condition[]>([
        {
            id: crypto.randomUUID(),
            longIndicator: "",
            longPeriod: "10",
            longType: "SMA",
            longComparator: "",
            longSecondIndicator: "",
            shortIndicator: "",
            shortPeriod: "10",
            shortType: "SMA",
            shortComparator: "",
            shortSecondIndicator: "",
            operator: "and",
        },
    ]);

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

    const comparators = [
        { value: "equals", label: "Equals" },
        { value: "greater-than", label: "Greater Than" },
        { value: "less-than", label: "Less Than" },
        { value: "greater-equal", label: "Greater or Equal" },
        { value: "less-equal", label: "Less or Equal" },
    ];

    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                id: crypto.randomUUID(),
                longIndicator: "",
                longPeriod: "10",
                longType: "SMA",
                longComparator: "",
                longSecondIndicator: "",
                shortIndicator: "",
                shortPeriod: "10",
                shortType: "SMA",
                shortComparator: "",
                shortSecondIndicator: "",
                operator: "and",
            },
        ]);
    };

    const deleteCondition = (id: string) => {
        setConditions(conditions.filter((condition) => condition.id !== id));
    };

    const updateCondition = (id: string, updates: Partial<Condition>) => {
        setConditions(
            conditions.map((condition) =>
                condition.id === id ? { ...condition, ...updates } : condition
            )
        );
    };

    return (
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
                                    <p>
                                        By selecting this you can use below indicator calculations on <br /> option
                                        strikes combined chart rather than underlying script <br /> like [Banknifty,
                                        Nifty etc.]
                                    </p>
                                </TooltipContent>
                                <TooltipTrigger>
                                    <CircleAlert size={16} />
                                </TooltipTrigger>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex">
                        <Tooltip>
                            <TooltipContent>
                                <p>
                                    Indicators like +di-di hekinashi test, TR test, ATR test, ADX <br /> test,
                                    Stochastic test, Parabolic jar test, Bolinger bond are not <br /> available for
                                    backtest
                                </p>
                            </TooltipContent>
                            <TooltipTrigger>
                                <CircleAlert size={16} />
                            </TooltipTrigger>
                        </Tooltip>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {conditions.map((condition, index) => (
                    <React.Fragment key={condition.id}>
                        <Card>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="space-y-2">
                                            <div className="text-green-600 font-medium text-center">
                                                Long Entry Condition
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 w-full">
                                                <div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                <span>
                                                                    {condition.longIndicator
                                                                        ? frameworks.find((f) => f.value === condition.longIndicator)
                                                                            ?.label || "Select indicator"
                                                                        : "Select indicator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Indicator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search framework..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.longIndicator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { longIndicator: value })
                                                                                }
                                                                            >
                                                                                {frameworks.map((framework) => (
                                                                                    <CommandItem
                                                                                        key={framework.value}
                                                                                        value={framework.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { longIndicator: framework.value })
                                                                                        }
                                                                                        className="flex flex-col gap-2"
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={framework.value} id={framework.value} />
                                                                                            <Label htmlFor={framework.value}>{framework.label}</Label>
                                                                                        </div>
                                                                                        {condition.longIndicator === framework.value &&
                                                                                            framework.value === "moving-average" && (
                                                                                                <div className="flex gap-2 pl-6">
                                                                                                    <Input
                                                                                                        placeholder="Period (e.g. 10)"
                                                                                                        className="w-20"
                                                                                                        value={condition.longPeriod}
                                                                                                        onChange={(e) =>
                                                                                                            updateCondition(condition.id, { longPeriod: e.target.value })
                                                                                                        }
                                                                                                    />
                                                                                                    <Select
                                                                                                        value={condition.longType}
                                                                                                        onValueChange={(value) =>
                                                                                                            updateCondition(condition.id, { longType: value })
                                                                                                        }
                                                                                                    >
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
                                                                        console.log(
                                                                            "Long Indicator:",
                                                                            condition.longIndicator,
                                                                            "Period:",
                                                                            condition.longPeriod,
                                                                            "Type:",
                                                                            condition.longType
                                                                        );
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
                                                                <span>
                                                                    {condition.longComparator
                                                                        ? comparators.find((c) => c.value === condition.longComparator)
                                                                            ?.label || "Select comparator"
                                                                        : "Select comparator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Comparator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search comparator..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No comparator found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.longComparator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { longComparator: value })
                                                                                }
                                                                            >
                                                                                {comparators.map((comparator) => (
                                                                                    <CommandItem
                                                                                        key={comparator.value}
                                                                                        value={comparator.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { longComparator: comparator.value })
                                                                                        }
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={comparator.value} id={comparator.value} />
                                                                                            <Label htmlFor={comparator.value}>{comparator.label}</Label>
                                                                                        </div>
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
                                                                        console.log("Long Comparator:", condition.longComparator);
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
                                                                <span>
                                                                    {condition.longSecondIndicator
                                                                        ? frameworks.find((f) => f.value === condition.longSecondIndicator)
                                                                            ?.label || "Select indicator"
                                                                        : "Select indicator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Second Indicator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search framework..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.longSecondIndicator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { longSecondIndicator: value })
                                                                                }
                                                                            >
                                                                                {frameworks.map((framework) => (
                                                                                    <CommandItem
                                                                                        key={framework.value}
                                                                                        value={framework.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { longSecondIndicator: framework.value })
                                                                                        }
                                                                                        className="flex flex-col gap-2"
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={framework.value} id={framework.value} />
                                                                                            <Label htmlFor={framework.value}>{framework.label}</Label>
                                                                                        </div>
                                                                                        {condition.longSecondIndicator === framework.value &&
                                                                                            framework.value === "moving-average" && (
                                                                                                <div className="flex gap-2 pl-6">
                                                                                                    <Input
                                                                                                        placeholder="Period (e.g. 10)"
                                                                                                        className="w-20"
                                                                                                        value={condition.longPeriod}
                                                                                                        onChange={(e) =>
                                                                                                            updateCondition(condition.id, { longPeriod: e.target.value })
                                                                                                        }
                                                                                                    />
                                                                                                    <Select
                                                                                                        value={condition.longType}
                                                                                                        onValueChange={(value) =>
                                                                                                            updateCondition(condition.id, { longType: value })
                                                                                                        }
                                                                                                    >
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
                                                                        console.log(
                                                                            "Long Second Indicator:",
                                                                            condition.longSecondIndicator,
                                                                            "Period:",
                                                                            condition.longPeriod,
                                                                            "Type:",
                                                                            condition.longType
                                                                        );
                                                                    }}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-3">
                                            <div className="text-red-600 font-medium text-center">Short Entry Condition</div>
                                            <div className="flex space-x-2 w-full">
                                                <div className="flex-1 w-full">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                <span>
                                                                    {condition.shortIndicator
                                                                        ? frameworks.find((f) => f.value === condition.shortIndicator)
                                                                            ?.label || "Select indicator"
                                                                        : "Select indicator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Indicator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search framework..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.shortIndicator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { shortIndicator: value })
                                                                                }
                                                                            >
                                                                                {frameworks.map((framework) => (
                                                                                    <CommandItem
                                                                                        key={framework.value}
                                                                                        value={framework.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { shortIndicator: framework.value })
                                                                                        }
                                                                                        className="flex flex-col gap-2"
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={framework.value} id={framework.value} />
                                                                                            <Label htmlFor={framework.value}>{framework.label}</Label>
                                                                                        </div>
                                                                                        {condition.shortIndicator === framework.value &&
                                                                                            framework.value === "moving-average" && (
                                                                                                <div className="flex gap-2 pl-6">
                                                                                                    <Input
                                                                                                        placeholder="Period (e.g. 10)"
                                                                                                        className="w-20"
                                                                                                        value={condition.shortPeriod}
                                                                                                        onChange={(e) =>
                                                                                                            updateCondition(condition.id, { shortPeriod: e.target.value })
                                                                                                        }
                                                                                                    />
                                                                                                    <Select
                                                                                                        value={condition.shortType}
                                                                                                        onValueChange={(value) =>
                                                                                                            updateCondition(condition.id, { shortType: value })
                                                                                                        }
                                                                                                    >
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
                                                                        console.log(
                                                                            "Short Indicator:",
                                                                            condition.shortIndicator,
                                                                            "Period:",
                                                                            condition.shortPeriod,
                                                                            "Type:",
                                                                            condition.shortType
                                                                        );
                                                                    }}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                <span>
                                                                    {condition.shortComparator
                                                                        ? comparators.find((c) => c.value === condition.shortComparator)
                                                                            ?.label || "Select comparator"
                                                                        : "Select comparator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Comparator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search comparator..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No comparator found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.shortComparator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { shortComparator: value })
                                                                                }
                                                                            >
                                                                                {comparators.map((comparator) => (
                                                                                    <CommandItem
                                                                                        key={comparator.value}
                                                                                        value={comparator.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { shortComparator: comparator.value })
                                                                                        }
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={comparator.value} id={comparator.value} />
                                                                                            <Label htmlFor={comparator.value}>{comparator.label}</Label>
                                                                                        </div>
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
                                                                        console.log("Short Comparator:", condition.shortComparator);
                                                                    }}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                                <span>
                                                                    {condition.shortSecondIndicator
                                                                        ? frameworks.find((f) => f.value === condition.shortSecondIndicator)
                                                                            ?.label || "Select indicator"
                                                                        : "Select indicator"}
                                                                </span>
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Select Second Indicator</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <Command>
                                                                    <CommandInput placeholder="Search framework..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <RadioGroup
                                                                                value={condition.shortSecondIndicator}
                                                                                onValueChange={(value) =>
                                                                                    updateCondition(condition.id, { shortSecondIndicator: value })
                                                                                }
                                                                            >
                                                                                {frameworks.map((framework) => (
                                                                                    <CommandItem
                                                                                        key={framework.value}
                                                                                        value={framework.value}
                                                                                        onSelect={() =>
                                                                                            updateCondition(condition.id, { shortSecondIndicator: framework.value })
                                                                                        }
                                                                                        className="flex flex-col gap-2"
                                                                                    >
                                                                                        <div className="flex items-center space-x-2 w-full">
                                                                                            <RadioGroupItem value={framework.value} id={framework.value} />
                                                                                            <Label htmlFor={framework.value}>{framework.label}</Label>
                                                                                        </div>
                                                                                        {condition.shortSecondIndicator === framework.value &&
                                                                                            framework.value === "moving-average" && (
                                                                                                <div className="flex gap-2 pl-6">
                                                                                                    <Input
                                                                                                        placeholder="Period (e.g. 10)"
                                                                                                        className="w-20"
                                                                                                        value={condition.shortPeriod}
                                                                                                        onChange={(e) =>
                                                                                                            updateCondition(condition.id, { shortPeriod: e.target.value })
                                                                                                        }
                                                                                                    />
                                                                                                    <Select
                                                                                                        value={condition.shortType}
                                                                                                        onValueChange={(value) =>
                                                                                                            updateCondition(condition.id, { shortType: value })
                                                                                                        }
                                                                                                    >
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
                                                                        console.log(
                                                                            "Short Second Indicator:",
                                                                            condition.shortSecondIndicator,
                                                                            "Period:",
                                                                            condition.shortPeriod,
                                                                            "Type:",
                                                                            condition.shortType
                                                                        );
                                                                    }}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Trash2
                                        size={20}
                                        className="text-red-600 cursor-pointer"
                                        onClick={() => deleteCondition(condition.id)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        {index < conditions.length - 1 && (
                            <div className="flex items-center w-full space-x-2">
                                <Separator className="flex-1" />
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    size="lg"
                                    value={condition.operator}
                                    onValueChange={(value) =>
                                        value && updateCondition(condition.id, { operator: value as "and" | "or" })
                                    }
                                >
                                    <ToggleGroupItem className="text-xs" value="and">
                                        AND
                                    </ToggleGroupItem>
                                    <ToggleGroupItem className="text-xs" value="or">
                                        OR
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <Separator className="flex-1" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
                <div className="w-full flex justify-center">
                    <Button variant="outline" className="flex items-center space-x-2" onClick={addCondition}>
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Condition</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default EntryConditions;