// src/components/IndicatorSelector.tsx
import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    memo,
} from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & Props                                                      */
/* ------------------------------------------------------------------ */
export interface Framework {
    value: string;
    label: string;
    type?: string;
}
export interface Comparator {
    value: string;
    label: string;
}
export interface IndicatorParams {
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
export interface IndicatorSelectorProps {
    value: string;
    onChange: (value: string) => void;
    params: IndicatorParams;
    onParamsChange: (params: IndicatorParams) => void;
    options: Framework[] | Comparator[];
    placeholder: string;
    isIndicator?: boolean;
}

/* ------------------------------------------------------------------ */
/* Helper: Valid param keys per indicator                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Helper: Default params per indicator                               */
/* ------------------------------------------------------------------ */
const getDefaultParams = (indicator: string): IndicatorParams => {
    const d: IndicatorParams = {};
    switch (indicator) {
        case "moving-average":
        case "rsi":
        case "wma":
        case "tema":
        case "posidi":
        case "negidi":
        case "adx":
        case "atr":
            d.period = "10";
            d.type = "SMA";
            break;
        case "macd":
        case "macd-signal":
            d.fastMA = "12";
            d.slowMA = "26";
            d.signal = "9";
            break;
        case "supertrend":
            d.period = "10";
            d.multiplier = "3";
            break;
        case "bollinger-band":
        case "bband-upper":
        case "bband-middle":
        case "bband-bottom":
            d.period = "20";
            d.stdDeviations = "2";
            d.type = "SMA";
            d.maType = "SMA";
            break;
        case "parabolic-sar":
            d.minimumAF = "0.02";
            d.maximumAF = "0.2";
            break;
        case "stochastic":
            d.period = "14";
            d.type = "Fast";
            break;
        case "number":
            d.period = "0";
            break;
        case "vwap":
            d.type = "VWAP";
            break;
        case "candle":
            d.type = "Open";
            break;
        case "camrila":
            d.type = "R5";
            break;
        case "pivot-point":
            d.type = "R3";
            break;
        case "true-range":
            d.type = "Auto";
            break;
        case "linear-regression":
        case "linear-regression-intercept":
            d.length = "10";
            break;
        default:
            break;
    }
    return d;
};

/* ------------------------------------------------------------------ */
/* Helper: Keep only valid keys                                       */
/* ------------------------------------------------------------------ */
const keepOnlyValid = (params: IndicatorParams, indicator: string): IndicatorParams => {
    const valid = getValidParamKeys(indicator);
    return Object.fromEntries(
        Object.entries(params).filter(([k]) => valid.includes(k))
    ) as IndicatorParams;
};

/* ------------------------------------------------------------------ */
/* Input definitions for each indicator                               */
/* ------------------------------------------------------------------ */
const indicatorInputs: Record<
    string,
    { label: string; key: string; type: "number" | "select"; options?: string[] }[]
> = {
    "moving-average": [
        { label: "MovingAverage1", key: "period", type: "number" },
        {
            label: "MovingAverageType",
            key: "type",
            type: "select",
            options: ["SMA", "TEMA", "DEMA", "WMA", "TRIMA", "KAMA", "MAMA", "T3", "EMA"],
        },
    ],
    vwap: [
        {
            label: "VWAP_Type",
            key: "type",
            type: "select",
            options: ["VWAP", "SDPlus1", "SDMinus1"],
        },
    ],
    macd: [
        { label: "FastMA", key: "fastMA", type: "number" },
        { label: "SlowMA", key: "slowMA", type: "number" },
        { label: "Signal", key: "signal", type: "number" },
    ],
    rsi: [{ label: "Period", key: "period", type: "number" }],
    supertrend: [
        { label: "Period", key: "period", type: "number" },
        { label: "Multiplier", key: "multiplier", type: "number" },
    ],
    "macd-signal": [
        { label: "FastMA", key: "fastMA", type: "number" },
        { label: "SlowMA", key: "slowMA", type: "number" },
        { label: "Signal", key: "signal", type: "number" },
    ],
    candle: [
        {
            label: "Candle_Price",
            key: "type",
            type: "select",
            options: ["Open", "High", "Low", "Close"],
        },
    ],
    number: [{ label: "Number", key: "period", type: "number" }],
    camrila: [
        {
            label: "Signal",
            key: "type",
            type: "select",
            options: ["R5", "R4", "R3", "R2", "R1", "PP", "S1", "S2", "S3", "S4", "S5"],
        },
    ],
    "pivot-point": [
        {
            label: "Signal",
            key: "type",
            type: "select",
            options: ["R3", "R2", "R1", "PP", "S1", "S2", "S3"],
        },
    ],
    "linear-regression": [{ label: "Length", key: "length", type: "number" }],
    "linear-regression-intercept": [{ label: "Length", key: "length", type: "number" }],
    stochastic: [
        { label: "Period", key: "period", type: "number" },
        { label: "Type", key: "type", type: "select", options: ["Fast", "Slow"] },
    ],
    "bband-upper": [
        { label: "Period", key: "period", type: "number" },
        { label: "Std. Deviations", key: "stdDeviations", type: "number" },
        { label: "MA Type", key: "type", type: "select", options: ["SMA", "EMA"] },
    ],
    "bband-middle": [
        { label: "Period", key: "period", type: "number" },
        { label: "Std. Deviations", key: "stdDeviations", type: "number" },
        { label: "MA Type", key: "type", type: "select", options: ["SMA", "EMA"] },
    ],
    "bband-bottom": [
        { label: "Period", key: "period", type: "number" },
        { label: "Std. Deviations", key: "stdDeviations", type: "number" },
        { label: "MA Type", key: "type", type: "select", options: ["SMA", "EMA"] },
    ],
    "bollinger-band": [
        {
            label: "Bond Type",
            key: "type",
            type: "select",
            options: ["Lower", "Middle", "Upper"],
        },
        { label: "Period", key: "period", type: "number" },
        { label: "Std. Deviations", key: "stdDeviations", type: "number" },
        { label: "MA Type", key: "maType", type: "select", options: ["SMA", "EMA"] },
    ],
    adx: [{ label: "Period", key: "period", type: "number" }],
    "parabolic-sar": [
        { label: "Minimum_AF", key: "minimumAF", type: "number" },
        { label: "Maximum_AF", key: "maximumAF", type: "number" },
    ],
    atr: [{ label: "Period", key: "period", type: "number" }],
    "true-range": [
        { label: "Panel", key: "type", type: "select", options: ["Auto"] },
    ],
    wma: [{ label: "Period", key: "period", type: "number" }],
    tema: [{ label: "Period", key: "period", type: "number" }],
    posidi: [{ label: "Period", key: "period", type: "number" }],
    negidi: [{ label: "Period", key: "period", type: "number" }],
};

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */
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
        if (isOpen) {
            // Only sync when dialog OPENS
            setLocalValue(value);
            const defaults = getDefaultParams(value);
            const cleaned = keepOnlyValid(params, value);
            setLocalParams({ ...defaults, ...cleaned });
        }
        // Do NOT depend on `value` or `params` while open
    }, [isOpen, value, params]); // ← Still safe, but now `isOpen` guards it

    const handleIndicatorChange = useCallback((newIndicator: string) => {
        setLocalValue(newIndicator);
        setLocalParams(getDefaultParams(newIndicator));
    }, []);

    /* --------------------------------------------------------------- */
    /* Update single param                                             */
    /* --------------------------------------------------------------- */
    const updateLocalParam = useCallback(
        (partial: Partial<IndicatorParams>) => {
            setLocalParams((prev) => {
                const valid = getValidParamKeys(localValue);
                const cleanedPrev = Object.fromEntries(
                    Object.entries(prev).filter(([k]) => valid.includes(k))
                );
                const updated = { ...cleanedPrev, ...partial };
                return Object.fromEntries(
                    Object.entries(updated).filter(([k]) => valid.includes(k))
                ) as IndicatorParams;
            });
        },
        [localValue]
    );

    const handleSave = useCallback(() => {
        setIsOpen(false); // Close first

        setTimeout(() => {
            const cleaned = keepOnlyValid(localParams, localValue);
            onChange(localValue);
            onParamsChange(cleaned);
        }, 0);
    }, [localValue, localParams, onChange, onParamsChange]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
    }, []);

    /* --------------------------------------------------------------- */
    /* Display text under trigger                                      */
    /* --------------------------------------------------------------- */
    const getDisplayText = () => {
        const curVal = isOpen ? localValue : value;
        const curParams = isOpen ? localParams : params;
        if (!curVal || !isIndicator) return "";

        const parts: string[] = [];
        switch (curVal) {
            case "moving-average":
                parts.push(`MovingAverage1(${curParams.period ?? ""})`);
                if (curParams.type) parts.push(`MovingAverageType(${curParams.type})`);
                break;
            case "wma":
            case "tema":
            case "posidi":
            case "negidi":
            case "rsi":
                parts.push(`Period(${curParams.period ?? ""})`);
                break;
            case "adx":
            case "atr":
            case "linear-regression":
            case "linear-regression-intercept":
                parts.push(`Length(${curParams.length ?? ""})`);
                break;
            case "vwap":
                parts.push(`VWAP_Type(${curParams.type ?? ""})`);
                break;
            case "candle":
                parts.push(`Candle_Price(${curParams.type ?? ""})`);
                break;
            case "camrila":
            case "pivot-point":
                parts.push(`Signal(${curParams.type ?? ""})`);
                break;
            case "true-range":
                parts.push(`Panel(${curParams.type ?? ""})`);
                break;
            case "macd":
            case "macd-signal":
                parts.push(
                    `FastMA(${curParams.fastMA ?? ""})`,
                    `SlowMA(${curParams.slowMA ?? ""})`,
                    `Signal(${curParams.signal ?? ""})`
                );
                break;
            case "supertrend":
                parts.push(
                    `Period(${curParams.period ?? ""})`,
                    `Multiplier(${curParams.multiplier ?? ""})`
                );
                break;
            case "bollinger-band":
                parts.push(
                    `Bond_type(${curParams.type ?? ""})`,
                    `Period(${curParams.period ?? ""})`,
                    `StdDeviations(${curParams.stdDeviations ?? ""})`,
                    `MAType(${curParams.maType ?? ""})`
                );
                break;
            case "bband-upper":
            case "bband-middle":
            case "bband-bottom":
                parts.push(
                    `Period(${curParams.period ?? ""})`,
                    `StdDeviations(${curParams.stdDeviations ?? ""})`,
                    `MAType(${curParams.type ?? curParams.maType ?? ""})`
                );
                break;
            case "parabolic-sar":
                parts.push(
                    `MinimumAF(${curParams.minimumAF ?? ""})`,
                    `MaximumAF(${curParams.maximumAF ?? ""})`
                );
                break;
            case "stochastic":
                parts.push(
                    `Period(${curParams.period ?? ""})`,
                    `Type(${curParams.type ?? ""})`
                );
                break;
            case "number":
                parts.push(`Number(${curParams.period ?? ""})`);
                break;
        }
        return parts.join(" ");
    };

    /* --------------------------------------------------------------- */
    /* Render inputs for current indicator                             */
    /* --------------------------------------------------------------- */
    const renderInputs = useCallback((indicator: string) => {
        const defs = indicatorInputs[indicator];
        if (!defs) return null;

        return (
            <div className="flex flex-wrap justify-start w-full gap-2 ps-6">
                {defs.map(({ label, key, type, options }) => (
                    <div key={key}>
                        <Label htmlFor={key} className="text-xs text-gray-400 mb-1 block">
                            {label}
                        </Label>
                        {type === "number" ? (
                            <Input
                                type="number"
                                placeholder={label}
                                className="w-24 min-w-[6rem] text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                value={localParams[key] ?? ""}
                                onChange={(e) => updateLocalParam({ [key]: e.target.value })}
                            />
                        ) : (
                            <Select
                                value={localParams[key] ?? ""}
                                onValueChange={(v) => updateLocalParam({ [key]: v })}
                            >
                                <SelectTrigger className="w-24 min-w-[8rem] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {options?.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>
        );
    }, [localParams, updateLocalParam]);

    /* --------------------------------------------------------------- */
    /* Render                                                          */
    /* --------------------------------------------------------------- */
    return (
        <div className="flex-1 w-full">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div
                        className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(true)}
                    >
                        <span>
                            {options.find((o) => o.value === (isOpen ? localValue : value))?.label ?? placeholder}
                        </span>
                        <ChevronRight size={20} />
                    </div>
                </DialogTrigger>

                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="sr-only">{placeholder}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Command className="bg-[#020618] rounded-lg">
                            <CommandInput
                                placeholder={`Search ${placeholder.toLowerCase()}...`}
                                className="h-9"
                            />
                            <CommandList>
                                <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                                <CommandGroup>
                                    <RadioGroup value={localValue} onValueChange={handleIndicatorChange}>
                                        {options.map((opt) => (
                                            <CommandItem
                                                key={opt.value}
                                                value={opt.value}
                                                className={`flex flex-col items-start gap-2 me-3 ${localValue === opt.value ? "bg-gray-900" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2 w-full">
                                                    <RadioGroupItem value={opt.value} id={opt.value} />
                                                    <Label htmlFor={opt.value}>{opt.label}</Label>
                                                </div>
                                                {isIndicator && localValue === opt.value && renderInputs(opt.value)}
                                            </CommandItem>
                                        ))}
                                    </RadioGroup>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Display text under trigger */}
            {isIndicator && (value || localValue) && (
                <div className="text-xs text-gray-400 mt-1 font-medium">
                    {getDisplayText()}
                </div>
            )}
        </div>
    );
};

export default memo(IndicatorSelector);