import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import StrategyType from "@/components/strategycomponets/StrategyType";
import Instruments from "@/components/strategycomponets/Instruments";
import OrderSettings from "@/components/strategycomponets/OrderSettings";
import OptionPositionBuilder from "@/components/strategycomponets/OptionPositionBuilder";
import RiskManagement from "@/components/strategycomponets/RiskManagement";
import { Ban, Trash2 } from "lucide-react";
import OrderLegs from "@/components/strategycomponets/OrderLegs";
import Conditions from "@/components/strategycomponets/Conditions";
// Interfaces for existing components (from previous code)
interface OrderSettingsData {
    orderType: string;
    startTime: string;
    squareOff: string;
    days: string[];
    transactionType?: string;
    chartType?: string;
    interval?: string;
}

interface OrderLegsData {
    advanceFeatures: {
        moveSLToCost: boolean;
        exitAllOnSLTgt: boolean;
        prePunchSL: boolean;
        premiumDifference: { enabled: boolean };
        waitAndTrade: { enabled: boolean };
        reEntryExecute: { enabled: boolean };
        trailSL: { enabled: boolean };
    };
    legs: any[];
}

// Placeholder interfaces for components not provided
// interface EntryConditionsData {
//     indicators: string[]; // e.g., ["RSI", "MA"]
//     conditions: { indicator: string; operator: string; value: string }[]; // e.g., [{ indicator: "RSI", operator: ">", value: "70" }]
// }

// interface ExitConditionsData {
//     exitRules: { type: string; value: string }[]; // e.g., [{ type: "profit_target", value: "5%" }]
// }

// interface OptionPositionBuilderData {
//     positions: { type: string; strike: string; qty: number }[]; // e.g., [{ type: "call", strike: "45000", qty: 1 }]
// }

const AddStrategy: React.FC = () => {
    const navigate = useNavigate();

    // State for all components
    const [strategyType, setStrategyType] = useState<"timebased" | "indicatorbased">("timebased");
    const [strategyName, setStrategyName] = useState<string>("");
    const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
    const [orderSettings, setOrderSettings] = useState<OrderSettingsData>({
        orderType: "MIS",
        startTime: "09:15",
        squareOff: "03:15",
        days: [],
    });
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [orderLegs, setOrderLegs] = useState<OrderLegsData | null>(null);
    const [riskManagementData, setRiskManagementData] = useState({
        profit: "",
        loss: "",
        total: "",
        time: "",
        trailingType: "notrailing",
        lockFixProfit: { ifProfit: "", profitAt: "" },
        trailProfit: { everyIncrease: "", trailProfitBy: "" },
        lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
    });
    // const [entryConditions, setEntryConditions] = useState<EntryConditionsData>({
    //     indicators: [],
    //     conditions: [],
    // });
    // const [exitConditions, setExitConditions] = useState<ExitConditionsData>({
    //     exitRules: [],
    // });
    // const [optionPositionBuilder, setOptionPositionBuilder] = useState<OptionPositionBuilderData>({
    //     positions: [],
    // });

    // Memoize handleOrderSettingsChange
    const handleOrderSettingsChange = useCallback((data: OrderSettingsData) => {
        setOrderSettings((prev) => {
            // Only update if data has changed to avoid unnecessary re-renders
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
                // console.log('AddStrategy orderSettings:', data);
                return data;
            }
            return prev;
        });
    }, [])

    const handleTemplateSelect = useCallback((template: string) => {
        setSelectedTemplate(template);
    }, []);

    const handleOrderLegsChange = useCallback((data: OrderLegsData) => {
        setOrderLegs(data);
    }, []);

    const handleInstrumentsChange = useCallback((list: InstrumentItem[]) => {
        setInstruments(list);
    }, []);

    const handleRiskManagementChange = useCallback((field: string, value: string) => {
        setRiskManagementData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleTrailingTypeChange = useCallback((value: string) => {
        setRiskManagementData((prev) => ({
            ...prev,
            trailingType: value,
        }));
    }, []);

    const handleTrailingDataChange = useCallback((tab: string, field: string, value: string) => {
        setRiskManagementData((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [field]: value,
            },
        }));
    }, []);

    // const handleEntryConditionsChange = (data: EntryConditionsData) => {
    //     setEntryConditions(data);
    // };

    // const handleExitConditionsChange = (data: ExitConditionsData) => {
    //     setExitConditions(data);
    // };

    // const handleOptionPositionBuilderChange = (data: OptionPositionBuilderData) => {
    //     setOptionPositionBuilder(data);
    // };

    // Form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!strategyName) {
            alert("Please enter a strategy name.");
            return;
        }
        if (instruments.length === 0) {
            alert("Please select at least one instrument.");
            return;
        }
        if (strategyType === "timebased" && !orderLegs) {
            alert("Please configure order legs for time-based strategy.");
            return;
        }
        // if (strategyType === "indicatorbased" && entryConditions.conditions.length === 0) {
        //     alert("Please configure entry conditions for indicator-based strategy.");
        //     return;
        // }

        const payload = {
            strategyName,
            strategyType,
            instruments,
            orderSettings,
            orderLegs: strategyType === "timebased" ? orderLegs : null,
            riskManagement: riskManagementData,
            // entryConditions: strategyType === "indicatorbased" ? entryConditions : null,
            // exitConditions: strategyType === "indicatorbased" ? exitConditions : null,
            // optionPositionBuilder: strategyType === "indicatorbased" ? optionPositionBuilder : null,
        };

        console.log("🚀 Strategy Submission:", payload);
        // Replace with API call or other save logic
    };

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
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex justify-between items-center">
                            <div className="flex-1 me-4">
                                <Input
                                    type="text"
                                    id="strategy-name"
                                    placeholder="Enter Strategy Name"
                                    value={strategyName}
                                    onChange={(e) => setStrategyName(e.target.value)}
                                />
                            </div>
                            <div className="space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="cursor-pointer"
                                >
                                    <Ban size={16} className="text-white" />
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="cursor-pointer"
                                >
                                    <Trash2 size={16} className="text-white" />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <StrategyType strategyType={strategyType} setStrategyType={setStrategyType} />
                        <Instruments strategyType={strategyType} onInstrumentsChange={handleInstrumentsChange} />
                        <OrderSettings
                            strategyType={strategyType}
                            template={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                            onSettingsChange={handleOrderSettingsChange}
                        />
                        {strategyType === "timebased" ? (
                            <OrderLegs selectedTemplate={selectedTemplate} onLegsChange={handleOrderLegsChange} />
                        ) : (
                            <>
                                <Conditions orderSettings={orderSettings} type="entry" />
                                <Conditions orderSettings={orderSettings} type="exit" />
                                <OptionPositionBuilder />
                            </>
                        )}
                        <RiskManagement
                            strategyType={strategyType}
                            riskManagementData={riskManagementData}
                            onRiskManagementChange={handleRiskManagementChange}
                            onTrailingTypeChange={handleTrailingTypeChange}
                            onTrailingDataChange={handleTrailingDataChange}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Save Strategy
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AddStrategy;
