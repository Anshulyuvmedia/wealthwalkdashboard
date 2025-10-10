import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Users, Video, FileText, LineChart } from "lucide-react";

const cardData = [
  { title: "Users", icon: <Users color="#FF6B6B" />, path: "/users" }, // Red
  { title: "Courses", icon: <Video color="#4ECDC4" />, path: "/courses" }, // Teal
  { title: "Packages", icon: <FileText color="#45B7D1" />, path: "/plans" }, // Light Blue
  { title: "Signals", icon: <LineChart color="#F7D794" />, path: "/paidsignals" }, // Light Yellow
];

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 50)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div
          className="flex flex-1 flex-col p-4 md:p-6"
          style={{
            backgroundImage: `url('./background-dark.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="@container/main flex flex-1 flex-col gap-2 items-center justify-center">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-lg">
              <SectionCards cards={cardData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}