/* ──────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────── */
interface InstrumentItem {
    id: number;
    type: string;
    name: string;
    price: number;
    exchange: string;
    lot?: number;
    qty?: number;
}

/* ────── DUMMY DATA & GENERATORS (Move to top or separate file later) ────── */
const dummyOptions: InstrumentItem[] = [
    { id: 1001, name: "NIFTY 50", type: "options", price: 2987.45, exchange: "NSE", lot: 1 },
    { id: 1002, name: "NIFTY BANK", type: "options", price: 4192.30, exchange: "NSE", lot: 1 },
    { id: 1003, name: "NIFTY FIN SERVICE", type: "options", price: 1624.80, exchange: "NSE", lot: 1 },
    { id: 1004, name: "SENSEX", type: "options", price: 1876.55, exchange: "NSE", lot: 1 },
];

const dummyEquities: InstrumentItem[] = [
    { id: 1001, name: "0IHFL26-YR", type: "equity", price: 2987.45, exchange: "NSE", lot: 1 },
    { id: 1002, name: "0IHFL27-YW", type: "equity", price: 4192.30, exchange: "NSE", lot: 1 },
    { id: 1003, name: "0MOFSL26-N1", type: "equity", price: 1624.80, exchange: "NSE", lot: 1 },
    { id: 1004, name: "0MOFSL27-N3", type: "equity", price: 1876.55, exchange: "NSE", lot: 1 },
    { id: 1005, name: "1003ICCL28-NX", type: "equity", price: 982.40, exchange: "NSE", lot: 1 },
    { id: 1006, name: "1003IHF30A-NV", type: "equity", price: 812.70, exchange: "NSE", lot: 1 },
    { id: 1007, name: "1008HDFC29-NV", type: "equity", price: 1045.60, exchange: "NSE", lot: 1 },
    { id: 1008, name: "1012SJF26-N5", type: "equity", price: 1123.15, exchange: "NSE", lot: 1 },
    { id: 1009, name: "1025IIFL28-N2", type: "equity", price: 998.75, exchange: "NSE", lot: 1 },
    { id: 1010, name: "1035BAF29-NF", type: "equity", price: 1078.90, exchange: "NSE", lot: 1 },
    { id: 1011, name: "1050LTFH27-N3", type: "equity", price: 1205.40, exchange: "NSE", lot: 1 },
    { id: 1012, name: "1075RECL28-NX", type: "equity", price: 1012.30, exchange: "NSE", lot: 1 },
    { id: 1013, name: "1080PFC30-NV", type: "equity", price: 1098.55, exchange: "NSE", lot: 1 },
    { id: 1014, name: "1095NABARD29", type: "equity", price: 1034.20, exchange: "NSE", lot: 1 },
    { id: 1015, name: "1102SHTF27-N6", type: "equity", price: 1156.80, exchange: "NSE", lot: 1 },
    { id: 1016, name: "1120HDFC28A", type: "equity", price: 987.65, exchange: "NSE", lot: 1 },
    { id: 1017, name: "1150ICICI27-N2", type: "equity", price: 1199.40, exchange: "NSE", lot: 1 },
    { id: 1018, name: "1175MUTHOOT28", type: "equity", price: 1087.25, exchange: "NSE", lot: 1 },
    { id: 1019, name: "1180IIHFL26-N1", type: "equity", price: 945.10, exchange: "NSE", lot: 1 },
    { id: 1020, name: "1195KOTAK28-NX", type: "equity", price: 1043.75, exchange: "NSE", lot: 1 },
    { id: 1021, name: "1210ADANI29", type: "equity", price: 1128.90, exchange: "NSE", lot: 1 },
    { id: 1022, name: "1225TATACAP27", type: "equity", price: 998.45, exchange: "NSE", lot: 1 },
    { id: 1023, name: "1230SBI30-NV", type: "equity", price: 1076.60, exchange: "NSE", lot: 1 },
    { id: 1024, name: "1245LICHSGF28", type: "equity", price: 1032.15, exchange: "NSE", lot: 1 },
    { id: 1025, name: "1250PNB29-N3", type: "equity", price: 1115.30, exchange: "NSE", lot: 1 },
    { id: 1026, name: "1260CHOLAFIN27", type: "equity", price: 989.80, exchange: "NSE", lot: 1 },
    { id: 1027, name: "1275INDUSTOWER28", type: "equity", price: 1164.50, exchange: "NSE", lot: 1 },
    { id: 1028, name: "1280RELIANCE29", type: "equity", price: 1099.25, exchange: "NSE", lot: 1 },
    { id: 1029, name: "1295JSWSTEEL27", type: "equity", price: 1023.70, exchange: "NSE", lot: 1 },
    { id: 1030, name: "1300HCLTECH28", type: "equity", price: 1188.40, exchange: "NSE", lot: 1 },
    { id: 1031, name: "1310INFY30-NX", type: "equity", price: 1072.95, exchange: "NSE", lot: 1 },
    { id: 1032, name: "1325TCS29-NV", type: "equity", price: 1134.60, exchange: "NSE", lot: 1 },
    { id: 1033, name: "1330WIPRO27", type: "equity", price: 995.15, exchange: "NSE", lot: 1 },
    { id: 1034, name: "1345BHARTI28-N2", type: "equity", price: 1201.80, exchange: "NSE", lot: 1 },
    { id: 1035, name: "1350AXISBANK29", type: "equity", price: 1048.35, exchange: "NSE", lot: 1 },
    { id: 1036, name: "1360KOTAKBANK27", type: "equity", price: 1109.70, exchange: "NSE", lot: 1 },
    { id: 1037, name: "1375ICICIBANK30", type: "equity", price: 1019.45, exchange: "NSE", lot: 1 },
    { id: 1038, name: "1380HDFCBANK28", type: "equity", price: 1177.20, exchange: "NSE", lot: 1 },
    { id: 1039, name: "1395SBIN29-NX", type: "equity", price: 1065.90, exchange: "NSE", lot: 1 },
    { id: 1040, name: "1400BAJFIN28", type: "equity", price: 1142.55, exchange: "NSE", lot: 1 },
    { id: 1041, name: "1410M&MFIN27", type: "equity", price: 993.80, exchange: "NSE", lot: 1 },
    { id: 1042, name: "1425L&TFH29-NV", type: "equity", price: 1198.15, exchange: "NSE", lot: 1 },
    { id: 1043, name: "1430SHRIRAMFIN28", type: "equity", price: 1081.40, exchange: "NSE", lot: 1 },
    { id: 1044, name: "1440MANAPPURAM27", type: "equity", price: 1027.65, exchange: "NSE", lot: 1 },
    { id: 1045, name: "1455MUTHOOTFIN29", type: "equity", price: 1159.30, exchange: "NSE", lot: 1 },
    { id: 1046, name: "1460IIFLFIN26-N3", type: "equity", price: 971.85, exchange: "NSE", lot: 1 },
    { id: 1047, name: "1470ADANIENT28", type: "equity", price: 1124.70, exchange: "NSE", lot: 1 },
    { id: 1048, name: "1480TATAMOTORS27", type: "equity", price: 1008.25, exchange: "NSE", lot: 1 },
    { id: 1049, name: "1490MARUTI29-NX", type: "equity", price: 1183.60, exchange: "NSE", lot: 1 },
    { id: 1050, name: "1500RELIANCE30", type: "equity", price: 1077.95, exchange: "NSE", lot: 1 }
];

