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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Plans: React.FC = () => {
    const [plans, setPlans] = React.useState<TdPlan[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();

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
                <SiteHeader title="Plans" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Plan Management</h1>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            onClick={() => navigate("/plans/add")}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Plan
                        </Button>
                    </div>
                    <div>
                        <DataTable
                            columns={columns}
                            data={plans}
                            isLoading={isLoading}
                            meta={{ setPlans, plans, navigate }}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Plans;