import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiService } from "./apiService";
import type { TdPlan } from "./types";

const predefinedFeatures = [
    { title: "Paid Signals", enabled: false },
    { title: "Courses", enabled: false },
    { title: "News", enabled: false },
    { title: "FX Signals", enabled: false },
    { title: "Screener", enabled: false },
    { title: "Algorithmic Trading", enabled: false },
    { title: "AI Charts", enabled: false },
];

const AddPlan: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState<Partial<TdPlan>>({
        planName: "",
        Duration: "",
        durationValue: 0,
        fetures: predefinedFeatures,
        pricing: 0,
    });

    const handleFeatureToggle = (index: number, checked: boolean) => {
        setFormData({
            ...formData,
            fetures: (formData.fetures || []).map((feature, i) =>
                i === index ? { ...feature, enabled: checked } : feature
            ),
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
                fetures: formData.fetures || predefinedFeatures,
            } as TdPlan;

            await apiService.createPlan(planData);
            toast.success("Plan created successfully!");
            navigate("/plans");
        } catch (error) {
            toast.error("Failed to create plan");
        }
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 50)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Add Plan" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <h1 className="text-3xl font-bold">Add New Plan</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-[600px] bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-200 rounded-lg shadow-xl p-6">
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
                            <Label className="text-sm font-medium">Features</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {(formData.fetures || predefinedFeatures).map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`feature-${index}`}
                                            checked={feature.enabled}
                                            onCheckedChange={(checked) => handleFeatureToggle(index, checked as boolean)}
                                            className="border-gray-600 dark:border-gray-500"
                                        />
                                        <Label htmlFor={`feature-${index}`} className="text-gray-200 dark:text-gray-300">{feature.title}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/plans")}
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
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AddPlan;