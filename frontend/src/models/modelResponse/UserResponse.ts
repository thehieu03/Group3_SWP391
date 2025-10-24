// User Response Models

export interface UpdateProfileResponse {
  id: number;
  username: string;
  email: string;
  phone?: string;
  balance?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface UserForAdmin {
  id: number;
  username: string;
  email: string;
  phone: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface PaginatedUsersResponse {
  items: UserForAdmin[];
  total: number;
}
