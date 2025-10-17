import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch, } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Trash2, ChevronRight, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
const ExitConditions: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Switch id="exitConditions" />
                    <Label htmlFor="exitConditions">Exit conditions (Optional)</Label>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="space-y-2">
                                    <div className="text-green-600 font-medium text-center">Long Exit Condition</div>
                                    <div className="grid grid-cols-3 gap-2 w-full">
                                        <div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select indicator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                        <div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select comparator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                        <div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select indicator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-3">
                                    <div className="text-red-600 font-medium text-center">Short Exit Condition</div>
                                    <div className="flex space-x-2 w-full">
                                        <div className="flex-1 w-full">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select indicator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select comparator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer">
                                                        <span>Select indicator</span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>{/* Future unique content */}</DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Trash2 size={20} className="text-red-600 cursor-pointer" />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex items-center w-full space-x-2">
                    <Separator className="flex-1" />
                    <ToggleGroup type="single" variant="outline" size="lg">
                        <ToggleGroupItem className="text-xs" value="and">AND</ToggleGroupItem>
                        <ToggleGroupItem className="text-xs" value="or">OR</ToggleGroupItem>
                    </ToggleGroup>
                    <Separator className="flex-1" />
                </div>
                <div className="w-full flex justify-center">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Condition</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ExitConditions;