import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CircleAlert, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdvanceFeaturesProps {
    moveSLToCost: boolean;
    setMoveSLToCost: (value: boolean) => void;
    exitAllOnSLTgt: boolean;
    setExitAllOnSLTgt: (value: boolean) => void;
    prePunchSL: boolean;
    setPrePunchSL: (value: boolean) => void;
    premiumDifference: boolean;
    setPremiumDifference: (value: boolean) => void;
    waitAndTrade: boolean;
    setWaitAndTrade: (value: boolean) => void;
    reEntryExecute: boolean;
    setReEntryExecute: (value: boolean) => void;
    trailSL: boolean;
    setTrailSL: (value: boolean) => void;
    premiumDiffValue: number | "";
    setPremiumDiffValue: (value: number | "") => void;
    waitAndTradeValue: number | "";
    setWaitAndTradeValue: (value: number | "") => void;
    reEntryMode: string;
    setReEntryMode: (value: string) => void;
    reEntryValue: number | "";
    setReEntryValue: (value: number | "") => void;
    executionType: string;
    setExecutionType: (value: string) => void;
    tslMode: string;
    setTslMode: (value: string) => void;
    tslValue1: number | "";
    setTslValue1: (value: number | "") => void;
    tslValue2: number | "";
    setTslValue2: (value: number | "") => void;
    waitAndTradeTimeOptions: string[];
    reEntryExecuteOptions: string[];
    executionOptions: string[];
    trailSlOptions: string[];
    tslOptions: string[];
    handleSaveAll: () => void;
}

export const AdvanceFeatures: React.FC<AdvanceFeaturesProps> = ({
    moveSLToCost,
    setMoveSLToCost,
    exitAllOnSLTgt,
    setExitAllOnSLTgt,
    prePunchSL,
    setPrePunchSL,
    premiumDifference,
    setPremiumDifference,
    waitAndTrade,
    setWaitAndTrade,
    reEntryExecute,
    setReEntryExecute,
    trailSL,
    setTrailSL,
    premiumDiffValue,
    setPremiumDiffValue,
    reEntryValue,
    setReEntryValue,
    executionType,
    setExecutionType,
    tslMode,
    setTslMode,
    tslValue1,
    setTslValue1,
    tslValue2,
    setTslValue2,
    executionOptions,
    trailSlOptions,
}) => {
    const handleSavePremium = () => {
        console.log("✅ Premium Difference Saved:", premiumDiffValue);
    };

    const handleSaveReEntry = () => {
        console.log("✅ Re-Entry / Execute Saved:", { executionType, reEntryValue });
    };

    const handleSaveTrail = () => {
        console.log("✅ Trail SL Saved:", { tslValue1, tslValue2 });
    };

    return (
        <div className="flex items-center w-full space-x-2">
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <div className="flex">
                            <div className="me-2">Advance Feature</div>
                            <Tooltip>
                                <TooltipContent>
                                    <p>Click to know how to use advance features</p>
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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Checkbox
                                            id="premiumDifference"
                                            checked={premiumDifference}
                                            onCheckedChange={(checked) => setPremiumDifference(!!checked)}
                                            disabled={moveSLToCost}
                                        />
                                    </DialogTrigger>
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
                                                value={premiumDiffValue}
                                                onChange={(e) => setPremiumDiffValue(Number(e.target.value) || "")}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={handleSavePremium}>Save</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Label htmlFor="premiumDifference" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
                                    Premium Difference
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Checkbox
                                            id="reEntryExecute"
                                            checked={reEntryExecute}
                                            onCheckedChange={(checked) => setReEntryExecute(!!checked)}
                                            disabled={moveSLToCost || exitAllOnSLTgt}
                                        />
                                    </DialogTrigger>
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
                                            value={executionType}
                                            onValueChange={(val) => val && setExecutionType(val)}
                                        >
                                            {executionOptions.map((option) => (
                                                <ToggleGroupItem key={option} value={option.toLowerCase()} className="text-xs">
                                                    {option}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                        <div className="mt-4">
                                            <Label>Re-Entry/Execute Cycles</Label>
                                            <Input
                                                type="number"
                                                placeholder={executionType === "legwise" ? "Not Applicable" : "Enter cycles..."}
                                                disabled={executionType === "legwise"}
                                                value={reEntryValue}
                                                onChange={(e) => setReEntryValue(Number(e.target.value) || "")}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={handleSaveReEntry}>Save</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Label
                                    htmlFor="reEntryExecute"
                                    className={moveSLToCost || exitAllOnSLTgt ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Re Entry / Execute
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Checkbox
                                            id="trailSL"
                                            checked={trailSL}
                                            onCheckedChange={(checked) => setTrailSL(!!checked)}
                                            disabled={moveSLToCost}
                                        />
                                    </DialogTrigger>
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
                                            value={tslMode}
                                            onValueChange={(val) => val && setTslMode(val)}
                                        >
                                            {trailSlOptions.map((option) => (
                                                <ToggleGroupItem key={option} value={option.toLowerCase()} className="text-xs">
                                                    {option}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                        <div className="grid gap-4 mt-4">
                                            <Label>If price moves (X)</Label>
                                            <Input
                                                type="number"
                                                placeholder="If price moves (X)"
                                                value={tslValue1}
                                                onChange={(e) => setTslValue1(Number(e.target.value) || "")}
                                            />
                                            <Label>Then Trail SL by (Y)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Then Trail SL by (Y)"
                                                value={tslValue2}
                                                onChange={(e) => setTslValue2(Number(e.target.value) || "")}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={handleSaveTrail}>Save</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Label htmlFor="trailSL" className={moveSLToCost ? "opacity-50 cursor-not-allowed" : ""}>
                                    Trail SL
                                </Label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};