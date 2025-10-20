import { httpPut, httpGet, httpPost, httpDelete } from "../utils/http";

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

  async getAllUsersForAdminAsync(
    searchTerm?: string,
    roleFilter?: string
  ): Promise<UserForAdmin[]> {
    let queryParams = '';
    const params = new URLSearchParams();

    if (searchTerm && searchTerm.trim()) {
      params.append(
        '$filter',
        `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`
      );
    }

    if (roleFilter && roleFilter !== 'ALL') {
      const existingFilter = params.get('$filter');
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;

      if (existingFilter) {
        params.set('$filter', `(${existingFilter}) and (${roleFilterQuery})`);
      } else {
        params.append('$filter', roleFilterQuery);
      }
    }

    if (params.toString()) {
      queryParams = '?' + params.toString();
    }

    const response = await httpGet<UserForAdmin[]>(`accounts${queryParams}`);
    return response;
  }

  async getUsersPagedAsync(
    page: number,
    pageSize: number,
    searchTerm?: string,
    roleFilter?: string
  ): Promise<{ items: UserForAdmin[]; total: number }> {
    const params = new URLSearchParams();

    // OData paging
    const skip = Math.max(0, (page - 1) * pageSize);
    params.set('$top', String(pageSize));
    params.set('$skip', String(skip));
    params.set('$count', 'true');

    // OData filters
    let filter = '';
    if (searchTerm && searchTerm.trim()) {
      filter = `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`;
    }
    if (roleFilter && roleFilter !== 'ALL') {
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;
      filter = filter ? `(${filter}) and (${roleFilterQuery})` : roleFilterQuery;
    }
    if (filter) params.set('$filter', filter);

    const query = params.toString() ? `?${params.toString()}` : '';

    // Backend may return OData { value: [], @odata.count: n } or plain array
    const res = await httpGet<{ value: UserForAdmin[]; '@odata.count': number } | UserForAdmin[]>(`accounts${query}`);
    if (res && typeof res === 'object' && 'value' in res && Array.isArray(res.value)) {
      return { items: res.value, total: res['@odata.count'] ?? res.value.length };
    }
    // Fallback for non-odata list
    const list = Array.isArray(res) ? res : [];
    return { items: list, total: list.length };
  }

  async updateAccountAsync(accountId: number, accountData: UpdateAccountRequest): Promise<UserForAdmin> {
    console.log('Sending update request to:', `accounts/${accountId}`);
    console.log('Request payload:', accountData);
    
    const response = await httpPut<UserForAdmin>(`accounts/${accountId}`, accountData);
    console.log('Update response:', response);
    return response;
  }

  async deleteAccountAsync(accountId: number): Promise<void> {
    await httpDelete<void>(`accounts/${accountId}`);
  }
}

export const userServices = new UserServices();
