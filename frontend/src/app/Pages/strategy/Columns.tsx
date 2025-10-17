import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import  { apiService } from "./types";
import { toast } from "sonner";
import type { TdStrategy } from "./types";
import { IconTrashX, IconEdit } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<TdStrategy>[] = [
    {
        accessorKey: "strategyName",
        header: "Strategy Name",
        cell: ({ row }) => (
            <span className="font-medium text-gray-100 dark:text-gray-200">{row.original.strategyName}</span>
        ),
    },
    {
        accessorKey: "Duration",
        header: "Start Time",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">{row.original.Duration}</span>
        ),
    },
    {
        accessorKey: "durationValue",
        header: "End Time",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">{row.original.durationValue}</span>
        ),
    },
    {
        accessorKey: "fetures",
        header: "Segment Type",
        cell: ({ row }) => (
            <ul className="list-disc pl-4 space-y-1 text-gray-300 dark:text-gray-400">
                {row.original.fetures
                    .filter((feature) => feature.enabled)
                    .map((feature, index) => (
                        <li key={index}>{feature.title}</li>
                    ))}
            </ul>
        ),
    },
    {
        accessorKey: "pricing",
        header: "Strategy Type",
        cell: ({ row }) => (
            <span className="text-gray-100 dark:text-gray-200 font-medium">₹ {row.original.pricing.toFixed(2)}</span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">{new Date(row.original.createdAt).toLocaleDateString()}</span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => {
            const { setStrategys, strategys } = table.options.meta as any;
            const navigate = useNavigate();

            const handleDelete = async () => {
                try {
                    await apiService.deleteStrategy(row.original.id!);
                    setStrategys(strategys.filter((strategy: TdStrategy) => strategy.id !== row.original.id));
                    toast.success("Strategy deleted successfully!");
                } catch (error) {
                    toast.error("Failed to delete strategy");
                }
            };

            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/strategy/edit/${row.original.id}`)}
                        className="border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        <IconEdit stroke={2} /> Edit
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                            >
                                <IconTrashX stroke={2} /> Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-gray-800 dark:bg-gray-900 text-red-600 dark:text-red-red-600 rounded-lg shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Delete Strategy</DialogTitle>
                                <DialogDescription className="text-white">
                                    Are you sure you want to delete the strategy "{row.original.strategyName}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                                >
                                    <IconTrashX stroke={2} /> Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    },
];