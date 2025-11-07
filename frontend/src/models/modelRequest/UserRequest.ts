// User Request Models

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
}

export interface UploadAvatarRequest {
  avatar: File;
}

export interface UpdateAccountRequest {
  id: number;
  username: string;
  email: string;
  phone: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}
