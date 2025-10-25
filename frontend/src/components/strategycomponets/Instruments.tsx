import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface InstrumentItem {
    id: number;
    type: string;
    name: string;
    price: number;
    exchange: string;
    lot?: number;
    qty?: number;
}

const dummyInstruments = [
    { id: 1, name: "BANK NIFTY", type: "options", price: 0.0, exchange: "NSE", lotSize: 25 },
    { id: 2, name: "NIFTY 50", type: "options", price: 0.0, exchange: "NSE", lotSize: 50 },
    { id: 3, name: "NIFTY FIN SERVICE", type: "options", price: 0.0, exchange: "NSE", lotSize: 25 },
    { id: 19, name: "SENSEX", type: "options", price: 0.0, exchange: "NSE", lotSize: 25 },
    { id: 4, name: "Tata Motors", type: "equity", price: 0.0, exchange: "NSE" },
    { id: 5, name: "Infosys", type: "equity", price: 0.0, exchange: "NSE" },
    { id: 6, name: "HDFC Bank", type: "equity", price: 0.0, exchange: "NSE" },
    { id: 7, name: "NIFTY NOV FUT", type: "futures", price: 0.0, exchange: "NSE" },
    { id: 8, name: "BANKNIFTY OCT FUT", type: "futures", price: 0.0, exchange: "NSE" },
    { id: 9, name: "RELIANCE NOV FUT", type: "futures", price: 0.0, exchange: "NSE" },
    { id: 10, name: "NIFTY 50", type: "indices", price: 0.0, exchange: "NSE" },
    { id: 11, name: "BANKNIFTY", type: "indices", price: 0.0, exchange: "NSE" },
    { id: 12, name: "FINNIFTY", type: "indices", price: 0.0, exchange: "NSE" },
    { id: 13, name: "USDINR", type: "cds", price: 0.0, exchange: "NSE" },
    { id: 14, name: "EURINR", type: "cds", price: 0.0, exchange: "NSE" },
    { id: 15, name: "GBPINR", type: "cds", price: 0.0, exchange: "NSE" },
    { id: 16, name: "CRUDEOIL", type: "mcx", price: 0.0, exchange: "MCX" },
    { id: 17, name: "GOLD", type: "mcx", price: 0.0, exchange: "MCX" },
    { id: 18, name: "SILVER", type: "mcx", price: 0.0, exchange: "MCX" },
];

/* ──────────────────────────────────────────────────────────────────────── */
interface InstrumentsProps {
    strategyType: "timebased" | "indicatorbased";
    /** Called **every time** the selection changes */
    onInstrumentsChange: (instruments: InstrumentItem[]) => void;
    initialInstruments?: InstrumentItem[]; // Pre-populated data from API
}

