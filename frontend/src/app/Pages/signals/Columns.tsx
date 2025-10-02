// Updated Columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";    
import type { TdSignal } from "./types";
import { IconEdit, IconTrash } from '@tabler/icons-react';

export const getColumns = (signalType: string, onDelete: (id: number) => void): ColumnDef<TdSignal>[] => {
    const basePath = signalType === 'paid' ? '/paidsignals' : '/freesignals';
    const editBase = `${basePath}/edit`;

    return [
        {
            accessorKey: "id",
            cell: ({ row }) => row.index + 1,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Sr.No.
                </Button>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ getValue }) => getValue() || "N/A",
        },
        {
            accessorKey: "stockName",
            header: "Stock Name",
            cell: ({ getValue }) => getValue() || "N/A",
        },
        {
            accessorKey: "marketSentiments",
            header: "Sentiment",
            cell: ({ getValue }) => {
                const sentiment = getValue() as string;
                const colorClass = sentiment === 'Bullish' ? 'text-green-600' : 
                                   sentiment === 'Bearish' ? 'text-red-600' : 'text-gray-600';
                return <span className={colorClass}>{sentiment || "N/A"}</span>;
            },
        },
        {
            accessorKey: "entry",
            header: "Entry",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return value ? `₹${value.toLocaleString()}` : "N/A";
            },
        },
        {
            accessorKey: "target",
            header: "Target",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return value ? `₹${value.toLocaleString()}` : "N/A";
            },
        },
        {
            accessorKey: "stopLoss",
            header: "Stop Loss",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return value ? `₹${value.toLocaleString()}` : "N/A";
            },
        },
        {
            accessorKey: "exit",
            header: "Exit",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return value ? `₹${value.toLocaleString()}` : "N/A";
            },
        },
        {
            accessorKey: "tradeType",
            header: "Trade Type",
            cell: ({ getValue }) => getValue() || "N/A",
        },
        {
            accessorKey: "Strategy",
            header: "Strategy",
            cell: ({ getValue }) => getValue() || "N/A",
        },
        {
            accessorKey: "updatedAt",
            header: "Updated At",
            cell: ({ getValue }) => {
                const date = new Date(getValue() as string);
                return date.toLocaleString() || "N/A";
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const signal = row.original;
                if (!signal.id) {
                    console.error("Signal ID is undefined:", signal);
                    return <Button variant="outline" size="sm" disabled>Edit (No ID)</Button>;
                }
                return (
                    <div className="flex gap-2">
                        <Link to={`${editBase}/${signal.id}`} className="text-green-600 hover:text-green-800">
                            <Button variant="outline" size="sm">
                                <IconEdit stroke={2} /> Edit
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(signal.id!)}
                        >
                            <IconTrash stroke={2} /> Delete
                        </Button>
                    </div>
                );
            },
        }
    ];
};