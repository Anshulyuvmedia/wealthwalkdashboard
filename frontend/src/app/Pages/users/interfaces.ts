export interface TdUser {
    id: string;
    contactName: string;
    email: string;
    phone: string;
    username?: string;
    password?: string;
    userType: string;
    status: "active" | "inactive";
    phoneVerified: boolean;
    isTermsAgreed: boolean;
    twoFaEnabled?: boolean;
    city?: string;
    state?: string;
    country?: string;
    referrald?: string;
    planId?: string;
    expiryDate?: string;
    endDate?: string;
    profileImage?: string;
    files?: Array<{ path: string; type: string; uploadedAt: string }>;
    lastLogin?: string;
    otp?: string;
    otpExpiry?: string;
    codeCreatedAt?: string;
    isTemporary?: boolean;
}

export interface UserFormData {
    contactName?: string;
    email?: string;
    phone?: string;
    username?: string;
    password?: string;
    userType?: string;
    status?: "active" | "inactive";
    phoneVerified?: boolean;
    isTermsAgreed?: boolean;
    twoFaEnabled?: boolean;
    city?: string;
    state?: string;
    country?: string;
    referrald?: string;
    planId?: string;
    expiryDate?: string;
    endDate?: string;
    profileImageFile?: File;
    profileImage?: string;
    fileType?: string;
}