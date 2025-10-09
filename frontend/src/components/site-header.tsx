import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface SiteHeaderProps {
  title: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const adminToken = JSON.parse(localStorage.getItem("adminToken") || "{}");
      if (!adminToken?.id) {
        throw new Error("No valid token found");
      }

      // Use Vite's environment variable system, ensuring no duplicate /api
      const apiUrl = "http://localhost:3000";
      const logoutUrl = `${apiUrl}/api/TdUsers/logout`;
      console.log("Logout request URL:", logoutUrl);
      console.log("Logout request token:", adminToken.id);

      await axios.post(
        logoutUrl,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken.id}`,
          },
        }
      );

      console.log("Logout API call successful");
      toast.success("Logged out successfully");

      // Clear local storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out from server, but session cleared locally");
      // Clear local storage and redirect even if API call fails
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user data from localStorage with fallback
  const userData = JSON.parse(localStorage.getItem("admin") || "{}");
  const contactName = userData.contactName || "Guest";
  const userType = userData.userType || "Unknown";

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
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
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 8v4a8 8 0 01-8 8 8 8 0 008-8z"
                  />
                </svg>
                Logging out...
              </span>
            ) : (
              <span className="dark:text-foreground">Logout</span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}