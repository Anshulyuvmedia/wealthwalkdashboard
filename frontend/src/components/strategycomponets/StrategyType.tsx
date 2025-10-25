import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StrategyTypeProps {
    strategyType: "timebased" | "indicatorbased";
    setStrategyType: React.Dispatch<React.SetStateAction<"timebased" | "indicatorbased">>;
    isEditMode?: boolean; // New prop to disable in edit mode
}

const StrategyType: React.FC<StrategyTypeProps> = ({ strategyType, setStrategyType, isEditMode = false }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Strategy Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="lg"
                    value={strategyType}
                    onValueChange={(val) => val && setStrategyType(val as "timebased" | "indicatorbased")}
                    disabled={isEditMode} // Disable when in edit mode
                >
                    <ToggleGroupItem value="timebased" className="text-xs">
                        Time Based
                    </ToggleGroupItem>
                    <ToggleGroupItem value="indicatorbased" className="text-xs">
                        Indicator Based
                    </ToggleGroupItem>
                </ToggleGroup>
            </CardContent>
        </Card>
    );
};

export default StrategyType;