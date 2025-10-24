import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderLegHeader } from "@/components/orderlegscomponents/OrderLegHeader";
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CircleAlert, AlertCircleIcon, PlusCircle } from "lucide-react";

interface OrderLeg {
    id: string;
    isBuy: boolean;
    isWeekly: boolean;
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

interface OrderLegsProps {
    selectedTemplate: string;
}

const OrderLegs: React.FC<OrderLegsProps> = ({ selectedTemplate }) => {
    const [legs, setLegs] = useState<OrderLeg[]>([
        {
            id: uuidv4(),
            isBuy: true,
            isWeekly: true,
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
        },
    ]);

    const [moveSLToCost, setMoveSLToCost] = useState(false);
    const [exitAllOnSLTgt, setExitAllOnSLTgt] = useState(false);
    const [prePunchSL, setPrePunchSL] = useState(false);
    const [premiumDifference, setPremiumDifference] = useState(false);
    const [waitAndTrade, setWaitAndTrade] = useState(false);
    const [reEntryExecute, setReEntryExecute] = useState(false);
    const [trailSL, setTrailSL] = useState(false);

    // Dialog open states
    const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
    const [isReEntryDialogOpen, setIsReEntryDialogOpen] = useState(false);
    const [isTrailSLDialogOpen, setIsTrailSLDialogOpen] = useState(false);

    // Temporary state for dialog inputs
    const [tempPremiumDiffValue, setTempPremiumDiffValue] = useState<number | "">("");
    const [tempReEntryValue, setTempReEntryValue] = useState<number | "">("");
    const [tempExecutionType, setTempExecutionType] = useState("On Close");
    const [tempExecutionTypeSelection, setTempExecutionTypeSelection] = useState("Combined");
    const [tempTslMode, setTempTslMode] = useState("TSL %");
    const [tempTslSelection, setTempTslSelection] = useState("TSL pt");
    const [tempTslTrailBy, setTempTslTrailBy] = useState("");

    const handleAddLeg = (e: React.MouseEvent) => {
        e.preventDefault();
        setLegs([
            ...legs,
            {
                id: uuidv4(),
                isBuy: true,
                isWeekly: true,
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
            },
        ]);
    };

    const handleDeleteLeg = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (legs.length > 1) {
            setLegs(legs.filter((leg) => leg.id !== id));
        }
    };

