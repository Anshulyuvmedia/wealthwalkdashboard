import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault(); // Prevent page reload
  //   setLoading(true);
  //   try {
  //     // const response = await axios.post(
  //     //   "http://192.168.1.159:3000/api/admin/login",
  //     //   { email, password }
  //     // );

  //     if (response.status === 200) {
  //       // Save admin to localStorage
  //       localStorage.setItem("admin", JSON.stringify(response.data.admin));

  //       toast.success("✅ Login Successful", {
  //         description: "Welcome back!",
  //         action: {
  //           label: "❌",
  //           onClick: () => toast.dismiss(),
  //         },
  //       });

  //       // Redirect to dashboard
  //       navigate("/");
  //     } else {
  //       toast.error("❌ Login failed.", {
  //         description: "Invalid credentials.",
  //         action: {
  //           label: "❌",
  //           onClick: () => toast.dismiss(),
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     toast.error("❌ Something went wrong.", {
  //       description: "Please try again later.",
  //       action: {
  //         label: "❌",
  //         onClick: () => toast.dismiss(),
  //       },
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome to Victory Vision</h1>
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
                  placeholder="m@example.com"
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
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
