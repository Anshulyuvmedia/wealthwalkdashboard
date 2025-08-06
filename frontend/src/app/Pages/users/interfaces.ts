export interface TdUser {
    id: string;
    email: string;
    contactName: string;
    password: string;
    userType: "admin" | "user";
    status: "active" | "inactive";
    phoneVerified: boolean;
    city?: string;
    state?: string;
    country?: string;
    lastLogin?: string;
    username?: string;
    planId?: string;
    profileImage?: string;
}

export interface UserFormData extends Partial<TdUser> {
    password?: string;
    profileImageFile?: File;
}