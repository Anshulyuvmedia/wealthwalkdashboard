import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { TdCourse } from "./types";
import { IconEdit } from '@tabler/icons-react';
// Columns definition for the course data table
export const columns: ColumnDef<TdCourse>[] = [
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
        accessorKey: "coverImage",
        header: "Cover",
        cell: ({ row }) => {
            const imageUrl = row.getValue("coverImage") as string | undefined;
            const fullUrl = imageUrl
                ? imageUrl.startsWith("http")
                    ? imageUrl
                    : `http://localhost:3000/Uploads/${imageUrl}`
                : undefined;
            return fullUrl ? (
                <img
                    src={fullUrl}
                    alt="Course Cover"
                    className="h-10 w-10 rounded object-cover"
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
        accessorKey: "courseName",
        header: "Name",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "instructorName",
        header: "Instructor",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "pricing",
        header: "Price",
        cell: ({ getValue }) => {
            const price = getValue() as number;
            return price === 0 ? "Free" : `$${price.toFixed(2)}`;
        },
    },
    {
        accessorKey: "level",
        header: "Level",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "language",
        header: "Language",
        cell: ({ getValue }) => getValue() || "N/A",
    },
    {
        accessorKey: "isPublished",
        header: "Published",
        cell: ({ row }) => {
            const course = row.original;
            return <span>{course.isPublished ? "Published" : "Unpublished"}</span>;
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ getValue }) => {
            const rating = getValue() as number;
            return rating === 0 ? "N/A" : rating.toFixed(1);
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const course = row.original;
            // console.log("Course in actions:", course); // Add logging
            if (!course.id) {
                console.error("Course ID is undefined:", course);
                return <Button variant="outline" size="sm" disabled>Edit (No ID)</Button>;
            }
            return (
                <Link to={`/courses/${course.id}`} className="text-green-600 hover:text-green-800">
                    <Button variant="outline" size="sm">
                        <IconEdit stroke={2} /> Edit
                    </Button>
                </Link>
            );
        },
    }
];