    const handleCopyLeg = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const legToCopy = legs.find((leg) => leg.id === id);
        if (legToCopy) {
            setLegs([...legs, { ...legToCopy, id: uuidv4() }]);
        }
    };

    const updateLeg = (id: string, updates: Partial<OrderLeg>) => {
        setLegs(legs.map((leg) => (leg.id === id ? { ...leg, ...updates } : leg)));
    };

    const handleSaveAll = (e: React.MouseEvent) => {
        e.preventDefault();
        const payload = {
            advanceFeatures: {
                moveSLToCost,
                exitAllOnSLTgt,
                prePunchSL,
                premiumDifference: { enabled: premiumDifference },
                waitAndTrade: { enabled: waitAndTrade },
                reEntryExecute: { enabled: reEntryExecute },
                trailSL: { enabled: trailSL },
            },
            legs: legs.map((leg) => ({
                id: leg.id,
                isBuy: leg.isBuy,
                isWeekly: leg.isWeekly,
                firstSelection: leg.firstSelection,
                secondSelection: leg.secondSelection,
                tpSelection: leg.tpSelection,
                slSelection: leg.slSelection,
                onSelection: leg.onSelection,
                onSelectionSec: leg.onSelectionSec,
                advanceFeatures: {
                    premiumDifference: { value: leg.premiumDiffValue },
                    waitAndTrade: {
                        value: leg.waitAndTradeValue,
                        unit: leg.waitAndTradeUnit,
                    },
                    reEntryExecute: {
                        mode: leg.reEntryMode,
                        value: leg.reEntryValue,
                        executionType: leg.executionType,
                        executionTypeSelection: leg.executionTypeSelection,
                    },
                    trailSL: {
                        mode: leg.tslMode,
                        values: [leg.tslSelection, leg.tslTrailBy],
                    },
                },
            })),
        };
        console.log("🚀 Saved Values:", payload);
    };

    // Handle checkbox changes and dialog behavior
    const handleCheckboxChange = (
        feature: string,
        checked: boolean,
        setFeature: (value: boolean) => void,
        dialogOpenSetter?: (value: boolean) => void,
        tempValue?: number | "",
        tempSetter?: (value: number | "") => void,
        additionalTempSetters?: { setter: (value: any) => void; value: any }[]
    ) => {
        if (checked && !eval(feature)) {
            // When checking an inactive feature, enable it and open dialog if applicable
            setFeature(true);
            if (dialogOpenSetter) {
                dialogOpenSetter(true);
            }
            if (tempSetter && tempValue !== undefined) {
                tempSetter(tempValue || "");
            }
            additionalTempSetters?.forEach(({ setter, value }) => setter(value));
        } else if (!checked && eval(feature)) {
            // When unchecking, disable feature without opening dialog
            setFeature(false);
            if (tempSetter) {
                tempSetter("");
                updateLeg(legs[0].id, { premiumDiffValue: "", reEntryValue: "", executionTypeSelection: "Combined" });
            }
        }
    };

    return (
        <Card>
            <OrderLegHeader selectedTemplate={selectedTemplate} />
            <CardContent className="space-y-4">
                {legs.map((leg) => (
                    <OrderLegControls
                        key={leg.id}
                        isBuy={leg.isBuy}
                        setIsBuy={(value) => updateLeg(leg.id, { isBuy: value })}
                        isWeekly={leg.isWeekly}
                        setIsWeekly={(value) => updateLeg(leg.id, { isWeekly: value })}
                        firstSelection={leg.firstSelection}
                        setFirstSelection={(value) => updateLeg(leg.id, { firstSelection: value })}
                        secondSelection={leg.secondSelection}
                        setSecondSelection={(value) => updateLeg(leg.id, { secondSelection: value })}
                        tpSelection={leg.tpSelection}
                        setTpSelection={(value) => updateLeg(leg.id, { tpSelection: value })}
                        slSelection={leg.slSelection}
                        setSlSelection={(value) => updateLeg(leg.id, { slSelection: value })}
                        onSelection={leg.onSelection}
                        setOnSelection={(value) => updateLeg(leg.id, { onSelection: value })}
                        onSelectionSec={leg.onSelectionSec}
                        setOnSelectionSec={(value) => updateLeg(leg.id, { onSelectionSec: value })}
                        firstOptions={firstOptions}
                        secondOptions={secondOptions}
                        tpOptions={tpOptions}
                        slOptions={slOptions}
                        priceOptions={priceOptions}
                        onDelete={(e) => handleDeleteLeg(e, leg.id)}
                        onCopy={(e) => handleCopyLeg(e, leg.id)}
                        moveSLToCost={moveSLToCost}
                        exitAllOnSLTgt={exitAllOnSLTgt}
                        prePunchSL={prePunchSL}
                        premiumDifference={premiumDifference}
                        waitAndTrade={waitAndTrade}
                        reEntryExecute={reEntryExecute}
                        trailSL={trailSL}
                        premiumDiffValue={leg.premiumDiffValue}
                        setPremiumDiffValue={(value) => updateLeg(leg.id, { premiumDiffValue: value })}
                        waitAndTradeValue={leg.waitAndTradeValue}
                        setWaitAndTradeValue={(value) => updateLeg(leg.id, { waitAndTradeValue: value })}
                        waitAndTradeUnit={leg.waitAndTradeUnit}
                        setWaitAndTradeUnit={(value) => updateLeg(leg.id, { waitAndTradeUnit: value })}
                        tslSelection={leg.tslSelection}
                        setTslSelection={(value) => updateLeg(leg.id, { tslSelection: value })}
                        reEntryMode={leg.reEntryMode}
                        setReEntryMode={(value) => updateLeg(leg.id, { reEntryMode: value })}
                        reEntryValue={leg.reEntryValue}
                        setReEntryValue={(value) => updateLeg(leg.id, { reEntryValue: value })}
                        executionType={leg.executionType}
                        setExecutionType={(value) => updateLeg(leg.id, { executionType: value })}
                        executionTypeSelection={leg.executionTypeSelection}
                        setExecutionTypeSelection={(value) => updateLeg(leg.id, { executionTypeSelection: value })}
                        tslMode={leg.tslMode}
                        setTslMode={(value) => updateLeg(leg.id, { tslMode: value })}
                        waitAndTradeTimeOptions={waitAndTradeTimeOptions}
                        reEntryExecuteOptions={reEntryExecuteOptions}
                        executionOptions={executionOptions}
                        trailSlOptions={trailSlOptions}
                        tslOptions={tslOptions}
                        handleSaveAll={handleSaveAll}
                        tslTrailBy={leg.tslTrailBy}
                        setTslTrailBy={(value) => updateLeg(leg.id, { tslTrailBy: value })}
                    />
                ))}
                <Button variant="default" onClick={handleAddLeg} className="flex items-center ms-auto">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Leg</span>
                </Button>

                <div className="flex items-center w-full space-x-2">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex">
                                    <div className="me-2">Advance Features</div>
                                    <Tooltip>
                                        <TooltipContent>
                                            <p>Click to configure advanced trading options</p>
                                        </TooltipContent>
                                        <TooltipTrigger>
                                            <CircleAlert size={14} />
                                        </TooltipTrigger>
                                    </Tooltip>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-row flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="moveSLToCost"
                                            checked={moveSLToCost}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setMoveSLToCost(isChecked);
                                                if (isChecked) {
                                                    setPrePunchSL(false);
                                                    setWaitAndTrade(false);
                                                    setPremiumDifference(false);
                                                    setReEntryExecute(false);
                                                    setTrailSL(false);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="moveSLToCost">Move SL to Cost</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="exitAllOnSLTgt"
                                            checked={exitAllOnSLTgt}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setExitAllOnSLTgt(isChecked);
                                                if (isChecked) {
                                                    setReEntryExecute(false);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="exitAllOnSLTgt">Exit All on SL/Tgt</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="prePunchSL"
                                            checked={prePunchSL}
                                            onCheckedChange={(checked) => setPrePunchSL(!!checked)}
                                            disabled={moveSLToCost}
                                        />
                                        <Label htmlFor="prePunchSL" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
                                            Pre Punch SL
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="waitAndTrade"
                                            checked={waitAndTrade}
                                            onCheckedChange={(checked) => setWaitAndTrade(!!checked)}
                                            disabled={moveSLToCost}
                                        />
                                        <Label htmlFor="waitAndTrade" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
                                            Wait & Trade
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="premiumDifference"
                                            checked={premiumDifference}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    "premiumDifference",
                                                    !!checked,
                                                    setPremiumDifference,
                                                    setIsPremiumDialogOpen,
                                                    legs[0].premiumDiffValue,
                                                    setTempPremiumDiffValue
                                                )
                                            }
                                            disabled={moveSLToCost}
                                        />
                                        <Label htmlFor="premiumDifference" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
                                            Premium Difference
                                        </Label>
                                        <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Premium Difference</DialogTitle>
                                                    <DialogDescription>
                                                        <Alert>
                                                            <AlertCircleIcon color="skyblue" />
                                                            <AlertTitle className="text-sky-300">About Premium Difference</AlertTitle>
                                                            <AlertDescription className="text-sky-300">
                                                                Order will be traded when premium difference reaches the selected value.
                                                            </AlertDescription>
                                                        </Alert>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4">
                                                    <Label htmlFor="premiumDiffInput">Trade when premium difference {"<="}</Label>
                                                    <Input
                                                        id="premiumDiffInput"
                                                        type="number"
                                                        placeholder="Enter premium difference..."
                                                        value={tempPremiumDiffValue}
                                                        onChange={(e) => setTempPremiumDiffValue(Number(e.target.value) || "")}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={() => {
                                                                updateLeg(legs[0].id, { premiumDiffValue: tempPremiumDiffValue });
                                                                console.log("✅ Premium Difference Saved");
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="reEntryExecute"
                                            checked={reEntryExecute}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    "reEntryExecute",
                                                    !!checked,
                                                    setReEntryExecute,
                                                    setIsReEntryDialogOpen,
                                                    legs[0].reEntryValue,
                                                    setTempReEntryValue,
                                                    [
                                                        { setter: setTempExecutionType, value: legs[0].executionType },
                                                        { setter: setTempExecutionTypeSelection, value: legs[0].executionTypeSelection },
                                                    ]
                                                )
                                            }
                                            disabled={moveSLToCost || exitAllOnSLTgt}
                                        />
                                        <Label
                                            htmlFor="reEntryExecute"
                                            className={moveSLToCost || exitAllOnSLTgt ? "opacity-50 cursor-not-allowed" : ""}
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
                                                                Combined executes all strategy components as a single order. Legwise executes each component separately.
                                                            </AlertDescription>
                                                        </Alert>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ToggleGroup
                                                    type="single"
                                                    variant="outline"
                                                    size="lg"
                                                    value={tempExecutionTypeSelection}
                                                    onValueChange={(val) => val && setTempExecutionTypeSelection(val)}
                                                >
                                                    {executionTypeOptions.map((option) => (
                                                        <ToggleGroupItem key={option} value={option} className="text-xs">
                                                            {option}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                                <div className="mt-4">
                                                    <Label className="mb-2">Re-Entry/Execute Cycles</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder={tempExecutionTypeSelection === "Legwise" ? "Not Applicable" : "Enter cycles..."}
                                                        value={tempReEntryValue}
                                                        onChange={(e) => setTempReEntryValue(Number(e.target.value) || "")}
                                                        disabled={tempExecutionTypeSelection === "Legwise"}
                                                    />
                                                    {tempExecutionTypeSelection === "Legwise" && (
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            In case of leg wise cycles has to be selected on individual legs. Save this popup to add leg wise cycles
                                                        </p>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={() => {
                                                                updateLeg(legs[0].id, {
                                                                    reEntryValue: tempExecutionTypeSelection === "Legwise" ? "" : tempReEntryValue,
                                                                    executionTypeSelection: tempExecutionTypeSelection,
                                                                });
                                                                console.log("✅ Re-Entry / Execute Saved");
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="trailSL"
                                            checked={trailSL}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    "trailSL",
                                                    !!checked,
                                                    setTrailSL,
                                                    setIsTrailSLDialogOpen,
                                                    undefined,
                                                    undefined,
                                                    [
                                                        { setter: setTempTslMode, value: legs[0].tslMode },
                                                        { setter: setTempTslSelection, value: legs[0].tslSelection },
                                                        { setter: setTempTslTrailBy, value: legs[0].tslTrailBy },
                                                    ]
                                                )
                                            }
                                            disabled={moveSLToCost}
                                        />
                                        <Label htmlFor="trailSL" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
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
                                                                A trailing stop-loss adjusts dynamically as market prices move to protect profits.
                                                            </AlertDescription>
                                                        </Alert>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ToggleGroup
                                                    type="single"
                                                    variant="outline"
                                                    size="lg"
                                                    value={tempTslMode}
                                                    onValueChange={(val) => val && setTempTslMode(val)}
                                                >
                                                    {trailSlOptions.map((option) => (
                                                        <ToggleGroupItem key={option} value={option} className="text-xs">
                                                            {option}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                                <div className="grid gap-4 mt-4">
                                                    <Label>If price moves (X)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="If price moves (X)"
                                                        value={tempTslSelection}
                                                        onChange={(e) => setTempTslSelection(e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-4 mt-4">
                                                    <Label>Then Trail SL by (Y)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Then Trail SL by (Y)"
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
                                                                updateLeg(legs[0].id, {
                                                                    tslMode: tempTslMode,
                                                                    tslSelection: tempTslSelection,
                                                                    tslTrailBy: tempTslTrailBy,
                                                                });
                                                                console.log("✅ Trail SL Saved");
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
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderLegs;