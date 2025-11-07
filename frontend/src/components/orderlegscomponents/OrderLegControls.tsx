import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsDownUp, Trash2, Copy, ChevronDown } from "lucide-react";
import { AdvanceFeatureInputs } from "@/components/orderlegscomponents/AdvanceFeatureInputs";
import { Separator } from "@/components/ui/separator";

interface OrderLegControlsProps {
    qty: number;
    setQty: (value: number) => void;
    slQty: number;
    setSlQty: (value: number) => void;
    tpQty: number;
    setTpQty: (value: number) => void;
    isBuy: "Buy" | "Sell";
    setIsBuy: (value: "Buy" | "Sell") => void;
    isCE: "CE" | "PE";
    setIsCE: (value: "CE" | "PE") => void;
    isWeekly: "Weekly" | "Monthly";
    setIsWeekly: (value: "Weekly" | "Monthly") => void;
    firstSelection: string;
    setFirstSelection: (value: string) => void;
    secondSelection: string;
    setSecondSelection: (value: string) => void;
    tpSelection: string;
    setTpSelection: (value: string) => void;
    slSelection: string;
    setSlSelection: (value: string) => void;
    onSelection: string;
    setOnSelection: (value: string) => void;
    onSelectionSec: string;
    setOnSelectionSec: (value: string) => void;
    firstOptions: string[];
    secondOptions: string[];
    tpOptions: string[];
    slOptions: string[];
    priceOptions: string[];
    onDelete?: () => void;
    onCopy?: () => void;
    moveSLToCost: boolean;
    exitAllOnSLTgt: boolean;
    prePunchSL: boolean;
    premiumDifference: boolean;
    waitAndTrade: boolean;
    reEntryExecute: boolean;
    trailSL: boolean;

    // ---- per-leg advance fields ----
    premiumDiffValue: number | "";
    setPremiumDiffValue: (value: number | "") => void;
    waitAndTradeValue: number | "";
    setWaitAndTradeValue: (value: number | "") => void;
    waitAndTradeUnit: string;
    setWaitAndTradeUnit: (value: string) => void;
    reEntryMode: string;
    setReEntryMode: (value: string) => void;
    reEntryValue: number | "";
    setReEntryValue: (value: number | "") => void;
    executionType: string;
    setExecutionType: (value: string) => void;
    executionTypeSelection: string;
    setExecutionTypeSelection: (value: string) => void;
    tslMode: string;
    setTslMode: (value: string) => void;
    tslSelection: string;
    setTslSelection: (value: string) => void;
    tslTrailBy: string;
    setTslTrailBy: (value: string) => void;

    waitAndTradeTimeOptions: string[];
    reEntryExecuteOptions: string[];
    executionOptions: string[];
    trailSlOptions: string[];
    tslOptions: string[];
}

