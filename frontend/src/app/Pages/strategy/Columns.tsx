import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { apiService } from "./apiservice";
import { toast } from "sonner";
import type { TdStrategy } from "./strategyTypes";
import { IconTrashX, IconEdit, IconCopy, IconPlayerPlay  } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export const columns: ColumnDef<TdStrategy>[] = [
    {
        id: "serial",
        header: "Sr. No.",
        cell: ({ row, table }) => {
            // ✅ Find this row's position in the FULL row model (after pagination)
            const allRows = table.getRowModel().rows;
            const globalIndex = allRows.findIndex((r) => r.id === row.id);

            const serialNumber = globalIndex + 1;

            return (
                <span className="text-gray-400 font-medium tabular-nums">
                    {serialNumber}
                </span>
            );
        },
        enableSorting: false,
        enableHiding: false,
        size: 70,
        meta: {
            className: "text-center",
        },
    },
    {
        accessorKey: "strategyName",
        header: "Strategy Name",
        cell: ({ row }) => (
            <span className="font-medium text-gray-100 dark:text-gray-200">
                {row.original.strategyName}
            </span>
        ),
    },
    {
        accessorKey: "Duration",
        header: "Start Time",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">
                {row.original.orderSettings?.startTime}
            </span>
        ),
    },
    {
        accessorKey: "durationValue",
        header: "End Time",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">
                {row.original.orderSettings?.squareOff}
            </span>
        ),
    },
    {
        id: "interval",
        header: "Interval",
        cell: ({ row }) => {
            const minutes = row.original.orderSettings?.interval;

            if (!minutes || minutes <= 0) return <span className="text-gray-500">N/A</span>;

            const formatInterval = (mins: number): string => {
                if (mins % 1440 === 0) {
                    const days = mins / 1440;
                    return days === 1 ? "1 D" : `${days} D`;
                }
                if (mins % 60 === 0) {
                    const hours = mins / 60;
                    return hours === 1 ? "1 H" : `${hours} H`;
                }
                if (mins < 60) {
                    return `${mins} min`;
                }
                // For cases like 45 min
                return `${mins} min`;
            };

            return (
                <span className="font-medium text-gray-100 dark:text-gray-200">
                    {formatInterval(minutes)}
                </span>
            );
        },
        size: 100,
        meta: {
            className: "text-center",
        },
    },
    {
        accessorKey: "strategyType",
        header: "Segment Type",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">
                {row.original.instruments[0]?.type?.toUpperCase() || "N/A"}
            </span>
        ),
    },
    {
        accessorKey: "pricing",
        header: "Strategy Type",
        cell: ({ row }) => (
            <span className="text-gray-100 dark:text-gray-200 font-medium">
                {row.original.strategyType?.toUpperCase()}
            </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => {
            const { setStrategys, strategys } = table.options.meta as any;
            const navigate = useNavigate();
            const [open, setOpen] = useState(false);

            const handleDelete = async () => {
                try {
                    await apiService.deleteStrategy(row.original.id!);
                    setStrategys(
                        strategys.filter((s: TdStrategy) => s.id !== row.original.id)
                    );
                    toast.success("Strategy deleted successfully!");
                    setOpen(false);
                } catch (error) {
                    toast.error("Failed to delete strategy");
                }
            };

            const handleDuplicate = async () => {
                try {
                    const original = row.original;
                    const duplicatedStrategy = {
                        ...original,
                        strategyName: `Copy of ${original.strategyName}`,
                        id: undefined, // Ensure new ID is generated
                        createdAt: new Date().toISOString(),
                        updateAt: new Date().toISOString(),
                    };

                    const { id, ...payload } = duplicatedStrategy;

                    const response = await apiService.createStrategy(payload as any);
                    setStrategys([response, ...strategys]);
                    toast.success(
                        `Strategy "${response.strategyName}" duplicated successfully!`
                    );
                } catch (error: any) {
                    toast.error(error.message || "Failed to duplicate strategy");
                }
            };

            return (
                <div className="flex gap-2">
                    {/* Edit Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/backTesting/${row.original.id}`)}
                        className="border-green-600 dark:border-green-500 text-green-200 dark:text-white-300 hover:bg-green-700 dark:hover:bg-green-600"
                    >
                        <IconPlayerPlay className="w-4 h-4 mr-1" /> Backtest
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/strategy/edit/${row.original.id}`)}
                        className="border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        <IconEdit className="w-4 h-4 mr-1" /> Edit
                    </Button>

                    {/* Duplicate Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicate}
                        className="border-blue-600 dark:border-blue-500 text-blue-300 hover:bg-blue-900/30"
                    >
                        <IconCopy className="w-4 h-4 mr-1" /> Copy
                    </Button>

                    {/* Delete Button with Confirmation Dialog */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                            >
                                <IconTrashX className="w-4 h-4 mr-1" /> Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-white">
                                    Delete Strategy
                                </DialogTitle>
                                <DialogDescription className="text-gray-300">
                                    Are you sure you want to delete the strategy "
                                    {row.original.strategyName}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    <IconTrashX className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    },
];
