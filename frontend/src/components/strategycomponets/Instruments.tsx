import React, { useState, useMemo } from "react";
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
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dummyInstruments = [
    { id: 1, name: "BANKNIFTY 45000 CE", type: "options", price: 0.0, exchange: "NSE", lotSize: 25 },
    { id: 2, name: "NIFTY 22500 PE", type: "options", price: 0.0, exchange: "NSE", lotSize: 50 },
    { id: 3, name: "RELIANCE 3000 CE", type: "options", price: 0.0, exchange: "NSE", lotSize: 25 },
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

const Instruments: React.FC = () => {
    const [marketType, setMarketType] = useState("options");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInstruments, setSelectedInstruments] = useState<
        { id: number; type: string; name: string; price: number; exchange: string; qty: number; lot?: number }[]
    >([]);
    const [open, setOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false); // ✅ New alert dialog state

    const filteredInstruments = useMemo(() => {
        return dummyInstruments.filter(
            (item) =>
                item.type === marketType &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [marketType, searchTerm]);

    const handleSelectInstrument = (instrument: any) => {
        // Prevent selecting options if another type is selected
        if (instrument.type === "options" && selectedInstruments.length > 0) {
            toast.error("You can’t add Options when other instruments are already selected.");
            return;
        }

        // Prevent adding other types when options already selected
        if (
            selectedInstruments.some((item) => item.type === "options") &&
            instrument.type !== "options"
        ) {
            toast.error("You can’t mix Options with other instrument types.");
            return;
        }

        if (!selectedInstruments.find((i) => i.id === instrument.id)) {
            setSelectedInstruments([
                ...selectedInstruments,
                instrument.type === "options"
                    ? { ...instrument, lot: 25 } // fixed lot size for options
                    : { ...instrument, qty: 1 },
            ]);
        }

        setOpen(false);
        toast.success(`${instrument.name} added successfully.`);
    };


    const handleRemoveInstrument = (id: number) => {
        setSelectedInstruments(selectedInstruments.filter((item) => item.id !== id));
    };

    const handleQtyChange = (id: number, qty: number) => {
        setSelectedInstruments((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, qty: qty < 1 ? 1 : qty } : item
            )
        );
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Select Instruments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {selectedInstruments.map((instrument) => (
                            <div
                                key={instrument.id}
                                className="w-52 rounded-xl p-4 shadow-lg relative border text-white"
                            >
                                <button
                                    onClick={() => handleRemoveInstrument(instrument.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                >
                                    <X size={16} />
                                </button>
                                <div className="font-medium text-sm">{instrument.name}</div>
                                <div className="flex space-x-2 items-center">
                                    <div className="text-xs text-gray-400">
                                        {instrument.exchange}:
                                    </div>
                                    <div className="text-green-400 text-xs">
                                        {instrument.price.toFixed(2)} (0.00%)
                                    </div>
                                </div>

                                {/* ✅ Show fixed lot size for options */}
                                {instrument.type === "options" ? (
                                    <div className="mt-2 text-xs text-gray-300">
                                        Lot Size: <span className="font-bold">{instrument.lot}</span>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex items-center">
                                        <Label htmlFor={`qty-${instrument.id}`} className="text-xs me-2 text-gray-300">
                                            Qty
                                        </Label>
                                        <Input
                                            id={`qty-${instrument.id}`}
                                            type="number"
                                            min="1"
                                            value={instrument.qty}
                                            onChange={(e) =>
                                                handleQtyChange(instrument.id, parseInt(e.target.value))
                                            }
                                            className="h-8 text-xs w-16 text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ✅ Hide Add button if options instrument selected */}
                        {!selectedInstruments.some((i) => i.type === "options") && (
                            <Dialog open={open} onOpenChange={setOpen}>
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
                                                className="flex flex-wrap gap-4"
                                            >
                                                {["options", "equity", "futures", "indices", "cds", "mcx"].map(
                                                    (type) => (
                                                        <div key={type} className="flex items-center gap-2">
                                                            <RadioGroupItem value={type} id={type} />
                                                            <Label htmlFor={type}>{type.toUpperCase()}</Label>
                                                        </div>
                                                    )
                                                )}
                                            </RadioGroup>
                                        </div>

                                        <DialogDescription>
                                            Search scripts: i.e. State Bank Of India, Banknifty, Crudeoil
                                        </DialogDescription>

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

            {/* ✅ Custom Dialog Alert */}
            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cannot Add Instrument</DialogTitle>
                        <DialogDescription>
                            You can either select a single <strong>Options</strong> instrument or multiple from
                            other categories — not both together.
                        </DialogDescription>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setAlertOpen(false)}>OK</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Instruments;
