// RecentTradesCard.tsx
import * as React from "react";
import { Download, Plus, Minus, ArrowDown, ArrowUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { Trade } from "@/components/backtestingcomponents/bktestingTypes";
import { generateTradeLegsForDay, type TradeLeg } from "@/lib/backtesting-api";
import * as XLSX from "xlsx";

type Props = {
    trades: Trade[];
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

// FIXED: Working export function (works in Next.js, Vite, CRA, etc.)
const exportToExcel = (trades: Trade[]) => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Daily Summary
    const dailyData = trades.map((trade) => {
        const legs = generateTradeLegsForDay(trade.date, trade.pl);
        return {
            Date: new Date(trade.date).toLocaleDateString("en-IN"),
            "Daily P&L": trade.pl,
            "Total Legs": legs.length,
            Status: trade.pl >= 0 ? "Profit" : "Loss",
        };
    });

    const dailySheet = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Summary");

    // Sheet 2: Detailed Trade Legs
    const detailedData: any[] = [];
    trades.forEach((trade) => {
        const legs = generateTradeLegsForDay(trade.date, trade.pl);
        legs.forEach((leg) => {
            detailedData.push({
                Date: new Date(trade.date).toLocaleDateString("en-IN"),
                Symbol: leg.symbol,
                Quantity: leg.qty,
                Side: leg.side,
                "Entry Price": leg.entryPrice,
                "Entry Time": leg.entryTime,
                "Exit Price": leg.exitPrice,
                "Exit Time": leg.exitTime,
                "Leg P&L": leg.pl,
                "Exit Type": leg.exitType,
                "Daily Total": trade.pl,
            });
        });
    });

    const detailSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, "Trade Details");

    // Auto-size columns
    [dailySheet, detailSheet].forEach((ws) => {
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        const colWidths: number[] = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let max = 10;
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
                if (cell && cell.v) max = Math.max(max, String(cell.v).length + 4);
            }
            colWidths[C] = max;
        }
        ws["!cols"] = colWidths.map((w) => ({ width: w }));
    });

    // This works in ALL environments (Next.js, Vite, CRA)
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BankNifty_Trades_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
};

export const RecentTradesCard: React.FC<Props> = ({ trades }) => {
    const recent = trades.slice(0, 10);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-950 to-black text-white">
            <CardHeader className="border-b border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white">
                        Transaction Details
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportToExcel(trades)}
                        className="border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white transition-all font-medium"
                    >
                        Export Transactions to Excel
                        <Download className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                    {recent.map((trade) => {
                        const legs = generateTradeLegsForDay(trade.date, trade.pl);
                        const isLoss = trade.pl < 0;

                        return (
                            <AccordionItem
                                key={trade.id}
                                value={`trade-${trade.id}`}
                                className="border-b border-zinc-800 last:border-b-0"
                            >
                                <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-zinc-900/50 transition-all">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="text-lg font-semibold text-white">
                                            {formatDate(trade.date)}
                                        </div>
                                        <div className={`text-xl font-bold flex items-center gap-1 ${isLoss ? "text-red-500" : "text-emerald-400"}`}>
                                            {isLoss ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                            ₹{Math.abs(trade.pl).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="bg-zinc-900/70 border-t border-zinc-800">
                                    <div className="px-6 py-5">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-zinc-700">
                                                    <TableHead className="text-zinc-400 text-xs font-medium">Symbol</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs text-center">Quantity</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs">Entry</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs">Exit</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs text-right">Profit/Loss</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs">Transaction</TableHead>
                                                    <TableHead className="text-zinc-400 text-xs">Exit Type</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {legs.map((leg, i) => (
                                                    <TableRow key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
                                                        <TableCell className="font-mono text-cyan-400 text-sm">
                                                            {leg.symbol}
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium text-white">
                                                            {leg.qty}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <div className="text-white font-medium">price : {leg.entryPrice}</div>
                                                            <div className="text-zinc-500">time : {leg.entryTime}</div>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <div className="text-white font-medium">price : {leg.exitPrice}</div>
                                                            <div className="text-zinc-500">time : {leg.exitTime}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className={`font-bold flex items-center justify-end gap-1.5 ${leg.pl >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                                                                {leg.pl >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                                                ₹{Math.abs(leg.pl).toLocaleString("en-IN")}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${leg.side === "Buy" ? "bg-emerald-900/50 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
                                                                <div className="w-2 h-2 rounded-full bg-current" />
                                                                {leg.side}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${leg.exitType.includes("Target") || leg.exitType.includes("EOD") ? "bg-emerald-900/50 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
                                                                {leg.exitType}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};