"use client";

import * as React from "react";
import { IconDeviceLaptop, IconUsers, IconCurrencyRupee, IconLayoutDashboard, IconBroadcast } from "@tabler/icons-react";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { NavSubmenu } from "@/components/nav-submenu"; // Import the new component

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconLayoutDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: IconDeviceLaptop,
    },
    {
      title: "Plans",
      url: "/plans",
      icon: IconCurrencyRupee,
    },
    {
      title: "Signals",
      url: "#",
      icon: IconBroadcast,
      items: [
        {
          title: "Paid Signals",
          url: "/paidsignals",
        },
        {
          title: "Free Signals", // Fixed title to match URL (was "Archived")
          url: "/freesignals",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <img
                  src="/wealthwalklogo.png"
                  alt="Image"
                  className="size-8 rounded-lg"
                />
                <span className="text-base font-semibold">Wealth Walk</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Render navMain items: flat if no items, submenu if items exist */}
          {data.navMain.map((item, index) => {
            const Icon = item.icon;

            if (item.items && item.items.length > 0) {
              // Render as submenu
              return (
                <NavSubmenu
                  key={index}
                  title={item.title}
                  icon={Icon}
                  items={item.items}
                  isActive={false} // Default to closed; set true if needed for specific items
                />
              );
            } else {
              // Render as flat item
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}