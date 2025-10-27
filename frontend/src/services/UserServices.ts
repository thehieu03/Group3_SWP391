import { httpPut, httpGet, httpPost, httpDelete } from "@utils/http.ts";
import type {
  UpdateProfileRequest,
  UpdateAccountRequest,
  UpdateProfileResponse,
  UserForAdmin,
  PaginatedUsersResponse,
} from "../models";

class UserServices {
  async updateProfileAsync(
    profileData: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const response = await httpPut<UpdateProfileResponse>(
      "accounts/profile",
      profileData
    );
    return response;
  }

  async getProfileAsync(): Promise<UpdateProfileResponse> {
    const response = await httpGet<UpdateProfileResponse>("accounts/profile");
    return response;
  }

  async uploadAvatarAsync(avatarFile: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await httpPost<{ avatarUrl: string }>(
      "accounts/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  }

  async getAllUsersForAdminAsync(
    searchTerm?: string,
    roleFilter?: string
  ): Promise<UserForAdmin[]> {
    const queryParts: string[] = [];

    if (searchTerm && searchTerm.trim()) {
      const filter = `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`;
      queryParts.push(`$filter=${encodeURIComponent(filter)}`);
    }

    if (roleFilter && roleFilter !== "ALL") {
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;
      if (queryParts.length > 0 && queryParts[0].startsWith("$filter=")) {
        // Append to existing filter
        const existingFilter = queryParts[0].substring(8); // Remove '$filter='
        queryParts[0] = `$filter=${encodeURIComponent(
          `(${decodeURIComponent(existingFilter)}) and (${roleFilterQuery})`
        )}`;
      } else {
        queryParts.push(`$filter=${encodeURIComponent(roleFilterQuery)}`);
      }
    }

    const queryParams = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const response = await httpGet<UserForAdmin[]>(`accounts${queryParams}`);
    return response;
  }

  async getAllUsersForPaginationAsync(
    searchTerm?: string,
    roleFilter?: string,
    sortOrder?: "asc" | "desc",
    usernameSearch?: string,
    emailSearch?: string,
    isActive?: boolean
  ): Promise<UserForAdmin[]> {
    const queryParts: string[] = [];

    let filter = "";

    if (usernameSearch && usernameSearch.trim()) {
      filter = `contains(username, '${usernameSearch.trim()}')`;
    }

    if (emailSearch && emailSearch.trim()) {
      const emailFilter = `contains(email, '${emailSearch.trim()}')`;
      filter = filter ? `(${filter}) and (${emailFilter})` : emailFilter;
    }

    if (!filter && searchTerm && searchTerm.trim()) {
      filter = `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`;
    }

    if (roleFilter && roleFilter !== "ALL") {
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;
      filter = filter
        ? `(${filter}) and (${roleFilterQuery})`
        : roleFilterQuery;
    }

    if (isActive !== undefined) {
      const activeFilter = `isActive eq ${isActive}`;
      filter = filter ? `(${filter}) and (${activeFilter})` : activeFilter;
    }

    if (filter) {
      queryParts.push(`$filter=${encodeURIComponent(filter)}`);
    }

    if (sortOrder) {
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";
      queryParts.push(`$orderby=createdAt ${sortDirection}`);
    }

    const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const res = await httpGet<UserForAdmin[]>(`accounts${query}`);
    return Array.isArray(res) ? res : [];
  }

  async getUsersPagedAsync(
    page: number,
    pageSize: number,
    searchTerm?: string,
    roleFilter?: string,
    sortOrder?: "asc" | "desc",
    usernameSearch?: string,
    emailSearch?: string,
    isActive?: boolean
  ): Promise<PaginatedUsersResponse> {
    // Fetch all users from backend (since OData is not properly supported)
    const res = await httpGet<{
      users: UserForAdmin[];
      statistics: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        customers: number;
        sellers: number;
      };
    }>("accounts");

    let allUsers = res.users || [];

    // Client-side filtering
    if (usernameSearch && usernameSearch.trim()) {
      allUsers = allUsers.filter((user) =>
        user.username
          .toLowerCase()
          .includes(usernameSearch.trim().toLowerCase())
      );
    }

    if (emailSearch && emailSearch.trim()) {
      allUsers = allUsers.filter((user) =>
        user.email.toLowerCase().includes(emailSearch.trim().toLowerCase())
      );
    }

    if (!usernameSearch && !emailSearch && searchTerm && searchTerm.trim()) {
      allUsers = allUsers.filter(
        (user) =>
          user.username
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      allUsers = allUsers.filter((user) => user.roles.includes(roleFilter));
    }

    if (isActive !== undefined) {
      allUsers = allUsers.filter((user) => user.isActive === isActive);
    }

    // Client-side sorting
    if (sortOrder) {
      allUsers = [...allUsers].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const total = allUsers.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      total: total,
    };
  }

  async updateAccountAsync(
    accountId: number,
    accountData: UpdateAccountRequest
  ): Promise<UserForAdmin> {
    const response = await httpPut<UserForAdmin>(
      `accounts/${accountId}`,
      accountData
    );
    return response;
  }

  async deleteAccountAsync(accountId: number): Promise<void> {
    await httpDelete<void>(`accounts/${accountId}`);
  }

  async updateUserRoleAsync(userId: number, roleId: number): Promise<void> {
    const response = await httpPut<void>(`accounts/${userId}/role`, {
      userId,
      roleIds: [roleId],
    });

    return response;
  }

  async updateUserRolesAsync(userId: number, roleIds: number[]): Promise<void> {
    const requestBody: {
      userId: number;
      roleIds: number[];
      replaceAll?: boolean;
    } = {
      userId,
      roleIds,
      replaceAll: true, // Replace all roles instead of adding/removing
    };

    const response = await httpPut<void>(
      `accounts/${userId}/role`,
      requestBody
    );

    return response;
  }

  async updateUserStatusAsync(
    userId: number,
    isActive: boolean
  ): Promise<void> {
    const response = await httpPut<void>(`accounts/${userId}/status`, {
      userId,
      isActive,
    });

    return response;
  }

  async getUserStatisticsAsync(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    customers: number;
    sellers: number;
  }> {
    // API returns users array and statistics object
    const response = await httpGet<{
      users: UserForAdmin[];
      statistics: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        customers: number;
        sellers: number;
      };
    }>("accounts");

    return (
      response.statistics || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        customers: 0,
        sellers: 0,
      }
    );
  }
}

export const userServices = new UserServices();
