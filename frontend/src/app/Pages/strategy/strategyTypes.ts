export interface InstrumentItem {
    id: number | string;
    type: string;
    name: string;
    price: number;
    exchange: string;
    qty: number;
}

export interface OrderSettingsData {
    orderType: string;
    startTime: string;
    squareOff: string;
    days: string[];
    transactionType?: string;
    chartType?: string;
    interval?: string;
    template?: string; // Added to match selectedTemplate usage
}

export interface LegAdvanceFeatures {
    premiumDifference?: { value: number | "" };
    waitAndTrade?: { value: string | ""; unit: string };
    reEntryExecute?: { mode: string; value: number | ""; executionType: string; executionTypeSelection: string };
    trailSL?: { mode: string; values: string[] };
}

export interface OrderLeg {
    id: string;
    isBuy: "Buy" | "Sell";
    isCE: "CE" | "PE";
    isWeekly: "Weekly" | "Monthly";
    firstSelection: string;
    secondSelection: string;
    tpSelection: string;
    slSelection: string;
    onSelection: string;
    onSelectionSec: string;
    advanceFeatures: LegAdvanceFeatures;
}

export interface OrderLegsData {
    advanceFeatures: {
        moveSLToCost: boolean;
        exitAllOnSLTgt: boolean;
        prePunchSL: boolean;
        premiumDifference: { enabled: boolean };
        waitAndTrade: { enabled: boolean };
        reEntryExecute: { enabled: boolean };
        trailSL: { enabled: boolean };
    };
    legs: OrderLeg[];
}

export interface OptionLeg {
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

export interface OptionPositionBuilderData {
    positions: OptionLeg[];
}

export interface IndicatorParams {
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

export interface Condition {
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

export interface EntryConditionsData {
    conditions: Condition[];
    useCombinedChart?: boolean;
}

export interface ExitConditionsData {
    conditions: Condition[];
    isEnabled: boolean;
}

export interface RiskManagementData {
    profit: string;
    loss: string;
    total: string;
    time: string;
    trailingType: string;
    lockFixProfit: { ifProfit: string; profitAt: string };
    trailProfit: { everyIncrease: string; trailProfitBy: string };
    lockAndTrail: { ifProfit: string; profitAt: string; everyIncrease: string; trailProfitBy: string };
}

export interface StrategyPayload {
    strategyName: string;
    strategyType: "timebased" | "indicatorbased";
    instruments: InstrumentItem[];
    orderSettings: OrderSettingsData;
    orderLegs: OrderLegsData | null;
    optionPositionBuilder: OptionPositionBuilderData | null;
    entryConditions: EntryConditionsData | null;
    exitConditions: ExitConditionsData | null;
    riskManagement: RiskManagementData;
}

export interface TdStrategy {
    id?: string;
    userId: string;
    strategyName: string;
    Duration: string;
    durationValue: number;
    features: { title: string; enabled: boolean }[]; // Updated to match expected structure
    pricing: number;
    createdAt: string;
    updateAt: string;
    instruments?: InstrumentItem[];
    orderSettings?: OrderSettingsData;
    orderLegs?: OrderLegsData | null;
    optionPositionBuilder?: OptionPositionBuilderData | null;
    entryConditions?: EntryConditionsData | null;
    exitConditions?: ExitConditionsData | null;
    riskManagement?: RiskManagementData;
}