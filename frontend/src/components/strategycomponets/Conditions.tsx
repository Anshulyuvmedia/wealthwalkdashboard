import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, CircleAlert, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import IndicatorSelector from "./IndicatorSelector";

interface IndicatorParams {
    [key: string]: string | undefined;
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

interface Condition {
    id: string;
    longIndicator: string;
    longParams: IndicatorParams;
    longComparator: string;
    longSecondIndicator: string;
    longSecondParams: IndicatorParams;
    shortIndicator: string;
    shortParams: IndicatorParams;
    shortComparator: string;
    shortSecondIndicator: string;
    shortSecondParams: IndicatorParams;
    operator: "and" | "or";
}

interface OrderSettingsData {
    orderType: string;
    startTime: string;
    squareOff: string;
    days: string[];
    transactionType?: string;
    chartType?: string;
    interval?: string;
}

interface ConditionsProps {
    orderSettings: OrderSettingsData;
    type: "entry" | "exit";
    onConditionsChange: (data: { conditions: Condition[]; isEnabled?: boolean; useCombinedChart?: boolean }) => void;
    initialConditions?: Condition[]; // Pre-populated data from API
    initialIsEnabled: boolean;
}

const Conditions: React.FC<ConditionsProps> = ({
    orderSettings,
    type,
    onConditionsChange,
    initialConditions = [],
}) => {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [isExitConditionsEnabled, setIsExitConditionsEnabled] = useState<boolean>(
        type === "exit" && initialConditions.length > 0
    );
    const [useCombinedChart, setUseCombinedChart] = useState<boolean>(false);
    const frameworks = [
        { value: "select-indicator", label: "Select Indicator" },
        { value: "moving-average", label: "Moving Average", type: "select" },
        { value: "vwap", label: "VWAP" },
        { value: "macd", label: "MACD" },
        { value: "rsi", label: "RSI" },
        { value: "supertrend", label: "SuperTrend" },
        { value: "macd-signal", label: "MACD Signal" },
        { value: "candle", label: "Candle" },
        { value: "number", label: "Number" },
        { value: "camrila", label: "Camrila" },
        { value: "pivot-point", label: "Pivot Point" },
        { value: "linear-regression", label: "Linear Regression" },
        { value: "linear-regression-intercept", label: "Linear Regression Intercept" },
        { value: "stochastic", label: "Stochastic" },
        { value: "bband-upper", label: "Bband Upper" },
        { value: "bband-middle", label: "Bband Middle" },
        { value: "bband-bottom", label: "Bband Bottom" },
        { value: "bollinger-band", label: "Bollinger Band" },
        { value: "adx", label: "ADX" },
        { value: "parabolic-sar", label: "Parabolic SAR" },
        { value: "atr", label: "ATR" },
        { value: "true-range", label: "True Range" },
        { value: "wma", label: "WMA" },
        { value: "tema", label: "TEMA" },
        { value: "posidi", label: "+DI" },
        { value: "negidi", label: "-DI" },
    ];

    const comparators = [
        { value: "select-comparator", label: "Select Comparator" },
        { value: "crosses-above", label: "Crosses Above" },
        { value: "crosses-below", label: "Crosses Below" },
        { value: "higher-than", label: "Higher than" },
        { value: "less-than", label: "Less than" },
        { value: "equal", label: "Equal" },
    ];

    const getDefaultParams = (indicator: string): IndicatorParams => {
        const defaults: IndicatorParams = {};
        switch (indicator) {
            case "moving-average":
            case "rsi":
            case "wma":
            case "tema":
            case "posidi":
            case "negidi":
            case "adx":
            case "atr":
                defaults.period = "10";
                defaults.type = "SMA";
                break;
            case "macd":
            case "macd-signal":
                defaults.fastMA = "12";
                defaults.slowMA = "26";
                defaults.signal = "9";
                break;
            case "supertrend":
                defaults.period = "10";
                defaults.multiplier = "3";
                break;
            case "bollinger-band":
            case "bband-upper":
            case "bband-middle":
            case "bband-bottom":
                defaults.period = "20";
                defaults.stdDeviations = "2";
                defaults.type = "SMA";
                defaults.maType = "SMA";
                break;
            case "parabolic-sar":
                defaults.minimumAF = "0.02";
                defaults.maximumAF = "0.2";
                break;
            case "stochastic":
                defaults.period = "14";
                defaults.type = "Fast";
                break;
            case "number":
                defaults.period = "0";
                break;
            case "vwap":
                defaults.type = "VWAP";
                break;
            case "candle":
                defaults.type = "Close";
                break;
            case "camrila":
                defaults.type = "R3";
                break;
            case "pivot-point":
                defaults.type = "R3";
                break;
            case "true-range":
                defaults.type = "Auto";
                break;
            case "linear-regression":
            case "linear-regression-intercept":
                defaults.length = "10";
                break;
            default:
                break;
        }
        return defaults;
    };

    // Initialize with API data or default condition
    useEffect(() => {
        if (initialConditions.length > 0) {
            setConditions(initialConditions);
        } else if (conditions.length === 0) {
            setConditions([
                {
                    id: crypto.randomUUID(),
                    longIndicator: "",
                    longParams: {},
                    longComparator: "",
                    longSecondIndicator: "",
                    longSecondParams: {},
                    shortIndicator: "",
                    shortParams: {},
                    shortComparator: "",
                    shortSecondIndicator: "",
                    shortSecondParams: {},
                    operator: "and",
                },
            ]);
        }
    }, [initialConditions]);

    // Notify parent of changes
    useEffect(() => {
        onConditionsChange({
            conditions,
            useCombinedChart: type === "entry" ? useCombinedChart : undefined,
            isEnabled: type === "exit" ? isExitConditionsEnabled : undefined,
        });
    }, [conditions, isExitConditionsEnabled, useCombinedChart, onConditionsChange, type]);
    useEffect(() => {
        if (type === "exit") {
            setIsExitConditionsEnabled(initialConditions.length > 0);
        }
    }, [type, initialConditions]);
    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                id: crypto.randomUUID(),
                longIndicator: "",
                longParams: {},
                longComparator: "",
                longSecondIndicator: "",
                longSecondParams: {},
                shortIndicator: "",
                shortParams: {},
                shortComparator: "",
                shortSecondIndicator: "",
                shortSecondParams: {},
                operator: "and",
            },
        ]);
    };

    const deleteCondition = (id: string) => {
        setConditions(conditions.filter((condition) => condition.id !== id));
    };

    const updateCondition = (id: string, updates: Partial<Condition>) => {
        setConditions((prevConditions) =>
            prevConditions.map((condition) =>
                condition.id === id ? { ...condition, ...updates } : condition
            )
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between w-full">
                    <div className="flex">
                        <CardTitle>{type === "entry" ? "Entry Conditions" : "Exit Conditions"}</CardTitle>
                        {type === "entry" ? (
                            <div className="flex items-center space-x-2 ms-4">
                                <Switch id="combinedChart" checked={useCombinedChart} onCheckedChange={setUseCombinedChart} />
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
                        ) : (
                            <div className="flex items-center space-x-2 ms-4">
                                <Switch
                                    id="exitConditions"
                                    checked={isExitConditionsEnabled}
                                    onCheckedChange={setIsExitConditionsEnabled}
                                />
                                <Label htmlFor="exitConditions">Exit conditions (Optional)</Label>
                            </div>
                        )}
                    </div>
                    {type === "entry" && (
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
                    )}
                </div>
            </CardHeader>
            {(type === "entry" || (type === "exit" && isExitConditionsEnabled)) && (
                <CardContent className="space-y-4">
                    {conditions.map((condition, index) => (
                        <React.Fragment key={condition.id}>
                            <Card>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="grid grid-cols-1 gap-2 w-full pe-5">
                                            {(orderSettings.transactionType === "onlylong" || orderSettings.transactionType === "bothside") && (
                                                <div className="space-y-2">
                                                    <div className="text-green-600 font-medium text-center">
                                                        {type === "entry" ? "Long Entry Condition" : "Long Exit Condition"}
                                                    </div>
                                                    <div className="flex space-x-2 w-full">
                                                        <IndicatorSelector
                                                            value={condition.longIndicator}
                                                            onChange={(value) => updateCondition(condition.id, { longIndicator: value, longParams: getDefaultParams(value) })}
                                                            params={condition.longParams}
                                                            onParamsChange={(params) => updateCondition(condition.id, { longParams: params })}
                                                            options={frameworks}
                                                            placeholder="Select indicator"
                                                            isIndicator
                                                        />
                                                        <IndicatorSelector
                                                            value={condition.longComparator}
                                                            onChange={(value) => updateCondition(condition.id, { longComparator: value })}
                                                            params={{}}
                                                            onParamsChange={() => { }}
                                                            options={comparators}
                                                            placeholder="Select comparator"
                                                        />
                                                        <IndicatorSelector
                                                            value={condition.longSecondIndicator}
                                                            onChange={(value) => updateCondition(condition.id, { longSecondIndicator: value, longSecondParams: getDefaultParams(value) })}
                                                            params={condition.longSecondParams}
                                                            onParamsChange={(params) => updateCondition(condition.id, { longSecondParams: params })}
                                                            options={frameworks}
                                                            placeholder="Select indicator"
                                                            isIndicator
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {(orderSettings.transactionType === "onlyshort" || orderSettings.transactionType === "bothside") && (
                                                <div className="space-y-2 mt-3">
                                                    <div className="text-red-600 font-medium text-center">
                                                        {type === "entry" ? "Short Entry Condition" : "Short Exit Condition"}
                                                    </div>
                                                    <div className="flex space-x-2 w-full">
                                                        <IndicatorSelector
                                                            value={condition.shortIndicator}
                                                            onChange={(value) => updateCondition(condition.id, { shortIndicator: value, shortParams: getDefaultParams(value) })}
                                                            params={condition.shortParams}
                                                            onParamsChange={(params) => updateCondition(condition.id, { shortParams: params })}
                                                            options={frameworks}
                                                            placeholder="Select indicator"
                                                            isIndicator
                                                        />
                                                        <IndicatorSelector
                                                            value={condition.shortComparator}
                                                            onChange={(value) => updateCondition(condition.id, { shortComparator: value })}
                                                            params={{}}
                                                            onParamsChange={() => { }}
                                                            options={comparators}
                                                            placeholder="Select comparator"
                                                        />
                                                        <IndicatorSelector
                                                            value={condition.shortSecondIndicator}
                                                            onChange={(value) => updateCondition(condition.id, { shortSecondIndicator: value, shortSecondParams: getDefaultParams(value) })}
                                                            params={condition.shortSecondParams}
                                                            onParamsChange={(params) => updateCondition(condition.id, { shortSecondParams: params })}
                                                            options={frameworks}
                                                            placeholder="Select indicator"
                                                            isIndicator
                                                        />
                                                    </div>
                                                </div>
                                            )}
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
                        <Button type="button" variant="outline" className="flex items-center space-x-2" onClick={addCondition}>
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Condition</span>
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default Conditions;