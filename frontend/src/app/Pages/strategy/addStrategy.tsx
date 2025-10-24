import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import StrategyType from "@/components/strategycomponets/StrategyType";
import Instruments from "@/components/strategycomponets/Instruments";
import OrderSettings from "@/components/strategycomponets/OrderSettings";
import EntryConditions from "@/components/strategycomponets/EntryConditions";
import ExitConditions from "@/components/strategycomponets/ExitConditions";
import OptionPositionBuilder from "@/components/strategycomponets/OptionPositionBuilder";
import RiskManagement from "@/components/strategycomponets/RiskManagement";
import { Ban, Trash2 } from "lucide-react";
import OrderLegs from "@/components/strategycomponets/OrderLegs";

const AddStrategy: React.FC = () => {
    const navigate = useNavigate();
    const [strategyType, setStrategyType] = useState<"timebased" | "indicatorbased">("timebased");
    const [selectedTemplate, setSelectedTemplate] = useState<string>(''); // Changed type to string

    // Callback to handle template selection
    const handleTemplateSelect = (template: string) => {
        setSelectedTemplate(template);
    };

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 50)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Create Strategy" />
                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <form className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex-1 me-4">
                                <Input type="text" id="strategy-name" placeholder="Enter Strategy Name" />
                            </div>
                            <div className="space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="cursor-pointer"
                                >
                                    <Ban size={16} className="text-white" />
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="cursor-pointer"
                                >
                                    <Trash2 size={16} className="text-white" />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <StrategyType strategyType={strategyType} setStrategyType={setStrategyType} />
                        <Instruments strategyType={strategyType} />
                        <OrderSettings strategyType={strategyType} template={selectedTemplate} onTemplateSelect={handleTemplateSelect} />
                        {strategyType === 'timebased' ? (
                            <OrderLegs selectedTemplate={selectedTemplate} />
                        ) : (
                            <>
                                <EntryConditions />
                                <ExitConditions />
                                <OptionPositionBuilder />
                            </>
                        )}
                        <RiskManagement />

                        <div className="flex justify-end gap-4">
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Save Strategy
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AddStrategy;