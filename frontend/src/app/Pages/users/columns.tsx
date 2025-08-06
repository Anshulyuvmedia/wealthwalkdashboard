import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IconTrashX, IconEdit } from "@tabler/icons-react";
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
        header: "Action",
        cell: ({ row, table }) => {
            const user = row.original;
            const { setEditUser, setDeleteUserId } = table.options.meta as {
                setEditUser: (user: TdUser | null) => void;
                setDeleteUserId: (id: string | null) => void;
            };
            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditUser(user);
                        }}
                        className="border-green-300 text-green-300 hover:bg-gray-100"
                    >
                        <IconEdit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button
                        // variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteUserId(user.id);
                        }}
                        className="bg-red-600 hover:bg-red-900 text-white"
                    >
                        <IconTrashX className="mr-1 h-4 w-4" /> Delete
                    </Button>
                </div>
            );
        },
    },
];