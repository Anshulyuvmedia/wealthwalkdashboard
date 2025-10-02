"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
interface NavSubmenuProps {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    items: { title: string; url: string }[];
    isActive?: boolean;
}

export function NavSubmenu({ title, icon: Icon, items, isActive = false }: NavSubmenuProps) {
    const [isOpen, setIsOpen] = React.useState(isActive);

    return (
        <SidebarMenuItem>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                        <div className="flex">
                            {Icon && <Icon className="h-4 w-4 me-2" />}
                            <span>{title}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-2">
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link to={item.url}>{item.title}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}