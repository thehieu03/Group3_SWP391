export interface User {
    id: number;
    username: string;
    email: string;
    phone: string;
    balance: number;
    avatarBase64?: string;
    isActive: boolean;
    createdAt: string;
    roles: string[];
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
}
