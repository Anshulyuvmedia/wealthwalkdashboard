import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { TdUser } from "./interfaces";

export const columns: ColumnDef<TdUser>[] = [
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