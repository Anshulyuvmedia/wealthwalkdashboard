import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface SiteHeaderProps {
  title: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optional: Send logout request to invalidate token on server
      await axios.post("http://192.168.1.159:3000/api/TdUsers/logout", {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("adminToken") || '{}').id}`
        },
      });

      // Clear local storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: Clear local storage and redirect even if server call fails
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    }
  };

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("admin") || '{}');
  const contactName = userData.contactName || "Guest";
  const userType = userData.userType || "Unknown";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div>
            {contactName} ({userType})
          </div>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex" onClick={handleLogout}>
            <span className="dark:text-foreground">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}