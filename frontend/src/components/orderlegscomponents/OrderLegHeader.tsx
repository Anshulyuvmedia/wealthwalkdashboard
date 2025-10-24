// src/components/OrderLegHeader.tsx
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface OrderLegHeaderProps {
    selectedTemplate: string;
}

export const OrderLegHeader: React.FC<OrderLegHeaderProps> = ({ selectedTemplate }) => {
    return (
        <CardHeader>
            <div className="flex items-center justify-between w-full space-x-2">
                <CardTitle className="text-lg">Order Legs: {selectedTemplate}</CardTitle>
                {/* <Button variant="default" className="flex items-center">
                    <span>Add Leg</span>
                    <PlusCircle className="h-4 w-4 ml-2" />
                </Button> */}
            </div>
        </CardHeader>
    );
};