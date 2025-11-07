import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ChevronDown } from "lucide-react";

interface AdvanceFeatureInputsProps {
    premiumDifference: boolean;
    premiumDiffValue: number | "";
    setPremiumDiffValue: (value: number | "") => void;
    waitAndTrade: boolean;
    waitAndTradeValue: number | "";
    setWaitAndTradeValue: (value: number | "") => void;
    waitAndTradeUnit: string;
    setWaitAndTradeUnit: (value: string) => void;
    reEntryExecute: boolean;
    reEntryMode: string;
    setReEntryMode: (value: string) => void;
    reEntryValue: number | "";
    setReEntryValue: (value: number | "") => void;
    executionType: string;
    setExecutionType: (value: string) => void;
    executionTypeSelection: string;
    setExecutionTypeSelection: (value: string) => void;
    trailSL: boolean;
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

export const AdvanceFeatureInputs: React.FC<AdvanceFeatureInputsProps> = ({
    premiumDifference,
    premiumDiffValue,
    setPremiumDiffValue,
    waitAndTrade,
    waitAndTradeValue,
    setWaitAndTradeValue,
    waitAndTradeUnit,
    setWaitAndTradeUnit,
    reEntryExecute,
    reEntryMode,
    setReEntryMode,
    reEntryValue,
    setReEntryValue,
    executionType,
    setExecutionType,
    trailSL,
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {premiumDifference && (
                <div className="grid gap-2">
                    <InputGroup className="[--radius:1rem] flex justify-between">
                        <InputGroupAddon
                            align="inline-start"
                            className="bg-gray-700 ms-1 px-2 py-1 rounded-full"
                        >
                            <div className="text-xs">Premium:</div>
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="0"
                            className="w-16"
                            type="number"
                            value={premiumDiffValue}
                            onChange={(e) => setPremiumDiffValue(Number(e.target.value) || "")}
                        />
                    </InputGroup>
                </div>
            )}
            {waitAndTrade && (
                <div className="grid gap-2">
                    <InputGroup className="[--radius:1rem] flex justify-between">
                        <InputGroupAddon align="inline-start">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton
                                        variant="ghost"
                                        className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                    >
                                        {waitAndTradeUnit}
                                        <ChevronDown className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                    {waitAndTradeTimeOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onSelect={() => setWaitAndTradeUnit(option)}
                                        >
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="0"
                            className="w-16"
                            type="number"
                            value={waitAndTradeValue}
                            onChange={(e) => setWaitAndTradeValue(Number(e.target.value) || "")}
                        />
                    </InputGroup>
                </div>
            )}
            {reEntryExecute && (
                <div className="grid gap-2">
                    <InputGroup className="[--radius:1rem] flex justify-between">
                        <InputGroupAddon align="inline-start">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton
                                        variant="ghost"
                                        className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                    >
                                        {reEntryMode}
                                        <ChevronDown className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                    {reEntryExecuteOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onSelect={() => setReEntryMode(option)}
                                        >
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="30"
                            className="w-16"
                            type="number"
                            value={reEntryValue}
                            onChange={(e) => setReEntryValue(Number(e.target.value) || "")}
                            // disabled={executionTypeSelection === "Legwise"}
                        />
                        <InputGroupAddon align="inline-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton
                                        variant="ghost"
                                        className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                        disabled={reEntryMode !== "ReExecute"}
                                    >
                                        {executionType}
                                        <ChevronDown className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                    {executionOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onSelect={() => setExecutionType(option)}
                                        >
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            )}
            {trailSL && (
                <div className="grid gap-2">
                    <InputGroup className="[--radius:1rem] flex justify-between">
                        <InputGroupAddon align="inline-start">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton
                                        variant="ghost"
                                        className="!pr-1.5 text-xs cursor-pointer bg-gray-700 text-white"
                                    >
                                        {tslMode}
                                        <ChevronDown className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                                    {tslOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onSelect={() => setTslMode(option)}
                                        >
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="30"
                            className="w-16 bg-black"
                            type="text"
                            value={tslSelection}
                            onChange={(e) => setTslSelection(e.target.value)}
                        />
                        <InputGroupInput
                            placeholder="30"
                            className="w-16 bg-black"
                            type="text"
                            value={tslTrailBy}
                            onChange={(e) => setTslTrailBy(e.target.value)}
                        />
                    </InputGroup>
                </div>
            )}
        </div>
    );
};