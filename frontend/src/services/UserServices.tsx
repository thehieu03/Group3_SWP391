import { httpPut, httpGet, httpPost, httpDelete } from "@utils/http";
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
    let queryParams = "";
    const params = new URLSearchParams();

    if (searchTerm && searchTerm.trim()) {
      params.append(
        "$filter",
        `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      const existingFilter = params.get("$filter");
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;

      if (existingFilter) {
        params.set("$filter", `(${existingFilter}) and (${roleFilterQuery})`);
      } else {
        params.append("$filter", roleFilterQuery);
      }
    }

    if (params.toString()) {
      queryParams = "?" + params.toString();
    }

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
    const params = new URLSearchParams();

    // OData filters
    let filter = "";

    // Handle specific username and email search
    if (usernameSearch && usernameSearch.trim()) {
      filter = `contains(username, '${usernameSearch.trim()}')`;
    }

    if (emailSearch && emailSearch.trim()) {
      const emailFilter = `contains(email, '${emailSearch.trim()}')`;
      filter = filter ? `(${filter}) and (${emailFilter})` : emailFilter;
    }

    // Fallback to general search term if no specific searches
    if (!filter && searchTerm && searchTerm.trim()) {
      filter = `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`;
    }

    if (roleFilter && roleFilter !== "ALL") {
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;
      filter = filter
        ? `(${filter}) and (${roleFilterQuery})`
        : roleFilterQuery;
    }

    // Add isActive filter
    if (isActive !== undefined) {
      const activeFilter = `isActive eq ${isActive}`;
      filter = filter ? `(${filter}) and (${activeFilter})` : activeFilter;
    }

    if (filter) params.set("$filter", filter);

    // OData sorting
    if (sortOrder) {
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";
      params.set("$orderby", `createdAt ${sortDirection}`);
    }

    const query = params.toString() ? `?${params.toString()}` : "";

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
    const params = new URLSearchParams();

    // OData paging
    const skip = Math.max(0, (page - 1) * pageSize);
    params.set("$top", String(pageSize));
    params.set("$skip", String(skip));
    params.set("$count", "true");

    // OData filters
    let filter = "";

    // Handle specific username and email search
    if (usernameSearch && usernameSearch.trim()) {
      filter = `contains(username, '${usernameSearch.trim()}')`;
    }

    if (emailSearch && emailSearch.trim()) {
      const emailFilter = `contains(email, '${emailSearch.trim()}')`;
      filter = filter ? `(${filter}) and (${emailFilter})` : emailFilter;
    }

    // Fallback to general search term if no specific searches
    if (!filter && searchTerm && searchTerm.trim()) {
      filter = `contains(username, '${searchTerm}') or contains(email, '${searchTerm}')`;
    }

    if (roleFilter && roleFilter !== "ALL") {
      const roleFilterQuery = `roles/any(r: r eq '${roleFilter}')`;
      filter = filter
        ? `(${filter}) and (${roleFilterQuery})`
        : roleFilterQuery;
    }

    // Add isActive filter
    if (isActive !== undefined) {
      const activeFilter = `isActive eq ${isActive}`;
      filter = filter ? `(${filter}) and (${activeFilter})` : activeFilter;
    }

    if (filter) params.set("$filter", filter);

    // OData sorting
    if (sortOrder) {
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";
      params.set("$orderby", `createdAt ${sortDirection}`);
    }

    const query = params.toString() ? `?${params.toString()}` : "";

    // Backend may return OData { value: [], @odata.count: n } or plain array
    const res = await httpGet<
      { value: UserForAdmin[]; "@odata.count": number } | UserForAdmin[]
    >(`accounts${query}`);

    if (
      res &&
      typeof res === "object" &&
      "value" in res &&
      Array.isArray(res.value)
    ) {
      // OData response format
      const total = res["@odata.count"] ?? res.value.length;
      return {
        items: res.value,
        total: total,
      };
    }

    // If backend pagination doesn't work properly, use frontend pagination
    const allUsers = await this.getAllUsersForPaginationAsync(
      searchTerm,
      roleFilter,
      sortOrder,
      usernameSearch,
      emailSearch,
      isActive
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      total: allUsers.length,
    };
  }

  async updateAccountAsync(
    accountId: number,
    accountData: UpdateAccountRequest
  ): Promise<UserForAdmin> {
    console.log("Sending update request to:", `accounts/${accountId}`);
    console.log("Request payload:", accountData);

    const response = await httpPut<UserForAdmin>(
      `accounts/${accountId}`,
      accountData
    );
    console.log("Update response:", response);
    return response;
  }

  async deleteAccountAsync(accountId: number): Promise<void> {
    await httpDelete<void>(`accounts/${accountId}`);
  }
}

export const userServices = new UserServices();
