import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderLegControls } from "@/components/orderlegscomponents/OrderLegControls";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
    firstOptions,
    secondOptions,
    tpOptions,
    slOptions,
    priceOptions,
    waitAndTradeTimeOptions,
    reEntryExecuteOptions,
    executionOptions,
    executionTypeOptions,
    tslOptions,
    trailSlOptions,
} from "@/constants/orderOptions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CircleAlert, AlertCircleIcon, PlusCircle } from "lucide-react";
import { getTemplateLegs } from "@/constants/templateConfigs";

export interface OrderLeg {
    id: string;
    isBuy: "Buy" | "Sell";
    isCE: "CE" | "PE";
    isWeekly: "Weekly" | "Monthly";
    qty: number;
    firstSelection: string;
    secondSelection: string;
    tpSelection: string;
    tpQty: number;
    slSelection: string;
    slQty: number;
    onSelection: string;
    onSelectionSec: string;

    // ----- per-leg advance fields -----
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

interface OrderLegsProps {
    selectedTemplate: string;
    onLegsChange: (data: OrderLegsData) => void;
    initialData?: OrderLegsData;
}

const OrderLegs: React.FC<OrderLegsProps> = ({
    selectedTemplate,
    onLegsChange,
    initialData,
}) => {
    const [legs, setLegs] = useState<OrderLeg[]>([]);
    const [moveSLToCost, setMoveSLToCost] = useState(false);
    const [exitAllOnSLTgt, setExitAllOnSLTgt] = useState(false);
    const [prePunchSL, setPrePunchSL] = useState(false);
    const [premiumDifference, setPremiumDifference] = useState(false);
    const [waitAndTrade, setWaitAndTrade] = useState(false);
    const [reEntryExecute, setReEntryExecute] = useState(false);
    const [trailSL, setTrailSL] = useState(false);

    // dialogs – edit the *first* leg only (you can later add per-leg dialogs)
    const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
    const [isReEntryDialogOpen, setIsReEntryDialogOpen] = useState(false);
    const [isTrailSLDialogOpen, setIsTrailSLDialogOpen] = useState(false);
    const [tempPremiumDiffValue, setTempPremiumDiffValue] = useState<number | "">("");
    const [tempReEntryValue, setTempReEntryValue] = useState<number | "">("");
    const [tempExecutionTypeSelection, setTempExecutionTypeSelection] = useState("Combined");
    const [tempTslMode, setTempTslMode] = useState("TSL %");
    const [tempTslSelection, setTempTslSelection] = useState("");
    const [tempTslTrailBy, setTempTslTrailBy] = useState("");

    const createDefaultLeg = (): OrderLeg => ({
        id: uuidv4(),
        isBuy: "Buy",
        isCE: "CE",
        isWeekly: "Weekly",
        qty: 1,
        firstSelection: "ATM pt",
        secondSelection: "ATM",
        tpSelection: "TP pt",
        tpQty: 30,
        slSelection: "SL pt",
        slQty: 30,
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
        tslSelection: "",
        tslTrailBy: "",
    });

    /* ------------------- template / initial data ------------------- */
    useEffect(() => {
        if (initialData) {
            const cloned = initialData.legs.map((l) => ({ ...l, id: uuidv4() }));
            setLegs(cloned);
            const af = initialData.advanceFeatures;
            setMoveSLToCost(af.moveSLToCost);
            setExitAllOnSLTgt(af.exitAllOnSLTgt);
            setPrePunchSL(af.prePunchSL);
            setPremiumDifference(af.premiumDifference.enabled);
            setWaitAndTrade(af.waitAndTrade.enabled);
            setReEntryExecute(af.reEntryExecute.enabled);
            setTrailSL(af.trailSL.enabled);
            return;
        }

        if (selectedTemplate) {
            const tmpl = getTemplateLegs(selectedTemplate);
            setLegs(tmpl.length > 0 ? tmpl.map((l) => ({ ...l, id: uuidv4() })) : [createDefaultLeg()]);
            // reset toggles
            setMoveSLToCost(false);
            setExitAllOnSLTgt(false);
            setPrePunchSL(false);
            setPremiumDifference(false);
            setWaitAndTrade(false);
            setReEntryExecute(false);
            setTrailSL(false);
        }
    }, [initialData, selectedTemplate]);

    /* ------------------- leg CRUD ------------------- */
    const handleAddLeg = () => setLegs((p) => [...p, createDefaultLeg()]);
    const handleDeleteLeg = (id: string) => {
        if (legs.length === 1) return;
        setLegs((p) => p.filter((l) => l.id !== id));
    };
    const handleCopyLeg = (id: string) => {
        const leg = legs.find((l) => l.id === id);
        if (!leg) return;
        setLegs((p) => [...p, { ...leg, id: uuidv4() }]);
    };

    const updateLeg = (id: string, updates: Partial<OrderLeg>) => {
        setLegs((p) => p.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    };

    /* ------------------- notify parent ------------------- */
    const data = useMemo(
        () => ({
            advanceFeatures: {
                moveSLToCost,
                exitAllOnSLTgt,
                prePunchSL,
                premiumDifference: { enabled: premiumDifference },
                waitAndTrade: { enabled: waitAndTrade },
                reEntryExecute: { enabled: reEntryExecute },
                trailSL: { enabled: trailSL },
            },
            legs: legs.map((l) => ({ ...l })),
        }),
        [
            moveSLToCost,
            exitAllOnSLTgt,
            prePunchSL,
            premiumDifference,
            waitAndTrade,
            reEntryExecute,
            trailSL,
            legs,
        ]
    );

    useEffect(() => {
        const t = setTimeout(() => onLegsChange(data), 5000);
        return () => clearTimeout(t);
    }, [data, onLegsChange]);

    /* ------------------- dialogs (edit first leg only) ------------------- */
    const openPremiumDialog = () => {
        setTempPremiumDiffValue(legs[0]?.premiumDiffValue ?? "");
        setIsPremiumDialogOpen(true);
    };
    const openReEntryDialog = () => {
        setTempReEntryValue(legs[0]?.reEntryValue ?? "");
        setTempExecutionTypeSelection(legs[0]?.executionTypeSelection ?? "Combined");
        setIsReEntryDialogOpen(true);
    };
    const openTrailSLDialog = () => {
        setTempTslMode(legs[0]?.tslMode ?? "TSL %");
        setTempTslSelection(legs[0]?.tslSelection ?? "");
        setTempTslTrailBy(legs[0]?.tslTrailBy ?? "");
        setIsTrailSLDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full space-x-2">
                    <CardTitle className="text-lg">Order Legs</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {legs.map((leg) => (
                    <OrderLegControls
                        key={leg.id}
                        qty={leg.qty}
                        setQty={(v) => updateLeg(leg.id, { qty: v })}
                        slQty={leg.slQty}
                        setSlQty={(v) => updateLeg(leg.id, { slQty: v })}
                        tpQty={leg.tpQty}
                        setTpQty={(v) => updateLeg(leg.id, { tpQty: v })}
                        isBuy={leg.isBuy}
                        setIsBuy={(v) => updateLeg(leg.id, { isBuy: v })}
                        isCE={leg.isCE}
                        setIsCE={(v) => updateLeg(leg.id, { isCE: v })}
                        isWeekly={leg.isWeekly}
                        setIsWeekly={(v) => updateLeg(leg.id, { isWeekly: v })}
                        firstSelection={leg.firstSelection}
                        setFirstSelection={(v) => updateLeg(leg.id, { firstSelection: v })}
                        secondSelection={leg.secondSelection}
                        setSecondSelection={(v) => updateLeg(leg.id, { secondSelection: v })}
                        tpSelection={leg.tpSelection}
                        setTpSelection={(v) => updateLeg(leg.id, { tpSelection: v })}
                        slSelection={leg.slSelection}
                        setSlSelection={(v) => updateLeg(leg.id, { slSelection: v })}
                        onSelection={leg.onSelection}
                        setOnSelection={(v) => updateLeg(leg.id, { onSelection: v })}
                        onSelectionSec={leg.onSelectionSec}
                        setOnSelectionSec={(v) => updateLeg(leg.id, { onSelectionSec: v })}
                        firstOptions={firstOptions}
                        secondOptions={secondOptions}
                        tpOptions={tpOptions}
                        slOptions={slOptions}
                        priceOptions={priceOptions}
                        onDelete={() => handleDeleteLeg(leg.id)}
                        onCopy={() => handleCopyLeg(leg.id)}
                        moveSLToCost={moveSLToCost}
                        exitAllOnSLTgt={exitAllOnSLTgt}
                        prePunchSL={prePunchSL}
                        premiumDifference={premiumDifference}
                        waitAndTrade={waitAndTrade}
                        reEntryExecute={reEntryExecute}
                        trailSL={trailSL}

                        // ----- per-leg advance values + setters -----
                        premiumDiffValue={leg.premiumDiffValue}
                        setPremiumDiffValue={(v) => updateLeg(leg.id, { premiumDiffValue: v })}
                        waitAndTradeValue={leg.waitAndTradeValue}
                        setWaitAndTradeValue={(v) => updateLeg(leg.id, { waitAndTradeValue: v })}
                        waitAndTradeUnit={leg.waitAndTradeUnit}
                        setWaitAndTradeUnit={(v) => updateLeg(leg.id, { waitAndTradeUnit: v })}
                        reEntryMode={leg.reEntryMode}
                        setReEntryMode={(v) => updateLeg(leg.id, { reEntryMode: v })}
                        reEntryValue={leg.reEntryValue}
                        setReEntryValue={(v) => updateLeg(leg.id, { reEntryValue: v })}
                        executionType={leg.executionType}
                        setExecutionType={(v) => updateLeg(leg.id, { executionType: v })}
                        executionTypeSelection={leg.executionTypeSelection}
                        setExecutionTypeSelection={(v) => updateLeg(leg.id, { executionTypeSelection: v })}
                        tslMode={leg.tslMode}
                        setTslMode={(v) => updateLeg(leg.id, { tslMode: v })}
                        tslSelection={leg.tslSelection}
                        setTslSelection={(v) => updateLeg(leg.id, { tslSelection: v })}
                        tslTrailBy={leg.tslTrailBy}
                        setTslTrailBy={(v) => updateLeg(leg.id, { tslTrailBy: v })}

                        waitAndTradeTimeOptions={waitAndTradeTimeOptions}
                        reEntryExecuteOptions={reEntryExecuteOptions}
                        executionOptions={executionOptions}
                        trailSlOptions={trailSlOptions}
                        tslOptions={tslOptions}
                    />
                ))}

                <Button type="button" variant="default" onClick={handleAddLeg} className="flex items-center ms-auto">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Leg
                </Button>

                {/* ---------- Advance Feature Toggles (global) ---------- */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="adv">
                        <AccordionTrigger>
                            <div className="flex items-center">
                                <span className="mr-2">Advance Features</span>
                                <Tooltip>
                                    <TooltipContent>
                                        <p>Click to configure advanced trading options</p>
                                    </TooltipContent>
                                    <TooltipTrigger asChild>
                                        <div tabIndex={0} role="button" className="cursor-pointer">
                                            <CircleAlert size={14} />
                                        </div>
                                    </TooltipTrigger>
                                </Tooltip>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-wrap gap-6">
                                {/* Move SL to Cost */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="moveSLToCost"
                                        checked={moveSLToCost}
                                        onCheckedChange={(c) => {
                                            const checked = !!c;
                                            setMoveSLToCost(checked);
                                            if (checked) {
                                                setPrePunchSL(false);
                                                setPremiumDifference(false);
                                                setWaitAndTrade(false);
                                                setReEntryExecute(false);
                                                setTrailSL(false);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="moveSLToCost">Move SL to Cost</Label>
                                </div>

                                {/* Exit All on SL/Tgt */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="exitAllOnSLTgt"
                                        checked={exitAllOnSLTgt}
                                        onCheckedChange={(c) => {
                                            setExitAllOnSLTgt(!!c);
                                            if (!!c) setReEntryExecute(false);
                                        }}
                                    />
                                    <Label htmlFor="exitAllOnSLTgt">Exit All on SL/Tgt</Label>
                                </div>

                                {/* Pre-Punch SL */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="prePunchSL"
                                        checked={prePunchSL}
                                        disabled={moveSLToCost}
                                        onCheckedChange={(c) => setPrePunchSL(!!c)}
                                    />
                                    <Label
                                        htmlFor="prePunchSL"
                                        className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        Pre Punch SL
                                    </Label>
                                </div>

                                {/* Wait & Trade */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="waitAndTrade"
                                        checked={waitAndTrade}
                                        disabled={moveSLToCost}
                                        onCheckedChange={(c) => setWaitAndTrade(!!c)}
                                    />
                                    <Label
                                        htmlFor="waitAndTrade"
                                        className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        Wait & Trade
                                    </Label>
                                </div>

                                {/* Premium Difference */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="premiumDifference"
                                        checked={premiumDifference}
                                        disabled={moveSLToCost}
                                        onCheckedChange={(c) => {
                                            setPremiumDifference(!!c);
                                            if (!!c) openPremiumDialog();
                                            else
                                                setLegs((p) =>
                                                    p.map((l) => ({ ...l, premiumDiffValue: "" }))
                                                );
                                        }}
                                    />
                                    <Label
                                        htmlFor="premiumDifference"
                                        className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        Premium Difference
                                    </Label>

                                    <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Premium Difference</DialogTitle>
                                                <DialogDescription>
                                                    <Alert>
                                                        <AlertCircleIcon color="skyblue" />
                                                        <AlertTitle className="text-sky-300">
                                                            About Premium Difference
                                                        </AlertTitle>
                                                        <AlertDescription className="text-sky-300">
                                                            Order will be traded when premium difference reaches the
                                                            selected value.
                                                        </AlertDescription>
                                                    </Alert>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Label htmlFor="premiumDiffInput">
                                                Trade when premium difference {"<="}
                                            </Label>
                                            <Input
                                                id="premiumDiffInput"
                                                type="number"
                                                placeholder="Enter premium difference..."
                                                value={tempPremiumDiffValue}
                                                onChange={(e) => setTempPremiumDiffValue(Number(e.target.value) || "")}
                                            />
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        onClick={() => {
                                                            setLegs((p) =>
                                                                p.map((l) => ({
                                                                    ...l,
                                                                    premiumDiffValue: tempPremiumDiffValue,
                                                                }))
                                                            );
                                                            setIsPremiumDialogOpen(false);
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Re-Entry / Execute */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="reEntryExecute"
                                        checked={reEntryExecute}
                                        disabled={moveSLToCost || exitAllOnSLTgt}
                                        onCheckedChange={(c) => {
                                            setReEntryExecute(!!c);
                                            if (!!c) openReEntryDialog();
                                            else
                                                setLegs((p) =>
                                                    p.map((l) => ({
                                                        ...l,
                                                        reEntryValue: "",
                                                        executionTypeSelection: "Combined",
                                                    }))
                                                );
                                        }}
                                    />
                                    <Label
                                        htmlFor="reEntryExecute"
                                        className={
                                            moveSLToCost || exitAllOnSLTgt ? "opacity-50 cursor-not-allowed" : ""
                                        }
                                    >
                                        Re Entry / Execute
                                    </Label>

                                    <Dialog open={isReEntryDialogOpen} onOpenChange={setIsReEntryDialogOpen}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Re-Entry / Execute</DialogTitle>
                                                <DialogDescription>
                                                    <Alert>
                                                        <AlertCircleIcon color="skyblue" />
                                                        <AlertDescription className="text-sky-300">
                                                            Combined executes all strategy components as a single order.
                                                            Legwise executes each component separately.
                                                        </AlertDescription>
                                                    </Alert>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ToggleGroup
                                                type="single"
                                                variant="outline"
                                                size="lg"
                                                value={tempExecutionTypeSelection}
                                                onValueChange={(v) => v && setTempExecutionTypeSelection(v)}
                                            >
                                                {executionTypeOptions.map((o) => (
                                                    <ToggleGroupItem key={o} value={o} className="text-xs">
                                                        {o}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                            <div className="mt-4">
                                                <Label className="mb-2">Re-Entry/Execute Cycles</Label>
                                                <Input
                                                    type="number"
                                                    placeholder={
                                                        tempExecutionTypeSelection === "Legwise"
                                                            ? "Not Applicable"
                                                            : "Enter cycles..."
                                                    }
                                                    value={tempReEntryValue}
                                                    onChange={(e) => setTempReEntryValue(Number(e.target.value) || "")}
                                                    disabled={tempExecutionTypeSelection === "Legwise"}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        onClick={() => {
                                                            setLegs((p) =>
                                                                p.map((l) => ({
                                                                    ...l,
                                                                    reEntryValue:
                                                                        tempExecutionTypeSelection === "Legwise"
                                                                            ? ""
                                                                            : tempReEntryValue,
                                                                    executionTypeSelection: tempExecutionTypeSelection,
                                                                }))
                                                            );
                                                            setIsReEntryDialogOpen(false);
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Trail SL */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="trailSL"
                                        checked={trailSL}
                                        disabled={moveSLToCost}
                                        onCheckedChange={(c) => {
                                            setTrailSL(!!c);
                                            if (!!c) openTrailSLDialog();
                                            else
                                                setLegs((p) =>
                                                    p.map((l) => ({
                                                        ...l,
                                                        tslMode: "TSL %",
                                                        tslSelection: "",
                                                        tslTrailBy: "",
                                                    }))
                                                );
                                        }}
                                    />
                                    <Label
                                        htmlFor="trailSL"
                                        className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        Trail SL
                                    </Label>

                                    <Dialog open={isTrailSLDialogOpen} onOpenChange={setIsTrailSLDialogOpen}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Trail Stop Loss</DialogTitle>
                                                <DialogDescription>
                                                    <Alert>
                                                        <AlertCircleIcon color="skyblue" />
                                                        <AlertDescription className="text-sky-300">
                                                            A trailing stop-loss adjusts dynamically as market prices
                                                            move to protect profits.
                                                        </AlertDescription>
                                                    </Alert>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ToggleGroup
                                                type="single"
                                                variant="outline"
                                                size="lg"
                                                value={tempTslMode}
                                                onValueChange={(v) => v && setTempTslMode(v)}
                                            >
                                                {trailSlOptions.map((o) => (
                                                    <ToggleGroupItem key={o} value={o} className="text-xs">
                                                        {o}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                            <div className="mt-4 grid gap-2">
                                                <Label>If price moves (X)</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. 10"
                                                    value={tempTslSelection}
                                                    onChange={(e) => setTempTslSelection(e.target.value)}
                                                />
                                            </div>
                                            <div className="mt-4 grid gap-2">
                                                <Label>Then Trail SL by (Y)</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. 5"
                                                    value={tempTslTrailBy}
                                                    onChange={(e) => setTempTslTrailBy(e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        onClick={() => {
                                                            setLegs((p) =>
                                                                p.map((l) => ({
                                                                    ...l,
                                                                    tslMode: tempTslMode,
                                                                    tslSelection: tempTslSelection,
                                                                    tslTrailBy: tempTslTrailBy,
                                                                }))
                                                            );
                                                            setIsTrailSLDialogOpen(false);
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default OrderLegs;