/* ──────────────────────────────────────────────────────────────────────── */
const Instruments: React.FC<InstrumentsProps> = ({
    strategyType,
    onInstrumentsChange,
    initialInstruments = [],
}) => {
    const [marketType, setMarketType] = useState("options");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInstruments, setSelectedInstruments] = useState<InstrumentItem[]>([]);

    // Initialize with API data or empty array only if different
    useEffect(() => {
        if (JSON.stringify(selectedInstruments) !== JSON.stringify(initialInstruments)) {
            setSelectedInstruments(initialInstruments);
        }
    }, [initialInstruments]);

    // Force “options” when time-based
    useEffect(() => {
        if (strategyType === "timebased") setMarketType("options");
    }, [strategyType]);

    const filteredInstruments = useMemo(() => {
        return dummyInstruments.filter(
            (item) =>
                item.type === marketType &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [marketType, searchTerm]);

    const handleSelectInstrument = useCallback((instrument: typeof dummyInstruments[0]) => {
        // Validation rules
        if (instrument.type === "options" && selectedInstruments.length > 0) {
            toast.error("You can’t add Options when other instruments are already selected.");
            return;
        }
        if (
            selectedInstruments.some((i) => i.type === "options") &&
            instrument.type !== "options"
        ) {
            toast.error("You can’t mix Options with other instrument types.");
            return;
        }

        if (!selectedInstruments.find((i) => i.id === instrument.id)) {
            const newItem: InstrumentItem = {
                id: instrument.id,
                type: instrument.type,
                name: instrument.name,
                price: instrument.price,
                exchange: instrument.exchange,
                ...(instrument.type === "options"
                    ? { lot: instrument.lotSize ?? 25 }
                    : { qty: 1 }),
            };
            const updatedInstruments = [...selectedInstruments, newItem];
            setSelectedInstruments(updatedInstruments);
            onInstrumentsChange(updatedInstruments); // Sync with parent
        }
    }, [selectedInstruments, onInstrumentsChange]);

    const handleRemoveInstrument = useCallback((id: number) => {
        const updatedInstruments = selectedInstruments.filter((i) => i.id !== id);
        setSelectedInstruments(updatedInstruments);
        onInstrumentsChange(updatedInstruments); // Sync with parent
    }, [selectedInstruments, onInstrumentsChange]);

    const handleQtyChange = useCallback((id: number, qty: number) => {
        const updatedInstruments = selectedInstruments.map((i) =>
            i.id === id ? { ...i, qty: qty < 1 ? 1 : qty } : i
        );
        setSelectedInstruments(updatedInstruments);
        onInstrumentsChange(updatedInstruments); // Sync with parent
    }, [selectedInstruments, onInstrumentsChange]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Select Instruments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {selectedInstruments.map((inst) => (
                        <div
                            key={inst.id}
                            className="w-52 rounded-xl p-4 shadow-lg relative border text-white"
                        >
                            <button
                                onClick={() => handleRemoveInstrument(inst.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>

                            <div className="font-medium text-sm">{inst.name}</div>
                            <div className="flex space-x-2 items-center">
                                <div className="text-xs text-gray-400">{inst.exchange}:</div>
                                <div className="text-green-400 text-xs">
                                    {inst.price.toFixed(2)} (0.00%)
                                </div>
                            </div>

                            {inst.type === "options" ? (
                                <div className="mt-2 text-xs text-gray-300">
                                    Lot Size: <span className="font-bold">{inst.lot}</span>
                                </div>
                            ) : (
                                <div className="mt-2 flex items-center">
                                    <Label
                                        htmlFor={`qty-${inst.id}`}
                                        className="text-xs me-2 text-gray-300"
                                    >
                                        Qty
                                    </Label>
                                    <Input
                                        id={`qty-${inst.id}`}
                                        type="number"
                                        min="1"
                                        value={inst.qty ?? 1}
                                        onChange={(e) =>
                                            handleQtyChange(inst.id, parseInt(e.target.value) || 1)
                                        }
                                        className="h-8 text-xs w-16 text-white"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add-button is hidden when an option is already selected */}
                    {!selectedInstruments.some((i) => i.type === "options") && (
                        <Dialog open={false} onOpenChange={(open) => setOpen(open)}>
                            <DialogTrigger asChild>
                                <div className="w-44 hover:bg-gray-800 hover:text-white hover:shadow-sm p-3 rounded-lg border-2 border-dashed flex flex-col justify-center items-center shadow-md cursor-pointer transition-all">
                                    <PlusCircle className="mb-2 h-8 w-8" />
                                    <div>Add Instruments</div>
                                </div>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Instruments</DialogTitle>

                                    <div className="py-3">
                                        <RadioGroup
                                            value={marketType}
                                            onValueChange={setMarketType}
                                            className="flex flex-wrap gap-3"
                                        >
                                            {["Options", "Equity", "Futures", "Indices", "CDS", "MCX"].map(
                                                (type) => (
                                                    <div key={type} className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value={type.toLowerCase()}
                                                            id={type}
                                                            disabled={
                                                                strategyType === "timebased" && type !== "Options"
                                                            }
                                                        />
                                                        <Label htmlFor={type}>{type}</Label>
                                                    </div>
                                                )
                                            )}
                                        </RadioGroup>
                                    </div>

                                    {strategyType === "timebased" ? (
                                        <DialogDescription>
                                            * Only option category allowed for Time-Based strategy type
                                        </DialogDescription>
                                    ) : (
                                        <DialogDescription>
                                            Search scripts: i.e. State Bank Of India, Banknifty, Crudeoil
                                        </DialogDescription>
                                    )}

                                    <div className="my-3">
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Search instruments..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <InputGroupAddon>
                                                <Search />
                                            </InputGroupAddon>
                                            <InputGroupAddon align="inline-end">
                                                {filteredInstruments.length} results
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto mt-3 space-y-2">
                                        {filteredInstruments.length > 0 ? (
                                            filteredInstruments.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="border p-2 rounded-md hover:bg-gray-800 hover:text-white cursor-pointer transition"
                                                    onClick={() => handleSelectInstrument(item)}
                                                >
                                                    {item.name}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No instruments found.
                                            </p>
                                        )}
                                    </div>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Instruments;