const dummyFutures: InstrumentItem[] = [
    { id: 1001, name: "360ONE25DECFUT", type: "futures", price: 2987.45, exchange: "NSE", lot: 500 },
    { id: 1002, name: "360ONE25NOVFUT", type: "futures", price: 2975.30, exchange: "NSE", lot: 500 },
    { id: 1003, name: "360ONE25OCTFUT", type: "futures", price: 2968.80, exchange: "NSE", lot: 500 },
    { id: 1004, name: "ABB25DECFUT", type: "futures", price: 5876.55, exchange: "NSE", lot: 125 },
    { id: 1005, name: "ABB25NOVFUT", type: "futures", price: 5862.40, exchange: "NSE", lot: 125 },
    { id: 1006, name: "ABB25OCTFUT", type: "futures", price: 5849.70, exchange: "NSE", lot: 125 },
    { id: 1007, name: "ADANIENT25DECFUT", type: "futures", price: 3425.20, exchange: "NSE", lot: 250 },
    { id: 1008, name: "ADANIENT25NOVFUT", type: "futures", price: 3418.90, exchange: "NSE", lot: 250 },
    { id: 1009, name: "ADANIPORTS25DECFUT", type: "futures", price: 1428.65, exchange: "NSE", lot: 500 },
    { id: 1010, name: "ADANIPORTS25NOVFUT", type: "futures", price: 1425.10, exchange: "NSE", lot: 500 },
    { id: 1011, name: "APOLLOHOSP25DECFUT", type: "futures", price: 6854.30, exchange: "NSE", lot: 125 },
    { id: 1012, name: "APOLLOHOSP25NOVFUT", type: "futures", price: 6839.80, exchange: "NSE", lot: 125 },
    { id: 1013, name: "AXISBANK25DECFUT", type: "futures", price: 1189.40, exchange: "NSE", lot: 550 },
    { id: 1014, name: "AXISBANK25NOVFUT", type: "futures", price: 1186.75, exchange: "NSE", lot: 550 },
    { id: 1015, name: "BAJFINANCE25DECFUT", type: "futures", price: 7245.90, exchange: "NSE", lot: 125 },
    { id: 1016, name: "BAJFINANCE25NOVFUT", type: "futures", price: 7230.15, exchange: "NSE", lot: 125 },
    { id: 1017, name: "BHARTIARTL25DECFUT", type: "futures", price: 1589.25, exchange: "NSE", lot: 500 },
    { id: 1018, name: "BHARTIARTL25NOVFUT", type: "futures", price: 1585.60, exchange: "NSE", lot: 500 },
    { id: 1019, name: "HCLTECH25DECFUT", type: "futures", price: 1845.70, exchange: "NSE", lot: 350 },
    { id: 1020, name: "HCLTECH25NOVFUT", type: "futures", price: 1841.20, exchange: "NSE", lot: 350 },
    { id: 1021, name: "HDFCBANK25DECFUT", type: "futures", price: 1782.45, exchange: "NSE", lot: 500 },
    { id: 1022, name: "HDFCBANK25NOVFUT", type: "futures", price: 1779.80, exchange: "NSE", lot: 500 },
    { id: 1023, name: "HINDALCO25DECFUT", type: "futures", price: 689.35, exchange: "NSE", lot: 1075 },
    { id: 1024, name: "HINDALCO25NOVFUT", type: "futures", price: 687.90, exchange: "NSE", lot: 1075 },
    { id: 1025, name: "ICICIBANK25DECFUT", type: "futures", price: 1298.60, exchange: "NSE", lot: 700 },
    { id: 1026, name: "ICICIBANK25NOVFUT", type: "futures", price: 1295.45, exchange: "NSE", lot: 700 },
    { id: 1027, name: "INDUSINDBK25DECFUT", type: "futures", price: 1456.80, exchange: "NSE", lot: 500 },
    { id: 1028, name: "INFY25DECFUT", type: "futures", price: 1892.15, exchange: "NSE", lot: 400 },
    { id: 1029, name: "INFY25NOVFUT", type: "futures", price: 1888.70, exchange: "NSE", lot: 400 },
    { id: 1030, name: "ITC25DECFUT", type: "futures", price: 498.90, exchange: "NSE", lot: 1600 },
    { id: 1031, name: "ITC25NOVFUT", type: "futures", price: 498.20, exchange: "NSE", lot: 1600 },
    { id: 1032, name: "KOTAKBANK25DECFUT", type: "futures", price: 1876.55, exchange: "NSE", lot: 400 },
    { id: 1033, name: "LT25DECFUT", type: "futures", price: 3678.40, exchange: "NSE", lot: 300 },
    { id: 1034, name: "LT25NOVFUT", type: "futures", price: 3672.10, exchange: "NSE", lot: 300 },
    { id: 1035, name: "M&M25DECFUT", type: "futures", price: 2987.65, exchange: "NSE", lot: 350 },
    { id: 1036, name: "MARUTI25DECFUT", type: "futures", price: 12456.80, exchange: "NSE", lot: 50 },
    { id: 1037, name: "NESTLEIND25DECFUT", type: "futures", price: 2654.30, exchange: "NSE", lot: 200 },
    { id: 1038, name: "NTPC25DECFUT", type: "futures", price: 412.75, exchange: "NSE", lot: 1500 },
    { id: 1039, name: "RELIANCE25DECFUT", type: "futures", price: 2984.20, exchange: "NSE", lot: 250 },
    { id: 1040, name: "RELIANCE25NOVFUT", type: "futures", price: 2980.55, exchange: "NSE", lot: 250 },
    { id: 1041, name: "SBIN25DECFUT", type: "futures", price: 878.90, exchange: "NSE", lot: 1000 },
    { id: 1042, name: "SBIN25NOVFUT", type: "futures", price: 876.45, exchange: "NSE", lot: 1000 },
    { id: 1043, name: "TATAMOTORS25DECFUT", type: "futures", price: 1024.65, exchange: "NSE", lot: 1100 },
    { id: 1044, name: "TATAMOTORS25NOVFUT", type: "futures", price: 1022.30, exchange: "NSE", lot: 1100 },
    { id: 1045, name: "TCS25DECFUT", type: "futures", price: 4245.80, exchange: "NSE", lot: 175 },
    { id: 1046, name: "TCS25NOVFUT", type: "futures", price: 4239.15, exchange: "NSE", lot: 175 },
    { id: 1047, name: "TECHM25DECFUT", type: "futures", price: 1623.40, exchange: "NSE", lot: 600 },
    { id: 1048, name: "ULTRACEMCO25DECFUT", type: "futures", price: 11892.55, exchange: "NSE", lot: 100 },
    { id: 1049, name: "WIPRO25DECFUT", type: "futures", price: 545.70, exchange: "NSE", lot: 1500 },
    { id: 1050, name: "WIPRO25NOVFUT", type: "futures", price: 544.90, exchange: "NSE", lot: 1500 }
];

