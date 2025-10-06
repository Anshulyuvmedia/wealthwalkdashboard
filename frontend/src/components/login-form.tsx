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

interface AdminUser {
  id: string;
  email: string;
  contactName: string;
  userType: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
  username?: string;
  phone?: string;
  phoneVerified?: boolean;
  isTermsAgreed?: boolean;
  referrald?: string;
  planId?: string;
  ipAddress?: string;
  twoFaEnabled?: boolean;
  profileImage?: string;
  expiryDate?: string;
  endDate?: string;
  emailVerified?: boolean;
  lastLogin?: string;
}

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newOtp, setNewOtp] = useState<string>("");
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:3000/api";

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Email Login Form Data:', { email, password });

      const loginResponse: AxiosResponse<{ user: AdminUser; token: { id: string; userId: string; ttl: number; created: string } }> =
        await axios.post(`${API_BASE_URL}/TdUsers/loginWithPassword`, {
          email,
          password,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      if (loginResponse.status === 200) {
        const { user, token } = loginResponse.data;
        console.log('Email Login Response:', JSON.stringify(loginResponse.data, null, 2));
        console.log('User Data:', JSON.stringify(user, null, 2));

        localStorage.setItem("adminToken", JSON.stringify(token));
        localStorage.setItem("admin", JSON.stringify(user));

        toast.success("✅ Login Successful", {
          description: "Welcome back!",
          action: {
            label: "❌",
            onClick: () => toast.dismiss(),
          },
        });

        navigate("/");
      } else {
        throw new Error("Invalid credentials.");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "Please try again later.";
      type ErrorResponse = { error?: { message?: string; details?: { messages?: { [key: string]: string[] } } } };
      const data = axiosError.response?.data as ErrorResponse | undefined;
      if (data && typeof data === "object" && data.error) {
        if (data.error.message) {
          errorMessage = data.error.message;
        }
        if (data.error.details?.messages) {
          errorMessage += ` Details: ${Object.values(data.error.details.messages).flat().join(", ")}`;
        }
      }
      console.error("Email Login error:", axiosError.response?.data || axiosError);
      toast.error("❌ Email Login Failed", {
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

  const handleGenerateOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Generate OTP Form Data:', { phone });

      const response: AxiosResponse<{ success: boolean; message: string; otp: string; expiry: string }> =
        await axios.post(`${API_BASE_URL}/TdUsers/loginGenerateOtp`, {
          phone,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      console.log('Generate OTP Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.success) {
        setIsOtpSent(true);
        setNewOtp(response.data.otp);
        setOtpExpiry(response.data.expiry);
        toast.success("✅ OTP Generated", {
          description: "Please enter the OTP displayed below.",
          action: {
            label: "❌",
            onClick: () => toast.dismiss(),
          },
        });
      } else {
        console.log('Unexpected OTP response:', JSON.stringify(response.data, null, 2));
        throw new Error(response.data.message || "Failed to generate OTP.");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "Unable to generate OTP. Please try again.";
      type ErrorResponse = { error?: { message?: string } };
      const data = axiosError.response?.data as ErrorResponse | undefined;
      if (data && typeof data === "object" && data.error?.message) {
        errorMessage = data.error.message;
      }
      console.error("Generate OTP error:", axiosError.response?.data || axiosError);
      toast.error("❌ OTP Generation Failed", {
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

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Verify OTP Form Data:', { phone, otp });

      const response: AxiosResponse<{ user: AdminUser; token: { id: string; userId: string; ttl: number; created: string } }> =
        await axios.post(`${API_BASE_URL}/TdUsers/loginVerifyOtp`, {
          phone,
          otp,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      console.log('Verify OTP Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.user && response.data.token) {
        const { user, token } = response.data;
        localStorage.setItem("adminToken", JSON.stringify(token));
        localStorage.setItem("admin", JSON.stringify(user));

        toast.success("✅ Login Successful", {
          description: "Welcome back!",
          action: {
            label: "❌",
            onClick: () => toast.dismiss(),
          },
        });

        navigate("/");
      } else {
        console.log('Unexpected verify OTP response:', JSON.stringify(response.data, null, 2));
        throw new Error("Invalid OTP response.");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "Invalid OTP. Please try again.";
      type ErrorResponse = { error?: { message?: string } };
      const data = axiosError.response?.data as ErrorResponse | undefined;
      if (data && typeof data === "object" && data.error?.message) {
        errorMessage = data.error.message;
      }
      console.error("Verify OTP error:", axiosError.response?.data || axiosError);
      toast.error("❌ OTP Verification Failed", {
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

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setIsOtpSent(false);
    setNewOtp("");
    setOtpExpiry(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome to Wealth Walk</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Admin Account
                </p>
                <Button
                  variant="outline"
                  onClick={toggleLoginMethod}
                  className="mt-4"
                >
                  Switch to {loginMethod === "email" ? "Phone & OTP" : "Email & Password"}
                </Button>
              </div>

              {loginMethod === "email" ? (
                <form onSubmit={handleEmailLogin}>
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

                  <div className="grid gap-3 mt-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              ) : (
                <div>
                  {!isOtpSent ? (
                    <form onSubmit={handleGenerateOtp}>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? "Generating OTP..." : "Generate OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp}>
                      <div className="grid gap-3">
                        <Label>OTP</Label>
                        <p className="text-sm text-muted-foreground">
                          Enter the 6-digit OTP displayed below for {phone}
                        </p>
                        <p className="text-sm font-medium">OTP: {newOtp}</p>
                        <Input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={
                          loading ||
                          (otpExpiry ? new Date() > new Date(otpExpiry) : false)
                        }
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      {otpExpiry && new Date() > new Date(otpExpiry) && (
                        <p className="text-sm text-red-500 mt-2">OTP expired. Please request a new one.</p>
                      )}
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

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