export const OrderLegControls: React.FC<OrderLegControlsProps> = ({
    qty,
    setQty,
    slQty,
    setSlQty,
    tpQty,
    setTpQty,
    isBuy,
    setIsBuy,
    isCE,
    setIsCE,
    isWeekly,
    setIsWeekly,
    firstSelection,
    setFirstSelection,
    secondSelection,
    setSecondSelection,
    tpSelection,
    setTpSelection,
    slSelection,
    setSlSelection,
    onSelection,
    setOnSelection,
    onSelectionSec,
    setOnSelectionSec,
    firstOptions,
    secondOptions,
    tpOptions,
    slOptions,
    priceOptions,
    onDelete,
    onCopy,
    premiumDifference,
    waitAndTrade,
    reEntryExecute,
    trailSL,
    premiumDiffValue,
    setPremiumDiffValue,
    waitAndTradeValue,
    setWaitAndTradeValue,
    waitAndTradeUnit,
    setWaitAndTradeUnit,
    reEntryMode,
    setReEntryMode,
    reEntryValue,
    setReEntryValue,
    executionType,
    setExecutionType,
    executionTypeSelection,
    setExecutionTypeSelection,
    tslMode,
    setTslMode,
    tslSelection,
    setTslSelection,
    tslTrailBy,
    setTslTrailBy,
    waitAndTradeTimeOptions,
    reEntryExecuteOptions,
    executionOptions,
    tslOptions,
}) => {
    return (
        <div className="flex items-center">
            <Card>
                <CardContent className="space-y-4 p-4">
                    {/* ---------- Top Row ---------- */}
                    <div className="flex flex-row gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsBuy(isBuy === "Buy" ? "Sell" : "Buy")}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${isBuy === "Buy"
                                        ? "bg-green-900/20 border-green-600 text-green-400"
                                        : "bg-red-900/20 border-red-600 text-red-400"
                                    }`}
                            >
                                <span>{isBuy}</span>
                                <ChevronsDownUp size={14} />
                            </button>

                            <InputGroup className="w-24">
                                <InputGroupInput
                                    type="number"
                                    value={qty}
                                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                                    min={1}
                                    className="text-center"
                                />
                                <InputGroupAddon>
                                    <InputGroupText>Qty</InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>

                            <button
                                type="button"
                                onClick={() => setIsCE(isCE === "CE" ? "PE" : "CE")}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${isCE === "CE"
                                        ? "bg-green-900/20 border-green-600 text-green-400"
                                        : "bg-red-900/20 border-red-600 text-red-400"
                                    }`}
                            >
                                <span>{isCE}</span>
                                <ChevronsDownUp size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsWeekly(isWeekly === "Weekly" ? "Monthly" : "Weekly")}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${isWeekly === "Weekly"
                                        ? "bg-yellow-900/20 border-yellow-600 text-yellow-400"
                                        : "bg-purple-900/20 border-purple-600 text-purple-400"
                                    }`}
                            >
                                <span>{isWeekly}</span>
                                <ChevronsDownUp size={14} />
                            </button>

                            <InputGroup className="flex-1 [--radius:0.75rem]">
                                <InputGroupAddon align="inline-start">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs">
                                                {firstSelection} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {firstOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setFirstSelection(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs bg-gray-700 text-white">
                                                {secondSelection} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {secondOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setSecondSelection(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        {/* ---------- SL & TP Row ---------- */}
                        <div className="flex items-center gap-3">
                            <InputGroup className="flex-1 [--radius:0.75rem]">
                                <InputGroupAddon align="inline-start">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs bg-gray-700 text-white">
                                                {slSelection} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {slOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setSlSelection(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="number"
                                    value={slQty}
                                    onChange={(e) => setSlQty(Math.max(0, Number(e.target.value) || 0))}
                                    min={0}
                                    className="w-16 text-center"
                                />
                                <InputGroupAddon>
                                    <InputGroupText>Qty</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs bg-gray-700 text-white">
                                                {onSelection} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {priceOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setOnSelection(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                            </InputGroup>

                            <InputGroup className="flex-1 [--radius:0.75rem]">
                                <InputGroupAddon align="inline-start">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs bg-gray-700 text-white">
                                                {tpSelection} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {tpOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setTpSelection(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="number"
                                    value={tpQty}
                                    onChange={(e) => setTpQty(Math.max(0, Number(e.target.value) || 0))}
                                    min={0}
                                    className="w-16 text-center"
                                />
                                <InputGroupAddon>
                                    <InputGroupText>Qty</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <InputGroupButton variant="ghost" className="text-xs bg-gray-700 text-white">
                                                {onSelectionSec} <ChevronDown className="ml-1 h-3 w-3" />
                                            </InputGroupButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {priceOptions.map((opt) => (
                                                <DropdownMenuItem key={opt} onSelect={() => setOnSelectionSec(opt)}>
                                                    {opt}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>

                    {/* ---------- Advance Features (per-leg) ---------- */}
                    {(premiumDifference || waitAndTrade || reEntryExecute || trailSL) && (
                        <>
                            <div className="flex items-center gap-2 my-3">
                                <Separator className="flex-1" />
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Advance Features
                                </span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                <Separator className="flex-1" />
                            </div>

                            <AdvanceFeatureInputs
                                premiumDifference={premiumDifference}
                                premiumDiffValue={premiumDiffValue}
                                setPremiumDiffValue={setPremiumDiffValue}
                                waitAndTrade={waitAndTrade}
                                waitAndTradeValue={waitAndTradeValue}
                                setWaitAndTradeValue={setWaitAndTradeValue}
                                waitAndTradeUnit={waitAndTradeUnit}
                                setWaitAndTradeUnit={setWaitAndTradeUnit}
                                reEntryExecute={reEntryExecute}
                                reEntryMode={reEntryMode}
                                setReEntryMode={setReEntryMode}
                                reEntryValue={reEntryValue}
                                setReEntryValue={setReEntryValue}
                                executionType={executionType}
                                setExecutionType={setExecutionType}
                                executionTypeSelection={executionTypeSelection}
                                setExecutionTypeSelection={setExecutionTypeSelection}
                                trailSL={trailSL}
                                tslMode={tslMode}
                                setTslMode={setTslMode}
                                tslSelection={tslSelection}
                                setTslSelection={setTslSelection}
                                tslTrailBy={tslTrailBy}
                                setTslTrailBy={setTslTrailBy}
                                waitAndTradeTimeOptions={waitAndTradeTimeOptions}
                                reEntryExecuteOptions={reEntryExecuteOptions}
                                executionOptions={executionOptions}
                                trailSlOptions={[]}   // not used here
                                tslOptions={tslOptions}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-2 ml-3">
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={!onDelete}
                    className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Trash2 size={20} />
                </button>
                <button
                    type="button"
                    onClick={onCopy}
                    disabled={!onCopy}
                    className="text-yellow-500 hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>
    );
};

export default OrderLegControls;