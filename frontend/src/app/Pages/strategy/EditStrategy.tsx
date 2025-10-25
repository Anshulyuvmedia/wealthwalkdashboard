import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Ban, RotateCcw } from "lucide-react";
import OrderLegs from "@/components/strategycomponets/OrderLegs";
import Conditions from "@/components/strategycomponets/Conditions";
import { toast } from "sonner";
import type { StrategyPayload, Condition, OrderSettingsData, OrderLegsData, OptionPositionBuilderData, EntryConditionsData, ExitConditionsData, RiskManagementData, InstrumentItem, TdStrategy } from "./strategyTypes";
import { apiService } from "./apiservice";

const EditStrategy: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get the strategy ID from URL

    // State
    const [strategyType, setStrategyType] = useState<"timebased" | "indicatorbased">("timebased");
    const [strategyName, setStrategyName] = useState<string>("");
    const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
    const [orderSettings, setOrderSettings] = useState<OrderSettingsData>({
        orderType: "MIS",
        startTime: "09:15",
        squareOff: "03:15",
        days: [],
        transactionType: "bothside",
        chartType: "heikinashi",
        interval: "10",
    });
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [orderLegs, setOrderLegs] = useState<OrderLegsData | null>(null);
    const [riskManagementData, setRiskManagementData] = useState<RiskManagementData>({
        profit: "",
        loss: "",
        total: "",
        time: "",
        trailingType: "notrailing",
        lockFixProfit: { ifProfit: "", profitAt: "" },
        trailProfit: { everyIncrease: "", trailProfitBy: "" },
        lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
    });
    const [entryConditions, setEntryConditions] = useState<EntryConditionsData>({ conditions: [] });
    const [exitConditions, setExitConditions] = useState<ExitConditionsData>({ conditions: [], isEnabled: false });
    const [optionPositionBuilder, setOptionPositionBuilder] = useState<OptionPositionBuilderData>({ positions: [] });

    // Fetch strategy data on component mount
    useEffect(() => {
        const fetchStrategy = async () => {
            if (id) {
                try {
                    const strategy = await apiService.getStrategy(id);
                    setStrategyName(strategy.strategyName);
                    setStrategyType(strategy.strategyType);
                    setInstruments(strategy.instruments || []);
                    setOrderSettings({
                        ...orderSettings,
                        ...strategy.orderSettings,
                        days: strategy.orderSettings?.days || [],
                    });
                    setSelectedTemplate(strategy.orderSettings?.template || "");
                    if (strategy.strategyType === "timebased" && strategy.orderLegs) {
                        setOrderLegs(strategy.orderLegs);
                    }
                    if (strategy.strategyType === "indicatorbased") {
                        setOptionPositionBuilder(strategy.optionPositionBuilder || { positions: [] });
                        setEntryConditions(strategy.entryConditions || { conditions: [] });
                        setExitConditions(strategy.exitConditions || { conditions: [], isEnabled: false });
                    }
                    setRiskManagementData(strategy.riskManagement || {
                        profit: "",
                        loss: "",
                        total: "",
                        time: "",
                        trailingType: "notrailing",
                        lockFixProfit: { ifProfit: "", profitAt: "" },
                        trailProfit: { everyIncrease: "", trailProfitBy: "" },
                        lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
                    });
                } catch (error) {
                    console.error("Error fetching strategy:", error);
                    toast.error("Failed to load strategy data.");
                }
            }
        };
        fetchStrategy();
    }, [id]);

    // Handlers
    const handleOrderSettingsChange = useCallback((data: OrderSettingsData) => {
        setOrderSettings((prev) => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
    }, []);

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
        setRiskManagementData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleTrailingTypeChange = useCallback((value: string) => {
        setRiskManagementData((prev) => ({ ...prev, trailingType: value }));
    }, []);

    const handleTrailingDataChange = useCallback((tab: string, field: string, value: string) => {
        setRiskManagementData((prev) => ({
            ...prev,
            [tab]: { ...prev[tab], [field]: value },
        }));
    }, []);

    const handleEntryConditionsChange = useCallback((data: { conditions: Condition[] }) => {
        setEntryConditions({ conditions: data.conditions });
    }, []);

    const handleExitConditionsChange = useCallback((data: { conditions: Condition[]; isEnabled?: boolean }) => {
        setExitConditions({ conditions: data.conditions, isEnabled: data.isEnabled ?? false });
    }, []);

    const handleOptionPositionBuilderChange = useCallback((data: OptionPositionBuilderData) => {
        setOptionPositionBuilder(data);
    }, []);

    const resetForm = useCallback(() => {
        const fetchStrategy = async () => {
            if (id) {
                try {
                    const strategy = await apiService.getStrategy(id);
                    setStrategyName(strategy.strategyName);
                    setStrategyType(strategy.strategyType);
                    setInstruments(strategy.instruments || []);
                    setOrderSettings({
                        ...orderSettings,
                        ...strategy.orderSettings,
                        days: strategy.orderSettings?.days || [],
                    });
                    setSelectedTemplate(strategy.orderSettings?.template || "");
                    if (strategy.strategyType === "timebased" && strategy.orderLegs) {
                        setOrderLegs(strategy.orderLegs);
                    }
                    if (strategy.strategyType === "indicatorbased") {
                        setOptionPositionBuilder(strategy.optionPositionBuilder || { positions: [] });
                        setEntryConditions(strategy.entryConditions || { conditions: [] });
                        setExitConditions(strategy.exitConditions || { conditions: [], isEnabled: false });
                    }
                    setRiskManagementData(strategy.riskManagement || {
                        profit: "",
                        loss: "",
                        total: "",
                        time: "",
                        trailingType: "notrailing",
                        lockFixProfit: { ifProfit: "", profitAt: "" },
                        trailProfit: { everyIncrease: "", trailProfitBy: "" },
                        lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
                    });
                    toast.success("Form reset to original values!");
                } catch (error) {
                    console.error("Error resetting form:", error);
                    toast.error("Failed to reset form.");
                }
            }
        };
        fetchStrategy();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation (same as create, adjusted for edit context)
        if (!strategyName.trim()) {
            toast.error("Please enter a valid strategy name.");
            return;
        }
        if (instruments.length === 0) {
            toast.error("Please select at least one instrument.");
            return;
        }
        if (instruments.some((inst) => inst.qty <= 0)) {
            toast.error("Instrument quantities must be greater than zero.");
            return;
        }
        if (orderSettings.startTime >= orderSettings.squareOff) {
            toast.error("Start time must be before square-off time.");
            return;
        }
        if (strategyType === "timebased" && (!orderLegs || orderLegs.legs.length === 0)) {
            toast.error("Please configure at least one order leg for time-based strategy.");
            return;
        }
        if (strategyType === "indicatorbased") {
            if (optionPositionBuilder.positions.length === 0) {
                toast.error("Please configure at least one position in Option Position Builder.");
                return;
            }
            if (optionPositionBuilder.positions.some((pos) => pos.qty <= 0)) {
                toast.error("Position quantities must be greater than zero.");
                return;
            }
            if (entryConditions.conditions.length === 0) {
                toast.error("Please configure at least one entry condition for indicator-based strategy.");
                return;
            }
            if (
                entryConditions.conditions.some(
                    (cond) =>
                        !cond.longIndicator ||
                        !cond.longComparator ||
                        !cond.shortIndicator ||
                        !cond.shortComparator
                )
            ) {
                toast.error("Please select valid indicators and comparators for entry conditions.");
                return;
            }
            if (
                exitConditions.isEnabled &&
                exitConditions.conditions.some(
                    (cond) =>
                        !cond.longIndicator ||
                        !cond.longComparator ||
                        !cond.shortIndicator ||
                        !cond.shortComparator
                )
            ) {
                toast.error("Please select valid indicators and comparators for exit conditions.");
                return;
            }
        }

        const payload: StrategyPayload = {
            strategyName,
            strategyType,
            instruments,
            orderSettings,
            orderLegs: strategyType === "timebased" ? orderLegs : null,
            optionPositionBuilder: strategyType === "indicatorbased" ? optionPositionBuilder : null,
            entryConditions: strategyType === "indicatorbased" ? entryConditions : null,
            exitConditions: strategyType === "indicatorbased" ? exitConditions : null,
            riskManagement: riskManagementData,
        };

        try {
            await apiService.updateStrategy(id!, payload); // Use updateStrategy instead of createStrategy
            navigate("/strategy");
        } catch (error) {
            console.error("Error updating strategy:", error);
            toast.error(error.message || "Failed to update strategy.");
        }
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
                <SiteHeader title="Edit Strategy" />
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
                                    variant="outline"
                                    onClick={resetForm}
                                    className="cursor-pointer"
                                >
                                    <RotateCcw size={16} className="text-white" />
                                    Reset
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
                                <Conditions
                                    orderSettings={orderSettings}
                                    type="entry"
                                    onConditionsChange={handleEntryConditionsChange}
                                />
                                <Conditions
                                    orderSettings={orderSettings}
                                    type="exit"
                                    onConditionsChange={handleExitConditionsChange}
                                />
                                <OptionPositionBuilder onPositionsChange={handleOptionPositionBuilderChange} />
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
                                Update Strategy
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default EditStrategy;