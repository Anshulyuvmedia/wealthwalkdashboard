"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { DataTable } from "./DataTable";
import apiService  from './apiService';
import type { TdUser } from "./interfaces";
import { columns } from "./columns";
import { useNavigate } from "react-router-dom";

export default function Users() {
    const navigate = useNavigate();
    const [data, setData] = React.useState<TdUser[]>([]);
    const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const users = await apiService.getUsers();
        setData(users);
        console.log('users', users);
    };

    const handleDelete = async (id: string) => {
        try {
            await apiService.deleteUser(id);
            setDeleteUserId(null);
            fetchData();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleToggleStatus = async (id: string, status: "active" | "inactive") => {
        try {
            await apiService.changeUserStatus(id, status);
            fetchData();
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    const userToDelete = data.find(user => user.id === deleteUserId);

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
                <SiteHeader title="Users" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Users Management</h1>
                        <Button
                            size="sm"
                            className="flex items-center gap-2 bg-green-600 text-white"
                            onClick={() => navigate("/users/add")}
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                    <DataTable
                        columns={columns}
                        data={data}
                        refreshData={fetchData}
                        onToggleStatus={handleToggleStatus}
                        setDeleteUserId={setDeleteUserId}
                        setEditUser={(user) => navigate(`/users/edit/${user.id}`)}
                    />
                    <Dialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-white">
                                    Are you sure you want to delete the user{" "}
                                    <strong>{userToDelete?.contactName || "Unknown"}</strong>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDeleteUserId(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => deleteUserId && handleDelete(deleteUserId)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}