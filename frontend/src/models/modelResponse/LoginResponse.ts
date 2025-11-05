export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  balance: number;
  // Backend now returns URL for avatar image
  imageUrl?: string;
  avatarUrl?: string;
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
