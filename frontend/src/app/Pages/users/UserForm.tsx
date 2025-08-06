import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TdUser, UserFormData } from "./interfaces";

export function UserForm({
    user,
    onSubmit,
    onCancel,
    isEditing,
}: {
    user: TdUser | null;
    onSubmit: (formData: UserFormData) => void;
    onCancel: () => void;
    isEditing: boolean;
}) {
    const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(
        user?.profileImage || null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setProfileImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData: UserFormData = {
            contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value || undefined,
            userType: (form.elements.namedItem("userType") as HTMLSelectElement).value as "admin" | "user",
            status: (form.elements.namedItem("status") as HTMLInputElement).checked ? "active" : "inactive",
            phoneVerified: (form.elements.namedItem("phoneVerified") as HTMLInputElement).checked,
            city: (form.elements.namedItem("city") as HTMLInputElement).value || undefined,
            state: (form.elements.namedItem("state") as HTMLInputElement).value || undefined,
            country: (form.elements.namedItem("country") as HTMLInputElement).value || undefined,
            username: (form.elements.namedItem("username") as HTMLInputElement).value || undefined,
            planId: (form.elements.namedItem("planId") as HTMLInputElement).value || undefined,
            profileImageFile: (form.elements.namedItem("profileImageFile") as HTMLInputElement).files?.[0],
        };
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                        Full Name *
                    </Label>
                    <Input
                        id="contactName"
                        name="contactName"
                        defaultValue={user?.contactName || ""}
                        placeholder="Enter full name"
                        className="mt-1"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email *
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        placeholder="Enter email"
                        className="mt-1"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password {isEditing ? "(Leave blank to keep existing)" : "*"}
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        className="mt-1"
                        required={!isEditing}
                    />
                </div>
                <div>
                    <Label htmlFor="userType" className="text-sm font-medium text-gray-700">
                        User Type *
                    </Label>
                    <Select name="userType" defaultValue={user?.userType || "user"} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status *
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                        <Switch
                            id="status"
                            name="status"
                            defaultChecked={user?.status === "active"}
                        />
                        <span>{user?.status === "active" ? "Active" : "Inactive"}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="phoneVerified" className="text-sm font-medium text-gray-700">
                        Phone Verified
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                        <Switch
                            id="phoneVerified"
                            name="phoneVerified"
                            defaultChecked={user?.phoneVerified || false}
                        />
                        <span>{user?.phoneVerified ? "Verified" : "Not Verified"}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City (Optional)
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        defaultValue={user?.city || ""}
                        placeholder="Enter city"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State (Optional)
                    </Label>
                    <Input
                        id="state"
                        name="state"
                        defaultValue={user?.state || ""}
                        placeholder="Enter state"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country (Optional)
                    </Label>
                    <Input
                        id="country"
                        name="country"
                        defaultValue={user?.country || ""}
                        placeholder="Enter country"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                        Username (Optional)
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        defaultValue={user?.username || ""}
                        placeholder="Enter username"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="planId" className="text-sm font-medium text-gray-700">
                        Plan ID (Optional)
                    </Label>
                    <Input
                        id="planId"
                        name="planId"
                        defaultValue={user?.planId || ""}
                        placeholder="Enter plan ID"
                        className="mt-1"
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor="profileImageFile" className="text-sm font-medium text-gray-700">
                        Profile Image (Optional)
                    </Label>
                    <Input
                        id="profileImageFile"
                        name="profileImageFile"
                        type="file"
                        accept="image/*"
                        className="mt-1"
                        onChange={handleFileChange}
                    />
                    {profileImagePreview && (
                        <div>
                            <img
                                src={profileImagePreview}
                                alt="Profile Preview"
                                className="mt-2 h-20 w-20 rounded-full object-cover"
                            />
                            {user?.profileImage && (
                                <p className="text-gray-500 mt-2 text-sm">{user.profileImage}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    {isEditing ? "Update User" : "Create User"}
                </Button>
            </div>
        </form>
    );
}