const dummyIndices: InstrumentItem[] = [
    { id: 2001, name: "NIFTY 50", type: "indices", price: 24352.10, exchange: "NSE", lot: 25 },
    { id: 2002, name: "NIFTY BANK", type: "indices", price: 52481.65, exchange: "NSE", lot: 15 },
    { id: 2003, name: "NIFTY FIN SERVICE", type: "indices", price: 24189.30, exchange: "NSE", lot: 25 },
];

const dummyCDS: InstrumentItem[] = [
    { id: 3001, name: "USDINR", type: "cds", price: 84.375, exchange: "NSE", lot: 1000 },
    { id: 3002, name: "EURINR", type: "cds", price: 91.28, exchange: "NSE", lot: 1000 },
    { id: 3003, name: "GBPINR", type: "cds", price: 109.56, exchange: "NSE", lot: 1000 },
];

const dummyCommodities: InstrumentItem[] = [
    { id: 4001, name: "GOLD", type: "mcx", price: 78250, exchange: "MCX", lot: 100 },
    { id: 4002, name: "SILVER", type: "mcx", price: 92450, exchange: "MCX", lot: 30 },
    { id: 4003, name: "CRUDEOIL", type: "mcx", price: 6420, exchange: "MCX", lot: 100 },
    { id: 4004, name: "NATURALGAS", type: "mcx", price: 285.6, exchange: "MCX", lot: 1250 },
];

