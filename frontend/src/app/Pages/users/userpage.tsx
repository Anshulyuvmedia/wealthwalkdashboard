"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserForm } from "./UserForm";
import { DataTable } from "./DataTable";
import { apiService } from "./apiService";
import type { TdUser, UserFormData } from "./interfaces";
import { columns } from "./columns";

export default function Users() {
    const [data, setData] = React.useState<TdUser[]>([]);
    const [editUser, setEditUser] = React.useState<TdUser | null>(null);
    const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const users = await apiService.getUsers();
        setData(users);
        console.log('users', users);
    };

    const handleCreateOrUpdate = async (formData: UserFormData) => {
        try {
            if (editUser) {
                await apiService.updateUser(editUser.id, formData);
            } else {
                await apiService.createUser(formData);
            }
            setEditUser(null);
            fetchData();
        } catch (error) {
            console.error("Error saving user:", error);
        }
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
            await apiService.toggleUserStatus(id, status);
            fetchData();
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    // Find the user object for the delete confirmation dialog
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
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                </DialogHeader>
                                <UserForm
                                    user={null}
                                    onSubmit={handleCreateOrUpdate}
                                    onCancel={() => setEditUser(null)}
                                    isEditing={false}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <DataTable
                        columns={columns}
                        data={data}
                        refreshData={fetchData}
                        onCreateOrUpdate={handleCreateOrUpdate}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        editUser={editUser}
                        setEditUser={setEditUser}
                        setDeleteUserId={setDeleteUserId}
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