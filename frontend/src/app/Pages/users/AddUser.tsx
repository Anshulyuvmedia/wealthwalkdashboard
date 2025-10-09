"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import apiService from "@/app/Pages/users/apiService";
import type { UserFormData } from "@/app/Pages/users/interfaces";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AddUser() {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState<UserFormData>({
        userType: "user",
        status: "active",
        country: "IN",
        planId: "basicplan",
        isTermsAgreed: true,
        phoneVerified: false,
        twoFaEnabled: false,
        fileType: "profiles", // Default file type
    });
    const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSwitchChange = (name: string, value: boolean | string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit");
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                toast.error("Only JPEG, PNG, and GIF files are allowed");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setFormData(prev => ({
                ...prev,
                profileImageFile: file
            }));
        } else {
            setProfileImagePreview(null);
            setFormData(prev => ({ ...prev, profileImageFile: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.contactName || !formData.email || !formData.phone || !formData.password) {
            toast.error("Please fill in all required fields: Name, Email, Phone, Password");
            return;
        }
        try {
            await apiService.createUser(formData);
            toast.success("User created successfully!");
            navigate("/users");
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error(error.response?.data?.error?.message || "Failed to create user");
        }
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 50)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Add User" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <h1 className="text-3xl font-bold">Add New User</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="contactName">Full Name *</Label>
                                <Input
                                    id="contactName"
                                    name="contactName"
                                    value={formData.contactName || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter email"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="userType">User Type *</Label>
                                <Select
                                    name="userType"
                                    value={formData.userType || "user"}
                                    onValueChange={(value) =>
                                        handleInputChange({ target: { name: 'userType', value } } as any)
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select user type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status *</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch
                                        id="status"
                                        checked={formData.status === "active"}
                                        onCheckedChange={(checked) =>
                                            handleSwitchChange("status", checked ? "active" : "inactive")
                                        }
                                    />
                                    <span>{formData.status === "active" ? "Active" : "Inactive"}</span>
                                </div>
                            </div>
                            <div>
                                <Label>Phone Verified</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch
                                        id="phoneVerified"
                                        checked={formData.phoneVerified || false}
                                        onCheckedChange={(checked) => handleSwitchChange("phoneVerified", checked)}
                                    />
                                    <span>{formData.phoneVerified ? "Verified" : "Not Verified"}</span>
                                </div>
                            </div>

                            <div>
                                <Label>2FA Enabled</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch
                                        id="twoFaEnabled"
                                        checked={formData.twoFaEnabled || false}
                                        onCheckedChange={(checked) => handleSwitchChange("twoFaEnabled", checked)}
                                    />
                                    <span>{formData.twoFaEnabled ? "Enabled" : "Disabled"}</span>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="city">City (Optional)</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter city"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">State (Optional)</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter state"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Country (Optional)</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country || "IN"}
                                    onChange={handleInputChange}
                                    placeholder="Enter country"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="referrald">Referral Code (Optional)</Label>
                                <Input
                                    id="referrald"
                                    name="referrald"
                                    value={formData.referrald || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter referral code"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="username">Username (Optional)</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="planId">Plan ID (Optional)</Label>
                                <Select
                                    name="planId"
                                    value={formData.planId || "basicplan"}
                                    onValueChange={(value) =>
                                        handleInputChange({ target: { name: 'planId', value } } as any)
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select plan ID" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basicplan">Basic Plan</SelectItem>
                                        <SelectItem value="proplan">Pro Plan</SelectItem>
                                        <SelectItem value="enterpriceplan">Enterprice Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div >
                                <Label htmlFor="profileImageFile">Image Upload (Optional)</Label>
                                <Input
                                    id="profileImageFile"
                                    name="profileImageFile"
                                    type="file"
                                    accept="image/*"
                                    className="mt-1"
                                    onChange={handleFileChange}
                                />
                                {profileImagePreview && (
                                    <img
                                        src={profileImagePreview}
                                        alt="Image Preview"
                                        className="mt-2 h-20 w-20 rounded-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/users")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}