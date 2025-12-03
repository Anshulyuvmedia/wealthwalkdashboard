// components/backtestingcomponents/PeriodSelector.tsx
import * as React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type PeriodValue = "all" | "1m" | "3m" | "6m" | "1y" | "2y" | "custom";

type Props = {
    selectedPeriod: PeriodValue;
    onChange: (value: PeriodValue) => void;
    customStartDate?: Date;
    customEndDate?: Date;
    onCustomDateChange: (start: Date | undefined, end: Date | undefined) => void;
};

const periods = [
    { label: "1M", value: "1m" as const },
    { label: "3M", value: "3m" as const },
    { label: "6M", value: "6m" as const },
    { label: "1Y", value: "1y" as const },
    { label: "2Y", value: "2y" as const },
] as const;

export const PeriodSelector: React.FC<Props> = ({
    selectedPeriod,
    onChange,
    customStartDate,
    customEndDate,
    onCustomDateChange,
}) => {
    const [isCustomOpen, setIsCustomOpen] = React.useState(false);

    const handlePeriodChange = (value: PeriodValue) => {
        if (value !== "custom") {
            onChange(value);
            setIsCustomOpen(false);
        }
    };

    const formatDateRange = () => {
        if (!customStartDate || !customEndDate) return "Select Date Range";
        return `${format(customStartDate, "dd MMM yyyy")} - ${format(customEndDate, "dd MMM yyyy")}`;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Backtesting Results</h1>

                <div className="flex items-center gap-3">
                    <ToggleGroup
                        type="single"
                        value={selectedPeriod === "custom" ? "custom" : selectedPeriod}
                        onValueChange={(v) => v && handlePeriodChange(v as PeriodValue)}
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

                        {/* Custom Date Toggle */}
                        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                            <PopoverTrigger asChild>
                                <ToggleGroupItem
                                    value="custom"
                                    className="text-xs font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm flex items-center gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsCustomOpen(true);
                                        onChange("custom");
                                    }}
                                >
                                    <Calendar className="h-4 w-4" />
                                    
                                </ToggleGroupItem>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-4 bg-zinc-900 border-zinc-800" align="end">
                                <div className="flex flex-col gap-4">
                                    <div className="text-sm font-medium text-white">Select Date Range</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Start Date */}
                                        <div>
                                            <p className="text-xs text-zinc-400 mb-2">Start Date</p>
                                            <CalendarComponent
                                                mode="single"
                                                selected={customStartDate}
                                                onSelect={(date) => {
                                                    onCustomDateChange(date || undefined, customEndDate);
                                                    if (date && customEndDate && date > customEndDate) {
                                                        onCustomDateChange(date, date);
                                                    }
                                                }}
                                                disabled={(date) => date > new Date() || (customEndDate ? date > customEndDate : false)}
                                                className="rounded-md border border-zinc-700 bg-zinc-800"
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div>
                                            <p className="text-xs text-zinc-400 mb-2">End Date</p>
                                            <CalendarComponent
                                                mode="single"
                                                selected={customEndDate}
                                                onSelect={(date) => {
                                                    onCustomDateChange(customStartDate, date || undefined);
                                                    if (date && customStartDate && date < customStartDate) {
                                                        onCustomDateChange(date, date);
                                                    }
                                                }}
                                                disabled={(date) => date > new Date() || (customStartDate ? date < customStartDate : false)}
                                                className="rounded-md border border-zinc-700 bg-zinc-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-xs text-zinc-400">
                                            {formatDateRange()}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsCustomOpen(false)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </ToggleGroup>
                </div>
            </div>

            {/* Info Box */}
            <div className="px-4 py-3 border-2 border-zinc-800/50 rounded-lg bg-zinc-900/50 mt-6 backdrop-blur-sm">
                <Accordion type="single" collapsible >
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-sm text-zinc-300 hover:text-white py-2">
                            Important Information
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-zinc-400 space-y-2 pb-2">
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