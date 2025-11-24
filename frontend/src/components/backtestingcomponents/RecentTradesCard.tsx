// RecentTradesCard.tsx
import * as React from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Trade } from "@/components/backtestingcomponents/bktestingTypes";

type Props = {
    trades: Trade[];
};

export const RecentTradesCard: React.FC<Props> = ({ trades }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Trades</CardTitle>
                    <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">P&L</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trades.map((trade) => (
                            <TableRow key={trade.id}>
                                <TableCell className="font-medium">
                                    {new Date(trade.date).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </TableCell>
                                <TableCell
                                    className={`text-right font-semibold ${trade.pl >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {trade.pl >= 0 ? "+" : ""}₹
                                    {Math.abs(trade.pl).toLocaleString("en-IN")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
