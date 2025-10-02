// Updated Signals.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "./DataTable";
import { getColumns } from "./Columns";
import type { TdSignal } from "./types";
import { mockSignals } from "./mockData";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface SignalsProps {
    signalType: string;
}

const Signals = ({ signalType }: SignalsProps) => {
    const navigate = useNavigate();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [selectedSignalId, setSelectedSignalId] = React.useState<number | null>(null);

    const fullData: TdSignal[] = mockSignals;
    const filteredData = fullData.filter(item => item.signalType === signalType);
    const addPath = signalType === 'Paid' ? '/paidsignals/add' : '/freesignals/add';

    const handleOpenDelete = (id: number) => {
        setSelectedSignalId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (selectedSignalId) {
            // Simulate delete - filter out from mock
            const updatedData = fullData.filter(item => item.id !== selectedSignalId);
            // In real app, update mockSignals or refetch
            toast.success('Signal deleted successfully!');
            console.log('Deleted signal with id:', selectedSignalId);
        }
        setOpenDeleteDialog(false);
        setSelectedSignalId(null);
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setSelectedSignalId(null);
    };

    return (
        <SidebarProvider style={
            {
                "--sidebar-width": "calc(var(--spacing) * 50)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Signals" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{signalType} Signals</h1>
                        <Button
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => navigate(addPath)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add New Signal
                        </Button>
                    </div>
                    <DataTable columns={getColumns(signalType.toLowerCase(), handleOpenDelete)} data={filteredData} />
                </div>
                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this signal? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Signals