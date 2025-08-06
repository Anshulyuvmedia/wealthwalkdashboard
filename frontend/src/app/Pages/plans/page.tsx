import * as React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "./DataTable";
import { columns } from "./Columns";
import { apiService } from "./apiService";
import type { TdPlan } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconX } from '@tabler/icons-react';

const Plans: React.FC = () => {
    const [plans, setPlans] = React.useState<TdPlan[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [editingPlan, setEditingPlan] = React.useState<TdPlan | null>(null);
    const [formData, setFormData] = React.useState<Partial<TdPlan>>({
        planName: "",
        Duration: "",
        durationValue: 0,
        fetures: [],
        pricing: 0,
    });
    const [featureInput, setFeatureInput] = React.useState("");

    React.useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await apiService.getPlans();
                setPlans(response);
            } catch (error) {
                console.error("Error fetching plans:", error);
                toast.error("Failed to load plans");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData({
                ...formData,
                fetures: [...(formData.fetures || []), { title: featureInput.trim() }],
            });
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData({
            ...formData,
            fetures: (formData.fetures || []).filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const planData: TdPlan = {
                ...formData,
                durationValue: Number(formData.durationValue) || 0,
                pricing: Number(formData.pricing) || 0,
                createdAt: new Date().toISOString(),
                updateAt: new Date().toISOString(),
                fetures: formData.fetures || [],
            } as TdPlan;

            if (editingPlan) {
                await apiService.updatePlan(editingPlan.id!, planData);
                setPlans(plans.map((plan) => (plan.id === editingPlan.id ? { ...plan, ...planData } : plan)));
                toast.success("Plan updated successfully!");
                setIsEditOpen(false);
            } else {
                const newPlan = await apiService.createPlan(planData);
                setPlans([...plans, newPlan]);
                toast.success("Plan created successfully!");
                setIsAddOpen(false);
            }
            setFormData({ planName: "", Duration: "", durationValue: 0, fetures: [], pricing: 0 });
            setEditingPlan(null);
        } catch (error) {
            toast.error(editingPlan ? "Failed to update plan" : "Failed to create plan");
        }
    };

    const openEditModal = (plan: TdPlan) => {
        setEditingPlan(plan);
        setFormData({
            planName: plan.planName,
            Duration: plan.Duration,
            durationValue: plan.durationValue,
            fetures: plan.fetures,
            pricing: plan.pricing,
        });
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            setFormData({ planName: "", Duration: "", durationValue: 0, fetures: [], pricing: 0 });
            setEditingPlan(null);
            setFeatureInput("");
        }
    };

    const handleAddOpen = (open: boolean) => {
        setIsAddOpen(open);
        if (open && !editingPlan) {
            setFormData({ planName: "", Duration: "", durationValue: 0, fetures: [], pricing: 0 });
            setFeatureInput("");
        }
    };

    return (
        <SidebarProvider style={
            {
                "--sidebar-width": "calc(var(--spacing) * 50)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Plans" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Plan Management</h1>
                        <Dialog open={isAddOpen} onOpenChange={handleAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Add New Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-200 rounded-lg shadow-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">Add New Plan</DialogTitle>
                                    <DialogDescription className="text-gray-400 dark:text-gray-500">
                                        Create a new plan with the details below.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="planName" className="text-sm font-medium">Plan Name</Label>
                                        <Input
                                            id="planName"
                                            value={formData.planName || ""}
                                            onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                            required
                                            className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter plan name"
                                        />
                                    </div>
                                    <div className="flex ">
                                        <div className="space-y-2 me-2">
                                            <Label htmlFor="Duration" className="text-sm font-medium">Duration</Label>
                                            <Input
                                                id="Duration"
                                                value={formData.Duration || ""}
                                                onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
                                                required
                                                className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Monthly, Yearly"
                                            />
                                        </div>
                                        <div className="space-y-2 me-2">
                                            <Label htmlFor="durationValue" className="text-sm font-medium">Duration (Months)</Label>
                                            <Input
                                                id="durationValue"
                                                type="number"
                                                value={formData.durationValue || 0}
                                                onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
                                                required
                                                className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pricing" className="text-sm font-medium">Price ($)</Label>
                                            <Input
                                                id="pricing"
                                                type="number"
                                                value={formData.pricing || 0}
                                                onChange={(e) => setFormData({ ...formData, pricing: parseFloat(e.target.value) })}
                                                required
                                                className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="features" className="text-sm font-medium">Features</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="features"
                                                value={featureInput}
                                                onChange={(e) => setFeatureInput(e.target.value)}
                                                placeholder="Add a feature"
                                                className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddFeature}
                                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <ul className="mt-3 space-y-2">
                                            {(formData.fetures || []).map((feature, index) => (
                                                <li key={index} className="flex justify-between items-center bg-gray-700 dark:bg-gray-800 p-2 rounded">
                                                    <span className="text-gray-200 dark:text-gray-300">{feature.title}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFeature(index)}
                                                        className="text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-600"
                                                    >
                                                        <IconX stroke={2} />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <DialogFooter className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAddOpen(false)}
                                            className="border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                                        >
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div>
                        <DataTable
                            columns={columns}
                            data={plans}
                            isLoading={isLoading}
                            meta={{ openEditModal, setPlans, plans }}
                        />
                    </div>
                    <Dialog open={isEditOpen} onOpenChange={handleEditClose}>
                        <DialogContent className="sm:max-w-[600px] bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-200 rounded-lg shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Edit Plan</DialogTitle>
                                <DialogDescription className="text-gray-400 dark:text-gray-500">
                                    Update the details for the plan.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="planName" className="text-sm font-medium">Plan Name</Label>
                                    <Input
                                        id="planName"
                                        value={formData.planName || ""}
                                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                        required
                                        className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter plan name"
                                    />
                                </div>
                                <div className="flex">
                                    <div className="space-y-2 me-2">
                                        <Label htmlFor="Duration" className="text-sm font-medium">Duration</Label>
                                        <Input
                                            id="Duration"
                                            value={formData.Duration || ""}
                                            onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
                                            required
                                            className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Monthly, Yearly"
                                        />
                                    </div>
                                    <div className="space-y-2 me-2">
                                        <Label htmlFor="durationValue" className="text-sm font-medium">Duration (Months)</Label>
                                        <Input
                                            id="durationValue"
                                            type="number"
                                            value={formData.durationValue || 0}
                                            onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
                                            required
                                            className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pricing" className="text-sm font-medium">Price ($)</Label>
                                        <Input
                                            id="pricing"
                                            type="number"
                                            value={formData.pricing || 0}
                                            onChange={(e) => setFormData({ ...formData, pricing: parseFloat(e.target.value) })}
                                            required
                                            className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="features" className="text-sm font-medium">Features</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="features"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            placeholder="Add a feature"
                                            className="bg-gray-700 dark:bg-gray-800 border-gray-600 dark:border-gray-700 text-gray-100 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <ul className="mt-3 space-y-2">
                                        {(formData.fetures || []).map((feature, index) => (
                                            <li key={index} className="flex justify-between items-center bg-gray-700 dark:bg-gray-800 p-2 rounded">
                                                <span className="text-gray-200 dark:text-gray-300">{feature.title}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFeature(index)}
                                                    className="text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-600"
                                                >
                                                    <IconX stroke={2} />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <DialogFooter className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleEditClose(false)}
                                        className="border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                                    >
                                        Update
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Plans;