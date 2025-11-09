export interface User {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    balance: number | null;
    isActive: boolean | null;
    createdAt: string | null;
    roles: string[];
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
}
