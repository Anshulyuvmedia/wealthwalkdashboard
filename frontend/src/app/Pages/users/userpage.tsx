"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, UserPlus } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// User interface
interface TdUser {
    id: string;
    email: string;
    contactName: string;
    password: string;
    userType: "admin" | "user";
    status: "active" | "inactive";
    phoneVerified: boolean;
    city?: string;
    state?: string;
    country?: string;
    lastLogin?: string;
    username?: string;
    planId?: string;
    profileImage?: string;
}

// Form data interface for create/update
interface UserFormData extends Partial<TdUser> {
    password?: string;
    profileImageFile?: File;
}

// DataTable props
interface DataTableProps {
    columns: ColumnDef<TdUser, any>[];
    data: TdUser[];
    refreshData: () => void;
    onCreateOrUpdate: (formData: UserFormData) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, status: "active" | "inactive") => void;
    editUser: TdUser | null;
    setEditUser: (user: TdUser | null) => void;
    setDeleteUserId: (id: string | null) => void;
}

// API service
const apiService = {
    async getUsers(): Promise<TdUser[]> {
        try {
            const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
            const response = await axios.get("http://localhost:3000/api/TdUsers", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.filter((user: TdUser) => user.userType !== "admin");
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to fetch users");
            return [];
        }
    },

    async createUser(formData: UserFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = { ...formData };
            if (formData.profileImageFile) {
                const formDataWithFile = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (key !== "profileImageFile" && value !== undefined) {
                        formDataWithFile.append(key, value as string);
                    }
                });
                formDataWithFile.append("profileImage", formData.profileImageFile);
                await axios.post("http://localhost:3000/api/TdUsers", formDataWithFile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.post("http://localhost:3000/api/TdUsers", dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("User created successfully!");
        } catch (error) {
            toast.error("Failed to create user");
            throw error;
        }
    },

    async updateUser(id: string, formData: UserFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = { ...formData };
            if (formData.profileImageFile) {
                const formDataWithFile = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (key !== "profileImageFile" && value !== undefined) {
                        formDataWithFile.append(key, value as string);
                    }
                });
                formDataWithFile.append("profileImage", formData.profileImageFile);
                await axios.patch(`http://localhost:3000/api/TdUsers/${id}`, formDataWithFile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.patch(`http://localhost:3000/api/TdUsers/${id}`, dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("User updated successfully!");
        } catch (error) {
            toast.error("Failed to update user");
            throw error;
        }
    },

    async deleteUser(id: string) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await axios.delete(`http://localhost:3000/api/TdUsers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("User deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete user");
            throw error;
        }
    },

    async toggleUserStatus(id: string, status: "active" | "inactive") {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await axios.patch(
                `http://localhost:3000/api/TdUsers/${id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            toast.success(`User status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update user status");
            throw error;
        }
    },
};

