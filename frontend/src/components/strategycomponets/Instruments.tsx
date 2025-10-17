import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

const Instruments: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Select Instruments</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-[150px] h-[100px] flex flex-col justify-center items-center">
                    <PlusCircle className="mb-2 h-12 w-12" />
                    <div>Add Instruments</div>
                </Button>
            </CardContent>
        </Card>
    );
};

export default Instruments;