// components/backtestingcomponents/PeriodSelector.tsx
import * as React from "react";
import { Calendar } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type PeriodValue = "all" | "1m" | "3m" | "6m" | "1y" | "2y" | "custom";

type Props = {
    selectedPeriod: PeriodValue;
    onChange: (value: PeriodValue) => void;
};

const periods = [
    { label: "1M", value: "1m" as const },
    { label: "3M", value: "3m" as const },
    { label: "6M", value: "6m" as const },
    { label: "1Y", value: "1y" as const },
    { label: "2Y", value: "2y" as const },
    { label: <Calendar className="h-4 w-4" />, value: "custom" as const },
] as const;

export const PeriodSelector: React.FC<Props> = ({ selectedPeriod, onChange }) => {
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Backtesting Results</h1>
                <ToggleGroup
                    type="single"
                    value={selectedPeriod}
                    onValueChange={(v) => v && onChange(v as PeriodValue)}
                    className="bg-muted/50 rounded-lg p-1"
                >
                    {periods.map(({ label, value }) => (
                        <ToggleGroupItem
                            key={value}
                            value={value}
                            className="text-xs font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm"
                        >
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="px-4 border-2 rounded-lg bg-gray-900/50 mt-5">
                <Accordion type="single" collapsible >
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm">Important Information</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Results are hypothetical and based on historical mock data (2022–2024).</li>
                                <li>Not real trading results. For demonstration only.</li>
                                <li>Export your backtest — data is not saved.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};