import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "./DataTable";
import { columns } from "./Columns";
import { apiService } from "./types";
import type { TdCourse } from "./types";

export default function Courses() {
    const navigate = useNavigate();
    const [data, setData] = React.useState<TdCourse[]>([]);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const courses = await apiService.getCourses();
        setData(courses);
    };

    return (
        <SidebarProvider>
            <Toaster />
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Courses" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Courses Management</h1>
                        <Button
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => navigate("/courses/add")}
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Course
                        </Button>
                    </div>
                    <DataTable columns={columns} data={data} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}