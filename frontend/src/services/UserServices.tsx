import { httpPut, httpGet, httpPost } from "../utils/http";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
}

export interface UploadAvatarRequest {
  avatar: File;
}

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

class UserServices {
  async updateProfileAsync(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await httpPut<UpdateProfileResponse>("accounts/profile", profileData);
    return response;
  }

  async getProfileAsync(): Promise<UpdateProfileResponse> {
    const response = await httpGet<UpdateProfileResponse>("accounts/profile");
    return response;
  }

  async uploadAvatarAsync(avatarFile: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await httpPost<{ avatarUrl: string }>("accounts/avatar", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }
}

export const userServices = new UserServices();
