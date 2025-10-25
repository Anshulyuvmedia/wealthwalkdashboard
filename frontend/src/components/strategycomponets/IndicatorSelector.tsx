import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

interface Framework {
    value: string;
    label: string;
    type?: string;
}

interface Comparator {
    value: string;
    label: string;
}

interface IndicatorParams {
    period?: string;
    type?: string;
    fastMA?: string;
    slowMA?: string;
    signal?: string;
    multiplier?: string;
    stdDeviations?: string;
    minimumAF?: string;
    maximumAF?: string;
    length?: string;
    maType?: string;
}

interface IndicatorSelectorProps {
    value: string;
    onChange: (value: string) => void;
    params: IndicatorParams;
    onParamsChange: (params: IndicatorParams) => void;
    options: Framework[] | Comparator[];
    placeholder: string;
    isIndicator?: boolean;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
    value,
    onChange,
    params,
    onParamsChange,
    options,
    placeholder,
    isIndicator = false,
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [localParams, setLocalParams] = useState<IndicatorParams>(params);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // console.log('useEffect triggered:', { value, params, localValue, localParams }); // Debug
        // Sync localValue and localParams only when dialog is closed or on mount
        if (!isOpen && value !== localValue) {
            setLocalValue(value);
            // Update localParams if value changes and params are invalid
            if (value && !areParamsValid(params, value)) {
                setLocalParams(getDefaultParams(value));
            } else {
                setLocalParams(params);
            }
        }
    }, [value, params, isOpen]);

    // Update localParams when localValue changes (e.g., radio selection)
    useEffect(() => {
        if (localValue && !areParamsValid(localParams, localValue)) {
            // console.log('Updating localParams for localValue:', localValue); // Debug
            setLocalParams(getDefaultParams(localValue));
        }
    }, [localValue]);

    const areParamsValid = (params: IndicatorParams, indicator: string): boolean => {
        const validKeys = getValidParamKeys(indicator);
        const currentKeys = Object.keys(params);
        return validKeys.every((key) => currentKeys.includes(key) && params[key] !== undefined);
    };

    const getValidParamKeys = (indicator: string): string[] => {
        switch (indicator) {
            case "moving-average":
            case "rsi":
            case "wma":
            case "tema":
            case "posidi":
            case "negidi":
            case "adx":
            case "atr":
            case "stochastic":
                return ["period", "type"];
            case "macd":
            case "macd-signal":
                return ["fastMA", "slowMA", "signal"];
            case "supertrend":
                return ["period", "multiplier"];
            case "bollinger-band":
            case "bband-upper":
            case "bband-middle":
            case "bband-bottom":
                return ["period", "stdDeviations", "type", "maType"];
            case "parabolic-sar":
                return ["minimumAF", "maximumAF"];
            case "number":
                return ["period"];
            case "vwap":
            case "candle":
            case "camrila":
            case "pivot-point":
            case "true-range":
                return ["type"];
            case "linear-regression":
            case "linear-regression-intercept":
                return ["length"];
            default:
                return [];
        }
    };

    const getDefaultParams = (indicator: string): IndicatorParams => {
        const defaultParams: IndicatorParams = {};
        switch (indicator) {
            case "moving-average":
            case "rsi":
            case "wma":
            case "tema":
            case "posidi":
            case "negidi":
            case "adx":
            case "atr":
                defaultParams.period = "10";
                defaultParams.type = "SMA";
                break;
            case "macd":
            case "macd-signal":
                defaultParams.fastMA = "12";
                defaultParams.slowMA = "26";
                defaultParams.signal = "9";
                break;
            case "supertrend":
                defaultParams.period = "10";
                defaultParams.multiplier = "3";
                break;
            case "bollinger-band":
            case "bband-upper":
            case "bband-middle":
            case "bband-bottom":
                defaultParams.period = "20";
                defaultParams.stdDeviations = "2";
                defaultParams.type = "SMA";
                defaultParams.maType = "SMA";
                break;
            case "parabolic-sar":
                defaultParams.minimumAF = "0.02";
                defaultParams.maximumAF = "0.2";
                break;
            case "stochastic":
                defaultParams.period = "14";
                defaultParams.type = "Fast";
                break;
            case "number":
                defaultParams.period = "0";
                break;
            case "vwap":
                defaultParams.type = "VWAP";
                break;
            case "candle":
                defaultParams.type = "Open";
                break;
            case "camrila":
                defaultParams.type = "R5";
                break;
            case "pivot-point":
                defaultParams.type = "R3";
                break;
            case "true-range":
                defaultParams.type = "Auto";
                break;
            case "linear-regression":
            case "linear-regression-intercept":
                defaultParams.length = "10";
                break;
            default:
                return {};
        }
        return defaultParams;
    };

    const updateLocalParams = (newParams: Partial<IndicatorParams>) => {
        setLocalParams((prev) => {
            const updatedParams = { ...prev, ...newParams };
            const validKeys = getValidParamKeys(localValue);
            return Object.fromEntries(
                Object.entries(updatedParams).filter(([key]) => validKeys.includes(key))
            ) as IndicatorParams;
        });
    };

    const handleSave = () => {
        // console.log('Saving:', { localValue, localParams }); // Debug
        onChange(localValue);
        onParamsChange(localParams);
        setIsOpen(false);
    };

    const getDisplayText = () => {
        // Use localValue and localParams when dialog is open
        const displayValue = isOpen ? localValue : value || localValue;
        const displayParams = isOpen ? localParams : value ? params : localParams;
        if (!displayValue || !isIndicator) return "";
        const option = options.find((opt) => opt.value === displayValue);
        if (!option) return "";

        const displayParts: string[] = [];
        switch (displayValue) {
            case "moving-average":
            case "rsi":
            case "wma":
            case "tema":
            case "posidi":
            case "negidi":
            case "adx":
            case "atr":
            case "linear-regression":
            case "linear-regression-intercept":
                displayParts.push(`Period(${displayParams.period || ""})`);
                if (displayParams.type) displayParts.push(`Type(${displayParams.type})`);
                break;
            case "vwap":
            case "candle":
            case "camrila":
            case "pivot-point":
            case "true-range":
                if (displayParams.type) displayParts.push(`${option.label}(${displayParams.type})`);
                break;
            case "macd":
            case "macd-signal":
                displayParts.push(
                    `FastMA(${displayParams.fastMA || ""})`,
                    `SlowMA(${displayParams.slowMA || ""})`,
                    `Signal(${displayParams.signal || ""})`
                );
                break;
            case "supertrend":
                displayParts.push(`Period(${displayParams.period || ""})`, `Multiplier(${displayParams.multiplier || ""})`);
                break;
            case "bollinger-band":
            case "bband-upper":
            case "bband-middle":
            case "bband-bottom":
                displayParts.push(
                    `Period(${displayParams.period || ""})`,
                    `StdDeviations(${displayParams.stdDeviations || ""})`,
                    `MAType(${displayParams.type || displayParams.maType || ""})`
                );
                break;
            case "parabolic-sar":
                displayParts.push(
                    `MinimumAF(${displayParams.minimumAF || ""})`,
                    `MaximumAF(${displayParams.maximumAF || ""})`
                );
                break;
            case "stochastic":
                displayParts.push(`Period(${displayParams.period || ""})`, `Type(${displayParams.type || ""})`);
                break;
            case "number":
                displayParts.push(`Number(${displayParams.period || ""})`);
                break;
        }
        // console.log('getDisplayText result:', displayParts.join(" "), { displayValue, displayParams }); // Debug
        return displayParts.join(" ");
    };

    const indicatorInputs: { [key: string]: { label: string; key: string; type: 'number' | 'select'; options?: string[] }[] } = {
        'moving-average': [
            { label: 'MovingAverage1', key: 'period', type: 'number' },
            { label: 'MovingAverageType', key: 'type', type: 'select', options: ['SMA', 'TEMA', 'DEMA', 'WMA', 'TRIMA', 'KAMA', 'MAMA', 'T3', 'EMA'] },
        ],
        'vwap': [
            { label: 'VWAP_Type', key: 'type', type: 'select', options: ['VWAP', 'SDPlus1', 'SDMinus1'] },
        ],
        'macd': [
            { label: 'FastMA', key: 'fastMA', type: 'number' },
            { label: 'SlowMA', key: 'slowMA', type: 'number' },
            { label: 'Signal', key: 'signal', type: 'number' },
        ],
        'rsi': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'supertrend': [
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Multiplier', key: 'multiplier', type: 'number' },
        ],
        'macd-signal': [
            { label: 'FastMA', key: 'fastMA', type: 'number' },
            { label: 'SlowMA', key: 'slowMA', type: 'number' },
            { label: 'Signal', key: 'signal', type: 'number' },
        ],
        'candle': [
            { label: 'Candle_Price', key: 'type', type: 'select', options: ['Open', 'High', 'Low', 'Close'] },
        ],
        'number': [
            { label: 'Number', key: 'period', type: 'number' },
        ],
        'camrila': [
            { label: 'Signal', key: 'type', type: 'select', options: ['R5', 'R4', 'R3', 'R2', 'R1', 'PP', 'S1', 'S2', 'S3', 'S4', 'S5'] },
        ],
        'pivot-point': [
            { label: 'Signal', key: 'type', type: 'select', options: ['R3', 'R2', 'R1', 'PP', 'S1', 'S2', 'S3'] },
        ],
        'linear-regression': [
            { label: 'Length', key: 'length', type: 'number' },
        ],
        'linear-regression-intercept': [
            { label: 'Length', key: 'length', type: 'number' },
        ],
        'stochastic': [
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Type', key: 'type', type: 'select', options: ['Fast', 'Slow'] },
        ],
        'bband-upper': [
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Std. Deviations', key: 'stdDeviations', type: 'number' },
            { label: 'MA Type', key: 'type', type: 'select', options: ['SMA', 'EMA'] },
        ],
        'bband-middle': [
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Std. Deviations', key: 'stdDeviations', type: 'number' },
            { label: 'MA Type', key: 'type', type: 'select', options: ['SMA', 'EMA'] },
        ],
        'bband-bottom': [
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Std. Deviations', key: 'stdDeviations', type: 'number' },
            { label: 'MA Type', key: 'type', type: 'select', options: ['SMA', 'EMA'] },
        ],
        'bollinger-band': [
            { label: 'Bond Type', key: 'type', type: 'select', options: ['Lower', 'Middle', 'Upper'] },
            { label: 'Period', key: 'period', type: 'number' },
            { label: 'Std. Deviations', key: 'stdDeviations', type: 'number' },
            { label: 'MA Type', key: 'maType', type: 'select', options: ['SMA', 'EMA'] },
        ],
        'adx': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'parabolic-sar': [
            { label: 'Minimum_AF', key: 'minimumAF', type: 'number' },
            { label: 'Maximum_AF', key: 'maximumAF', type: 'number' },
        ],
        'atr': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'true-range': [
            { label: 'Panel', key: 'type', type: 'select', options: ['Auto'] },
        ],
        'wma': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'tema': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'posidi': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
        'negidi': [
            { label: 'Period', key: 'period', type: 'number' },
        ],
    };

    const renderInputs = (indicator: string) => {
        // console.log('Rendering inputs for:', indicator); // Debug
        if (!indicatorInputs[indicator]) return null;
        return (
            <div className="flex flex-wrap justify-start w-full gap-2 ps-6">
                {indicatorInputs[indicator].map(({ label, key, type, options }) => (
                    <div key={key}>
                        <Label htmlFor={key} className="text-xs text-gray-400 mb-1 block">{label}</Label>
                        {type === 'number' ? (
                            <Input
                                type="number"
                                placeholder={label}
                                className="w-24 min-w-[6rem] text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                value={localParams[key] || ""}
                                onChange={(e) => updateLocalParams({ [key]: e.target.value })}
                            />
                        ) : (
                            <Select
                                value={localParams[key] || ""}
                                onValueChange={(value) => updateLocalParams({ [key]: value })}
                            >
                                <SelectTrigger className="w-24 min-w-[8rem] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                    <SelectValue placeholder={options?.[0] || ''} />
                                </SelectTrigger>
                                <SelectContent>
                                    {options?.map((option) => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 w-full">
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open && value !== localValue) {
                    // Reset localValue to parent value on dialog close if not saved
                    setLocalValue(value);
                    setLocalParams(params);
                }
            }}>
                <DialogTrigger asChild>
                    <div
                        className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer"
                        onClick={() => setIsOpen(true)}
                    >
                        <span>
                            {localValue
                                ? options.find((option) => option.value === localValue)?.label || placeholder
                                : placeholder}
                        </span>
                        <ChevronRight size={20} />
                    </div>
                </DialogTrigger>
                <DialogContent className="" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="sr-only">{placeholder}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Command className="bg-[#020618]">
                            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-9" />
                            <CommandList>
                                <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                                <CommandGroup>
                                    <RadioGroup value={localValue} onValueChange={(value) => {
                                        // console.log('Radio selected:', value); // Debug
                                        setLocalValue(value);
                                    }}>
                                        {options.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                value={option.value}
                                                className={`flex flex-col items-start gap-2 me-3 ${localValue === option.value ? "bg-gray-900" : ""}`}
                                            >
                                                <div className="flex items-center space-x-2 w-full ">
                                                    <RadioGroupItem value={option.value} id={option.value} />
                                                    <Label htmlFor={option.value}>{option.label}</Label>
                                                </div>
                                                {isIndicator && localValue === option.value && (
                                                    <div>
                                                        {renderInputs(option.value)}
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
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {isIndicator && (value || localValue) && (
                <div className="text-xs text-gray-400 mt-1 font-medium">
                    {getDisplayText()}
                </div>
            )}
        </div>
    );
};

export default React.memo(IndicatorSelector);