// HashCode helper
declare global {
    interface String {
        hashCode(): number;
    }
}
String.prototype.hashCode = function () {
    let h = 0;
    for (let i = 0; i < this.length; i++) {
        h = (h << 5) - h + this.charCodeAt(i);
        h = h & h;
    }
    return Math.abs(h);
};

/* ──────────────────────────────────────────────────────────────────────── */
interface InstrumentsProps {
    strategyType: "timebased" | "indicatorbased";
    onInstrumentsChange: (instruments: InstrumentItem[]) => void;
    initialInstruments?: InstrumentItem[];
}

const Instruments: React.FC<InstrumentsProps> = ({
    strategyType,
    onInstrumentsChange,
    initialInstruments = [],
}) => {
    const [marketType, setMarketType] = useState<string>("options");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedInstruments, setSelectedInstruments] = useState<InstrumentItem[]>([]);
    const [open, setOpen] = useState(false);

    // Load initial instruments (edit mode)
    useEffect(() => {
        if (initialInstruments.length > 0 && selectedInstruments.length === 0) {
            setSelectedInstruments(initialInstruments);
        }
    }, [initialInstruments, selectedInstruments.length]);

    // Force options for timebased
    useEffect(() => {
        if (strategyType === "timebased") setMarketType("options");
    }, [strategyType]);

    // Auto-close dialog when option is selected
    useEffect(() => {
        if (selectedInstruments.some(i => i.type === "options") && open) {
            setOpen(false);
        }
    }, [selectedInstruments, open]);

    // Generate instruments based on marketType & search
    const instruments = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        let list: InstrumentItem[] = [];

        switch (marketType) {
            case "options":
                list = dummyOptions;
                break;
            case "equity":
                list = dummyEquities;
                break;
            case "futures":
                list = dummyFutures;
                break;
            case "indices":
                list = dummyIndices;
                break;
            case "cds":
                list = dummyCDS;
                break;
            case "mcx":
                list = dummyCommodities;
                break;
        }

        if (term) {
            list = list.filter(i => i.name.toLowerCase().includes(term));
        }

        return list;
    }, [marketType, searchTerm]);

    const handleSelect = useCallback((inst: InstrumentItem) => {
        if (inst.type === "options") {
            if (selectedInstruments.some(i => i.type === "options")) {
                toast.error("Only one option instrument allowed");
                return;
            }
            const updated = [inst];
            setSelectedInstruments(updated);
            onInstrumentsChange(updated);
            return;
        }

        if (selectedInstruments.some(i => i.type === "options")) {
            toast.error("Cannot mix options with other instruments");
            return;
        }
        if (selectedInstruments.some(i => i.id === inst.id)) return;

        const updated = [...selectedInstruments, { ...inst, qty: 1 }];
        setSelectedInstruments(updated);
        onInstrumentsChange(updated);
    }, [selectedInstruments, onInstrumentsChange]);

    const handleRemove = useCallback((id: number) => {
        const updated = selectedInstruments.filter(i => i.id !== id);
        setSelectedInstruments(updated);
        onInstrumentsChange(updated);
    }, [selectedInstruments, onInstrumentsChange]);

    const handleQtyChange = useCallback((id: number, qty: number) => {
        const updated = selectedInstruments.map(i =>
            i.id === id ? { ...i, qty: qty < 1 ? 1 : qty } : i
        );
        setSelectedInstruments(updated);
        onInstrumentsChange(updated);
    }, [selectedInstruments, onInstrumentsChange]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Select Instruments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {selectedInstruments.map(inst => (
                        <div key={inst.id} className="w-52 rounded-xl p-4 shadow-lg relative border text-white bg-gray-900">
                            <button onClick={() => handleRemove(inst.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <X size={16} />
                            </button>
                            <div className="font-medium text-sm">{inst.name}</div>
                            <div className="text-xs text-gray-400">{inst.exchange}: <span className="text-green-400">{inst.price.toFixed(2)}</span></div>
                            {inst.type === "options" ? (
                                <div className="mt-2 text-xs text-gray-300">Lot: <strong>{inst.lot}</strong></div>
                            ) : (
                                <div className="mt-2 flex items-center gap-2">
                                    <Label className="text-xs text-gray-300">Qty</Label>
                                    <Input type="number" min="1" value={inst.qty ?? 1} onChange={e => handleQtyChange(inst.id, parseInt(e.target.value) || 1)} className="h-8 w-16 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {!selectedInstruments.some(i => i.type === "options") && (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <div className="w-44 h-32 hover:bg-gray-800 p-3 rounded-lg border-2 border-dashed flex flex-col justify-center items-center cursor-pointer transition-all">
                                    <PlusCircle className="h-8 w-8 mb-2" />
                                    <div>Add Instruments</div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add Instruments</DialogTitle>
                                    <div className="py-3">
                                        <RadioGroup value={marketType} onValueChange={setMarketType} className="flex flex-wrap gap-4">
                                            {["Options", "Equity", "Futures", "Indices", "CDS", "MCX"].map(t => (
                                                <div key={t} className="flex items-center gap-2">
                                                    <RadioGroupItem value={t.toLowerCase()} id={t} disabled={strategyType === "timebased" && t !== "Options"} />
                                                    <Label htmlFor={t}>{t}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {strategyType === "timebased" && <DialogDescription>* Only Options allowed for Time-Based strategies</DialogDescription>}

                                    <div className="my-4">
                                        <InputGroup>
                                            <InputGroupInput placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                            <InputGroupAddon><Search size={16} /></InputGroupAddon>
                                            <InputGroupAddon align="inline-end">{instruments.length} results</InputGroupAddon>
                                        </InputGroup>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto space-y-1">
                                        {instruments.length > 0 ? instruments.map(item => {
                                            const isSelected = selectedInstruments.some(i => i.id === item.id);
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`p-2 border rounded cursor-pointer transition ${isSelected ? "bg-gray-900 text-gray-600" : "hover:bg-gray-800 hover:text-white"}`}
                                                    onClick={() => !isSelected && handleSelect(item)}
                                                >
                                                    {item.name}
                                                </div>
                                            );
                                        }) : <p className="text-muted-foreground">No results</p>}
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