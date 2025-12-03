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
import type { StrategyPayload, Condition, OrderSettingsData, OrderLegsData, OptionPositionBuilderData, EntryConditionsData, ExitConditionsData, RiskManagementData, InstrumentItem, } from "./strategyTypes";
import { apiService } from "./apiservice";

const EditStrategy: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const defaultRiskManagement: RiskManagementData = {
        profit: "",
        loss: "",
        total: "",
        time: "",
        trailingType: "notrailing",
        lockFixProfit: { ifProfit: "", profitAt: "" },
        trailProfit: { everyIncrease: "", trailProfitBy: "" },
        lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
    };

    // State
    const [strategyType, setStrategyType] = useState<"timebased" | "indicatorbased">("timebased");
    const [strategyName, setStrategyName] = useState<string>("");
    const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
    const [orderSettings, setOrderSettings] = useState<OrderSettingsData>({
        orderType: "MIS",
        startTime: "09:15",
        squareOff: "15:15",
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
            if (!id) return;

            try {
                const strategy = await apiService.getStrategy(id);

                // 1. Basic fields
                setStrategyName(strategy.strategyName || "");
                setStrategyType((strategy.strategyType as "timebased" | "indicatorbased") || "timebased");
                setInstruments(strategy.instruments || []);

                // 2. Order Settings — WITH FULL DEFAULTS
                const savedOrderSettings: OrderSettingsData = strategy.orderSettings || {
                    orderType: "MIS",
                    startTime: "09:15",
                    squareOff: "15:15",
                    days: [],
                    transactionType: "bothside",
                    chartType: "heikinashi",
                    interval: "10",
                    template: "",
                };

                setOrderSettings({
                    orderType: savedOrderSettings.orderType,
                    startTime: savedOrderSettings.startTime,
                    squareOff: savedOrderSettings.squareOff,
                    days: savedOrderSettings.days,
                    transactionType: savedOrderSettings.transactionType,
                    chartType: savedOrderSettings.chartType,
                    interval: savedOrderSettings.interval,
                    template: savedOrderSettings.template || "",
                });
                setSelectedTemplate(savedOrderSettings.template || "");

                // 3. Order Legs
                if (strategy.orderLegs) {
                    setOrderLegs(strategy.orderLegs);
                } else if (strategy.strategyType === "timebased") {
                    setOrderLegs({
                        advanceFeatures: {
                            moveSLToCost: false,
                            exitAllOnSLTgt: false,
                            prePunchSL: false,
                            premiumDifference: { enabled: false },
                            waitAndTrade: { enabled: false },
                            reEntryExecute: { enabled: false },
                            trailSL: { enabled: false },
                        },
                        legs: []
                    });
                } else {
                    setOrderLegs(null);
                }

                // 4. Indicator-based
                if (strategy.strategyType === "indicatorbased") {
                    setOptionPositionBuilder(strategy.optionPositionBuilder || { positions: [] });
                    setEntryConditions(strategy.entryConditions || { conditions: [] });
                    setExitConditions(strategy.exitConditions || { conditions: [], isEnabled: false });
                }

                // 5. Risk Management — FULLY TYPE-SAFE
                const savedRisk = strategy.riskManagement || {
                    profit: "",
                    loss: "",
                    total: "",
                    time: "",
                    trailingType: "notrailing",
                    lockFixProfit: { ifProfit: "", profitAt: "" },
                    trailProfit: { everyIncrease: "", trailProfitBy: "" },
                    lockAndTrail: { ifProfit: "", profitAt: "", everyIncrease: "", trailProfitBy: "" },
                } as RiskManagementData;

                setRiskManagementData({
                    profit: savedRisk.profit,
                    loss: savedRisk.loss,
                    total: savedRisk.total,
                    time: savedRisk.time,
                    trailingType: savedRisk.trailingType,
                    lockFixProfit: {
                        ifProfit: savedRisk.lockFixProfit.ifProfit,
                        profitAt: savedRisk.lockFixProfit.profitAt,
                    },
                    trailProfit: {
                        everyIncrease: savedRisk.trailProfit.everyIncrease,
                        trailProfitBy: savedRisk.trailProfit.trailProfitBy,
                    },
                    lockAndTrail: {
                        ifProfit: savedRisk.lockAndTrail.ifProfit,
                        profitAt: savedRisk.lockAndTrail.profitAt,
                        everyIncrease: savedRisk.lockAndTrail.everyIncrease,
                        trailProfitBy: savedRisk.lockAndTrail.trailProfitBy,
                    },
                });

            } catch (error) {
                console.error("Error fetching strategy:", error);
                toast.error("Failed to load strategy data.");
            }
        };

        fetchStrategy();
    }, [id]);
    // Sync selectedTemplate with orderSettings.template
    useEffect(() => {
        if (orderSettings.template) {
            setSelectedTemplate(orderSettings.template);
        }
    }, [orderSettings.template]);
    // Handlers
    const handleOrderSettingsChange = useCallback((data: OrderSettingsData) => {
        setOrderSettings(data);
        if (data.template) {
            setSelectedTemplate(data.template);
        }
    }, []);

    const handleTemplateSelect = useCallback((template: string) => {
        setSelectedTemplate(template);
        setOrderSettings((prev) => ({ ...prev, template }));
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
            if (!id) return;
            try {
                const strategy = await apiService.getStrategy(id);
                setStrategyName(strategy.strategyName || "");
                setStrategyType((strategy.strategyType as "timebased" | "indicatorbased") || "timebased");
                setInstruments(strategy.instruments || []);
                setOrderSettings({
                    orderType: strategy.orderSettings?.orderType ?? "MIS",
                    startTime: strategy.orderSettings?.startTime ?? "09:15",
                    squareOff: strategy.orderSettings?.squareOff ?? "15:15",
                    days: strategy.orderSettings?.days ?? [],
                    transactionType: strategy.orderSettings?.transactionType ?? "bothside",
                    chartType: strategy.orderSettings?.chartType ?? "candle",
                    interval: strategy.orderSettings?.interval ?? "1",
                    template: strategy.orderSettings?.template ?? "",
                });

                setSelectedTemplate(strategy.orderSettings?.template ?? "");
                if (strategy.strategyType === "timebased" && strategy.orderLegs) {
                    setOrderLegs(strategy.orderLegs);
                }
                if (strategy.strategyType === "indicatorbased") {
                    setOptionPositionBuilder(strategy.optionPositionBuilder || { positions: [] });
                    setEntryConditions(strategy.entryConditions || { conditions: [] });
                    setExitConditions(strategy.exitConditions || { conditions: [], isEnabled: false });
                }
                const resetRisk = strategy.riskManagement || defaultRiskManagement;
                setRiskManagementData({
                    profit: resetRisk.profit,
                    loss: resetRisk.loss,
                    total: resetRisk.total,
                    time: resetRisk.time,
                    trailingType: resetRisk.trailingType,
                    lockFixProfit: {
                        ifProfit: resetRisk.lockFixProfit.ifProfit,
                        profitAt: resetRisk.lockFixProfit.profitAt,
                    },
                    trailProfit: {
                        everyIncrease: resetRisk.trailProfit.everyIncrease,
                        trailProfitBy: resetRisk.trailProfit.trailProfitBy,
                    },
                    lockAndTrail: {
                        ifProfit: resetRisk.lockAndTrail.ifProfit,
                        profitAt: resetRisk.lockAndTrail.profitAt,
                        everyIncrease: resetRisk.lockAndTrail.everyIncrease,
                        trailProfitBy: resetRisk.lockAndTrail.trailProfitBy,
                    },
                });
                toast.success("Form reset to original values!");
            } catch (error) {
                console.error("Error resetting form:", error);
                toast.error("Failed to reset form.");
            }
        };
        fetchStrategy();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
        if (strategyType === "timebased" && orderLegs) {
            if (orderLegs.legs.length === 0) {
                toast.error("At least one leg is required.");
                return;
            }
            if (orderLegs.legs.some(l => l.qty <= 0)) {
                toast.error("Leg quantity must be > 0");
                return;
            }
            if (orderLegs.legs.some(l => l.slQty < 0 || l.tpQty < 0)) {
                toast.error("SL/TP quantity cannot be negative");
                return;
            }
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
            await apiService.updateStrategy(id!, payload);
            navigate("/strategy");
        } catch (error) {
            console.error("Error updating strategy:", error);
            const errMsg =
                error instanceof Error
                    ? error.message
                    : typeof error === "string"
                        ? error
                        : "Failed to update strategy.";
            toast.error(errMsg);
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
                        <Instruments
                            strategyType={strategyType}
                            onInstrumentsChange={handleInstrumentsChange}
                            initialInstruments={instruments}
                        />
                        <OrderSettings
                            strategyType={strategyType}
                            template={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                            onSettingsChange={handleOrderSettingsChange}
                            initialSettings={orderSettings}
                        />
                        {strategyType === "timebased" ? (
                            <OrderLegs
                                selectedTemplate={selectedTemplate}
                                onLegsChange={handleOrderLegsChange}
                                initialData={orderLegs ?? undefined}
                                isEditMode={true}
                            />
                        ) : (
                            <>
                                <Conditions
                                    orderSettings={orderSettings}
                                    type="entry"
                                    onConditionsChange={handleEntryConditionsChange}
                                    initialConditions={entryConditions.conditions}
                                />
                                <Conditions
                                    orderSettings={orderSettings}
                                    type="exit"
                                    onConditionsChange={handleExitConditionsChange}
                                    initialConditions={exitConditions.conditions}
                                    initialIsEnabled={exitConditions.isEnabled}
                                />
                                <OptionPositionBuilder
                                    onPositionsChange={handleOptionPositionBuilderChange}
                                    initialPositions={optionPositionBuilder.positions}
                                />
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