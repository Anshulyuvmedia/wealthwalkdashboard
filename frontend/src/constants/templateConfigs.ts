// src/constants/templateConfigs.ts
import { v4 as uuidv4 } from "uuid";

export interface OrderLeg {
    id: string;
    isBuy: "Buy" | "Sell";
    isCE: "CE" | "PE";
    isWeekly: "Weekly" | "Monthly";
    qty: number;                    // NEW
    tpQty: number;                  // NEW
    slQty: number;                  // NEW
    firstSelection: string;
    secondSelection: string;
    tpSelection: string;
    slSelection: string;
    onSelection: string;
    onSelectionSec: string;
    premiumDiffValue: number | "";
    waitAndTradeValue: number | "";
    waitAndTradeUnit: string;
    reEntryMode: string;
    reEntryValue: number | "";
    executionType: string;
    executionTypeSelection: string;
    tslMode: string;
    tslSelection: string;
    tslTrailBy: string;
}

export type TemplateConfig = OrderLeg[];

const defaultLeg = (
    overrides: { isBuy: boolean; isCE: boolean } & Partial<Omit<OrderLeg, "isBuy" | "isCE" | "id">>
): OrderLeg => {
    const { isBuy, isCE, ...restOverrides } = overrides;

    const base: Omit<OrderLeg, "id"> = {
        isBuy: isBuy ? "Buy" : "Sell",
        isCE: isCE ? "CE" : "PE",
        isWeekly: "Weekly",
        qty: 50,
        slQty: 25,
        tpQty: 25,
        firstSelection: "ATM pt",
        secondSelection: "ATM",
        tpSelection: "TP pt",
        slSelection: "SL pt",
        onSelection: "On Price",
        onSelectionSec: "On Price",
        premiumDiffValue: "",
        waitAndTradeValue: "",
        waitAndTradeUnit: "⏰ % ↓",
        reEntryMode: "ReEntry On Cost",
        reEntryValue: "",
        executionType: "On Close",
        executionTypeSelection: "Combined",
        tslMode: "TSL %",
        tslSelection: "TSL pt",
        tslTrailBy: "",
    };

    return {
        id: uuidv4(),
        ...base,
        ...restOverrides,
    };
};

export const templateConfigs: Record<string, TemplateConfig> = {
    "Buy Call": [defaultLeg({ isBuy: true, isCE: true })],
    "Sell Put": [defaultLeg({ isBuy: false, isCE: false })],
    "Buy Put": [defaultLeg({ isBuy: true, isCE: false })],
    "Sell Call": [defaultLeg({ isBuy: false, isCE: true })],
    "Bull Call Spread": [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
    ],
    "Bull Put Spread": [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "OTM" }),
    ],
    "Bear Put Spread": [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ATM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "OTM" }),
    ],
    "Bear Call Spread": [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
    ],
    "Short Straddle": [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ATM" }),
    ],
    "Short Strangle": [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "OTM" }),
    ],
    "Iron Butterfly": [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
    ],
    "Short Iron Condor": [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ITM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "OTM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
    ],
    "Call Ratio Back Spread": [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
    ],
    "Put Ratio Back Spread": [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "OTM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "OTM" }),
    ],
    "Long Straddle": [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ATM" }),
    ],
    "Put Ratio Spread": [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "OTM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "OTM" }),
    ],
    "Call Ratio Spread": [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
    ],
    "Long Iron Butterfly": [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ITM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "ATM" }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ATM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "OTM" }),
    ],
    "Iron Strangle": [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "OTM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "ITM" }),
    ],
    "Long Iron Condor": [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: "ITM" }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: "OTM" }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: "ITM" }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: "OTM" }),
    ],
};

export const getTemplateLegs = (template: string): OrderLeg[] => {
    const config = templateConfigs[template];
    if (!config) return [];
    return config.map((leg) => ({ ...leg, id: uuidv4() }));
};