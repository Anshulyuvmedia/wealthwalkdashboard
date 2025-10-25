import * as React from "react";
import { PlusCircle, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "./DataTable";
import { columns } from "./Columns";
import type { TdStrategy } from "./strategyTypes";
import { apiService } from "./apiservice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Strategy: React.FC = () => {
    const [strategys, setStrategys] = React.useState<TdStrategy[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchStrategys = async () => {
            try {
                setIsLoading(true);
                const response = await apiService.getStrategys();
                setStrategys(response);
            } catch (error) {
                console.error("Error fetching strategys:", error);
                toast.error("Failed to load strategys");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStrategys();
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
                <SiteHeader title="Strategy" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Strategy Management</h1>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            onClick={() => navigate("/strategy/add")}
                        >
                            <PlusCircle className="mr-1 h-5 w-5" />
                            Create Strategy
                        </Button>
                    </div>
                    <div>
                        <DataTable
                            columns={columns}
                            data={strategys}
                            isLoading={isLoading}
                            meta={{ setStrategys, strategys, navigate }}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Strategy;