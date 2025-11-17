import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: any[];
    data: TData[];
    isLoading: boolean;
    meta?: any;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    meta,
}: DataTableProps<TData, TValue>) {
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const totalItems = data.length;

    // Clamp pageIndex when data length changes
    React.useEffect(() => {
        const maxPageIndex = Math.max(
            0,
            Math.ceil(totalItems / pagination.pageSize) - 1
        );

        if (pagination.pageIndex > maxPageIndex) {
            setPagination((prev) => ({
                ...prev,
                pageIndex: maxPageIndex,
            }));
        }
    }, [totalItems, pagination.pageIndex, pagination.pageSize]);

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta,
    });

    const currentPageIndex = table.getState().pagination.pageIndex;
    const currentPageSize = table.getState().pagination.pageSize;

    const pageStart =
        totalItems === 0 ? 0 : currentPageIndex * currentPageSize + 1;
    const pageEnd =
        totalItems === 0
            ? 0
            : Math.min(totalItems, (currentPageIndex + 1) * currentPageSize);

    return (
        <div className="space-y-4">
            {/* Total Count Display */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                    {isLoading ? (
                        <span>Loading strategies...</span>
                    ) : (
                        <span>
                            <strong className="text-gray-100 font-semibold">
                                {totalItems}
                            </strong>{" "}
                            total strateg{totalItems === 1 ? "y" : "ies"}
                        </span>
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    Page {currentPageIndex + 1} of {table.getPageCount() || 1}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-gray-700 dark:border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-800"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-gray-200 font-semibold"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                    <p className="mt-2 text-gray-400">Loading strategies...</p>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-gray-750 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-gray-500"
                                >
                                    No strategies found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {totalItems === 0 ? (
                        <>Showing 0 strategies</>
                    ) : (
                        <>
                            Showing {pageStart}–{pageEnd} of {totalItems} strategies
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
