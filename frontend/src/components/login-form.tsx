import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Define the shape of the admin user data
interface AdminUser {
  email: string;
  id: number;
  contactName: string;
  userType: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
  username?: string;
  phoneVerified?: boolean;
  isTermsAgreed?: boolean;
  referrald?: string;
  planId?: string;
  ipAddress?: string;
  twoFaEnabled?: boolean;
  profileImage?: string;
  expairyDate?: string;
  endDate?: string;
  emailVerified?: boolean;
  lastLogin?: string;
}

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);

    try {
      console.log('Form Data:', email, password);

      // Step 1: Login to get token
      const loginResponse: AxiosResponse<{ id: string; userId: string; ttl: number; created: string }> =
        await axios.post("http://localhost:3000/api/TdUsers/login", {
          email,
          password,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      if (loginResponse.status === 200) {
        const { id, userId, ttl, created } = loginResponse.data;
        console.log('Login Response:', JSON.stringify(loginResponse.data));

        // Step 2: Fetch full user data using userId
        const userResponse: AxiosResponse<AdminUser> = await axios.get(
          `http://localhost:3000/api/TdUsers/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${id}`, // Use token for authentication
            },
          }
        );

        const userData: AdminUser = userResponse.data;
        console.log('User Data:', JSON.stringify(userData));

        // Step 3: Save token and user data to localStorage
        localStorage.setItem("adminToken", JSON.stringify({ id, userId, ttl, created }));
        localStorage.setItem("admin", JSON.stringify(userData));

        toast.success("✅ Login Successful", {
          description: "Welcome back!",
          action: {
            label: "❌",
            onClick: () => toast.dismiss(),
          },
        });

        // Redirect to dashboard
        navigate("/");
      } else {
        toast.error("❌ Login failed.", {
          description: "Invalid credentials.",
          action: {
            label: "❌",
            onClick: () => toast.dismiss(),
          },
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "Please try again later.";
      type ErrorResponse = { error?: { message?: string } };
      const data = axiosError.response?.data as ErrorResponse | undefined;
      if (data && typeof data === "object" && data.error && typeof data.error === "object" && data.error.message) {
        errorMessage = data.error.message;
      }
      toast.error("❌ Something went wrong.", {
        description: errorMessage,
        action: {
          label: "❌",
          onClick: () => toast.dismiss(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome to Wealth Walk</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Admin Account
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/wealthwalklogo.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[1]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}