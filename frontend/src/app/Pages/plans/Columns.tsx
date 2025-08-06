import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiService } from "./apiService";
import { toast } from "sonner";
import type { TdPlan } from "./types";
import { IconTrashX, IconEdit  } from '@tabler/icons-react';

export const columns: ColumnDef<TdPlan>[] = [
    {
        accessorKey: "planName",
        header: "Plan Name",
        cell: ({ row }) => (
            <span className="font-medium text-gray-100 dark:text-gray-200">{row.original.planName}</span>
        ),
    },
    {
        accessorKey: "Duration",
        header: "Duration",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">{row.original.Duration}</span>
        ),
    },
    {
        accessorKey: "durationValue",
        header: "Duration (Months)",
        cell: ({ row }) => (
            <span className="text-gray-300 dark:text-gray-400">{row.original.durationValue}</span>
        ),
    },
    {
        accessorKey: "fetures",
        header: "Features",
        cell: ({ row }) => (
            <ul className="list-disc pl-4 space-y-1 text-gray-300 dark:text-gray-400">
                {row.original.fetures.map((feature, index) => (
                    <li key={index}>{feature.title}</li>
                ))}
            </ul>
        ),
    },
    {
        accessorKey: "pricing",
        header: "Price",
        cell: ({ row }) => (
            <span className="text-gray-100 dark:text-gray-200 font-medium">${row.original.pricing.toFixed(2)}</span>
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
        cell: ({ row, table }) => {
            const { openEditModal, setPlans, plans } = table.options.meta as any;

            const handleDelete = async () => {
                try {
                    await apiService.deletePlan(row.original.id!);
                    setPlans(plans.filter((plan: TdPlan) => plan.id !== row.original.id));
                    toast.success("Plan deleted successfully!");
                } catch (error) {
                    toast.error("Failed to delete plan");
                }
            };

            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(row.original)}
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
                        <DialogContent className="sm:max-w-[425px] bg-gray-800 dark:bg-gray-900 text-red-600 dark:text-red-600 rounded-lg shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Delete Plan</DialogTitle>
                                <DialogDescription className="text-white">
                                    Are you sure you want to delete the plan "{row.original.planName}"? This action cannot be undone.
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