// User form component
function UserForm({
    user,
    onSubmit,
    onCancel,
    isEditing,
}: {
    user: TdUser | null;
    onSubmit: (formData: UserFormData) => void;
    onCancel: () => void;
    isEditing: boolean;
}) {
    const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(
        user?.profileImage || null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setProfileImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData: UserFormData = {
            contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value || undefined,
            userType: (form.elements.namedItem("userType") as HTMLSelectElement).value as "admin" | "user",
            status: (form.elements.namedItem("status") as HTMLInputElement).checked ? "active" : "inactive",
            phoneVerified: (form.elements.namedItem("phoneVerified") as HTMLInputElement).checked,
            city: (form.elements.namedItem("city") as HTMLInputElement).value || undefined,
            state: (form.elements.namedItem("state") as HTMLInputElement).value || undefined,
            country: (form.elements.namedItem("country") as HTMLInputElement).value || undefined,
            username: (form.elements.namedItem("username") as HTMLInputElement).value || undefined,
            planId: (form.elements.namedItem("planId") as HTMLInputElement).value || undefined,
            profileImageFile: (form.elements.namedItem("profileImageFile") as HTMLInputElement).files?.[0],
        };
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                        Full Name *
                    </Label>
                    <Input
                        id="contactName"
                        name="contactName"
                        defaultValue={user?.contactName || ""}
                        placeholder="Enter full name"
                        className="mt-1"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email *
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        placeholder="Enter email"
                        className="mt-1"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password {isEditing ? "(Leave blank to keep existing)" : "*"}
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        className="mt-1"
                        required={!isEditing}
                    />
                </div>
                <div>
                    <Label htmlFor="userType" className="text-sm font-medium text-gray-700">
                        User Type *
                    </Label>
                    <Select name="userType" defaultValue={user?.userType || "user"} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status *
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                        <Switch
                            id="status"
                            name="status"
                            defaultChecked={user?.status === "active"}
                        />
                        <span>{user?.status === "active" ? "Active" : "Inactive"}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="phoneVerified" className="text-sm font-medium text-gray-700">
                        Phone Verified
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                        <Switch
                            id="phoneVerified"
                            name="phoneVerified"
                            defaultChecked={user?.phoneVerified || false}
                        />
                        <span>{user?.phoneVerified ? "Verified" : "Not Verified"}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City (Optional)
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        defaultValue={user?.city || ""}
                        placeholder="Enter city"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State (Optional)
                    </Label>
                    <Input
                        id="state"
                        name="state"
                        defaultValue={user?.state || ""}
                        placeholder="Enter state"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country (Optional)
                    </Label>
                    <Input
                        id="country"
                        name="country"
                        defaultValue={user?.country || ""}
                        placeholder="Enter country"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                        Username (Optional)
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        defaultValue={user?.username || ""}
                        placeholder="Enter username"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="planId" className="text-sm font-medium text-gray-700">
                        Plan ID (Optional)
                    </Label>
                    <Input
                        id="planId"
                        name="planId"
                        defaultValue={user?.planId || ""}
                        placeholder="Enter plan ID"
                        className="mt-1"
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor="profileImageFile" className="text-sm font-medium text-gray-700">
                        Profile Image (Optional)
                    </Label>
                    <Input
                        id="profileImageFile"
                        name="profileImageFile"
                        type="file"
                        accept="image/*"
                        className="mt-1"
                        onChange={handleFileChange}
                    />
                    {profileImagePreview && (
                        <div>
                            <img
                                src={profileImagePreview}
                                alt="Profile Preview"
                                className="mt-2 h-20 w-20 rounded-full object-cover"
                            />
                            {user?.profileImage && (
                                <p className="text-gray-500 mt-2 text-sm">{user.profileImage}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    {isEditing ? "Update User" : "Create User"}
                </Button>
            </div>
        </form>
    );
}

// DataTable component
function DataTable({
    columns,
    data,
    onToggleStatus,
    setEditUser,
    setDeleteUserId,
}: DataTableProps) {
    const [globalFilter, setGlobalFilter] = React.useState("");

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        state: { globalFilter },
        initialState: { pagination: { pageSize: 10 } },
        meta: { setEditUser, setDeleteUserId, onToggleStatus },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: " 🔼",
                                            desc: " 🔽",
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {table.getRowModel().rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="p-1 rounded-md border"
                >
                    {[10, 20, 30].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// Columns definition
const columns: ColumnDef<TdUser>[] = [
    {
        accessorKey: "id",
        cell: ({ row }) => row.index + 1,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Sr.No.
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "profileImage",
        header: "Thumbnail",
        cell: ({ row }) => {
            const imageUrl = row.getValue("profileImage") as string | undefined;
            return imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                    }}
                />
            ) : (
                "N/A"
            );
        },
    },
    {
        accessorKey: "contactName",
        header: "Name",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row, table }) => {
            const user = row.original;
            const { onToggleStatus } = table.options.meta as {
                onToggleStatus: (id: string, status: "active" | "inactive") => void;
            };
            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() =>
                            onToggleStatus(user.id, user.status === "active" ? "inactive" : "active")
                        }
                    />
                    <span>{user.status === "active" ? "Active" : "Inactive"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "planId",
        header: "Plan",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const user = row.original;
            const { setEditUser, setDeleteUserId, onToggleStatus } = table.options.meta as {
                setEditUser: (user: TdUser | null) => void;
                setDeleteUserId: (id: string | null) => void;
                onToggleStatus: (id: string, status: "active" | "inactive") => void;
            };
            return (
                <div className="actions">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(user.id);
                                    toast.success("User ID copied to clipboard");
                                }}
                            >
                                Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditUser(user);
                                }}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteUserId(user.id);
                                }}
                            >
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStatus(user.id, user.status === "active" ? "inactive" : "active");
                                }}
                            >
                                {user.status === "active" ? "Disable" : "Enable"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

// Main Users component
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

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Users" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Users Management</h1>
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
                    <Dialog open={editUser !== null} onOpenChange={() => setEditUser(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <UserForm
                                user={editUser}
                                onSubmit={handleCreateOrUpdate}
                                onCancel={() => setEditUser(null)}
                                isEditing={true}
                            />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-gray-700">
                                    Are you sure you want to delete the user with ID{" "}
                                    <strong>{deleteUserId}</strong>? This action cannot be undone.
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