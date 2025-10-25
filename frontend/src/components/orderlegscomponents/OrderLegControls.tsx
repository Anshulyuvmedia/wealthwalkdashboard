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
    onDelete?: (e: React.MouseEvent) => void;
    onCopy?: (e: React.MouseEvent) => void;
    moveSLToCost: boolean;
    exitAllOnSLTgt: boolean;
    prePunchSL: boolean;
    premiumDifference: boolean;
    waitAndTrade: boolean;
    reEntryExecute: boolean;
    trailSL: boolean;
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
    handleSaveAll: (e: React.MouseEvent) => void;
}

export const OrderLegControls: React.FC<OrderLegControlsProps> = ({
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
    trailSlOptions,
    tslOptions,
    handleSaveAll,
}) => {
    return (
        <div className="flex items-center">
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col justify-between items-center">
                        <div className="flex space-x-4">
                            <div className="space-y-2">
                                <div className="flex gap-2 w-full">
                                    <div
                                        onClick={() => setIsBuy(isBuy === "Buy" ? "Sell" : "Buy")}
                                        className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isBuy === "Buy" ? "border-green-600" : "border-red-600"}`}
                                        role="button"
                                        aria-label={isBuy === "Buy" ? "Switch to Sell" : "Switch to Buy"}
                                    >
                                        <span className={isBuy === "Buy" ? "text-green-600" : "text-red-600"}>
                                            {isBuy}
                                        </span>
                                        <ChevronsDownUp
                                            className={isBuy === "Buy" ? "text-green-600" : "text-red-600"}
                                            size={16}
                                        />
                                    </div>
                                    <div className="w-25">
                                        <InputGroup>
                                            <InputGroupInput
                                                id="qty"
                                                type="number"
                                                autoComplete="off"
                                                placeholder="1"
                                                defaultValue={1}
                                                min={1}
                                                aria-label="Quantity"
                                            />
                                            <InputGroupAddon>
                                                <InputGroupText>Qty:</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                    <div
                                        onClick={() => setIsCE(isCE === "CE" ? "PE" : "CE")}
                                        className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isCE === "CE" ? "border-green-600" : "border-red-600"}`}
                                    >
                                        <span className={isCE === "CE" ? "text-green-600" : "text-red-600"}>
                                            {isCE}
                                        </span>
                                        <ChevronsDownUp className={isCE === "CE" ? "text-green-600" : "text-red-600"} size={16} />
                                    </div>
                                    <div
                                        onClick={() => setIsWeekly(isWeekly === "Weekly" ? "Monthly" : "Weekly")}
                                        className={`flex cursor-pointer items-center text-sm border bg-dark rounded-md px-3 py-1 ${isWeekly === "Weekly" ? "border-yellow-600" : "border-purple-600"}`}
                                        role="button"
                                        aria-label={isWeekly === "Weekly" ? "Switch to Monthly" : "Switch to Weekly"}
                                    >
                                        <span className={isWeekly === "Weekly" ? "text-yellow-600" : "text-purple-600"}>
                                            {isWeekly}
                                        </span>
                                        <ChevronsDownUp
                                            className={isWeekly === "Weekly" ? "text-yellow-600" : "text-purple-600"}
                                            size={16}
                                        />
                                    </div>
                                    <div>
                                        <InputGroup className="[--radius:1rem] flex justify-between">
                                            <InputGroupAddon align="inline-start">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer"
                                                            aria-label={`Select ${firstSelection}`}
                                                        >
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
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                                            aria-label={`Select ${secondSelection}`}
                                                        >
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
                                <div className="flex gap-2 w-full">
                                    <div>
                                        <InputGroup className="[--radius:1rem] flex justify-between">
                                            <InputGroupAddon align="inline-start">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                                            aria-label={`Select ${slSelection}`}
                                                        >
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
                                            <InputGroupInput
                                                placeholder="30"
                                                className="w-15"
                                                type="number"
                                                min={0}
                                                aria-label="Stop Loss Value"
                                            />
                                            <InputGroupAddon>
                                                <InputGroupText>Qty:</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupAddon align="inline-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                                            aria-label={`Select ${onSelection}`}
                                                        >
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
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                                            aria-label={`Select ${tpSelection}`}
                                                        >
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
                                            <InputGroupInput
                                                placeholder="30"
                                                className="w-15"
                                                type="number"
                                                min={0}
                                                aria-label="Take Profit Value"
                                            />
                                            <InputGroupAddon>
                                                <InputGroupText>Qty:</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupAddon align="inline-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <InputGroupButton
                                                            variant="ghost"
                                                            className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                                            aria-label={`Select ${onSelectionSec}`}
                                                        >
                                                            {onSelectionSec}
                                                            <ChevronDown className="size-3" />
                                                        </InputGroupButton>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                                        {priceOptions.map((option) => (
                                                            <DropdownMenuItem
                                                                key={option}
                                                                onSelect={() => setOnSelectionSec(option)}
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
                        {(premiumDifference || waitAndTrade || reEntryExecute || trailSL) && (
                            <>
                                <div className="flex items-center w-full space-x-2 my-3">
                                    <Separator className="flex-1" />
                                    <span className="text-sm font-medium">Advance Features</span>
                                    <ChevronDown className="size-4" />
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
                                    trailSlOptions={trailSlOptions}
                                    tslOptions={tslOptions}
                                    handleSaveAll={handleSaveAll}
                                />
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
            <button
                onClick={onDelete}
                className="text-red-600 cursor-pointer ms-3"
                aria-label="Delete Leg"
                disabled={!onDelete}
            >
                <Trash2 size={20} />
            </button>
            <button
                onClick={onCopy}
                className="text-yellow-600 cursor-pointer ms-3"
                aria-label="Copy Leg"
                disabled={!onCopy}
            >
                <Copy size={20} />
            </button>
        </div>
    );
};

export default OrderLegControls;