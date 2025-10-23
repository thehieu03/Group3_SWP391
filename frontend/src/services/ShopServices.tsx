import { httpGet, httpPut } from "../utils/http";

export interface Shop {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerUsername: string | null;
  productCount: number;
  complaintCount?: number;
}

export interface PaginatedShopsResponse {
  items: Shop[];
  total: number;
}

export interface ShopForAdmin {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerUsername: string | null;
  productCount: number;
  complaintCount: number;
}

class ShopServices {
  async getAllShopsAsync(): Promise<Shop[]> {
    const response = await httpGet<Shop[]>("shops");
    return response;
  }

  async getShopsPagedAsync(
    page: number,
    pageSize: number,
    searchTerm?: string,
    statusFilter?: string,
    sortOrder?: "asc" | "desc",
    shopNameSearch?: string,
    ownerSearch?: string,
    isActive?: boolean
  ): Promise<PaginatedShopsResponse> {
    const params = new URLSearchParams();

    const skip = Math.max(0, (page - 1) * pageSize);
    params.set("$top", String(pageSize));
    params.set("$skip", String(skip));
    params.set("$count", "true");

    let filter = "";

    if (shopNameSearch && shopNameSearch.trim()) {
      filter = `contains(name, '${shopNameSearch.trim()}')`;
    }

    if (ownerSearch && ownerSearch.trim()) {
      const ownerFilter = `contains(ownerUsername, '${ownerSearch.trim()}')`;
      filter = filter ? `(${filter}) and (${ownerFilter})` : ownerFilter;
    }

    if (!filter && searchTerm && searchTerm.trim()) {
      filter = `contains(name, '${searchTerm}') or contains(ownerUsername, '${searchTerm}')`;
    }

    if (statusFilter && statusFilter !== "ALL") {
      const statusFilterQuery =
        statusFilter === "active" ? "isActive eq true" : "isActive eq false";
      filter = filter
        ? `(${filter}) and (${statusFilterQuery})`
        : statusFilterQuery;
    }

    if (isActive !== undefined) {
      const activeFilter = `isActive eq ${isActive}`;
      filter = filter ? `(${filter}) and (${activeFilter})` : activeFilter;
    }

    if (filter) params.set("$filter", filter);

    if (sortOrder) {
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";
      params.set("$orderby", `createdAt ${sortDirection}`);
    }

    const query = params.toString() ? `?${params.toString()}` : "";

    const res = await httpGet<
      { value: ShopForAdmin[]; "@odata.count": number } | ShopForAdmin[]
    >(`shops${query}`);

    if (
      res &&
      typeof res === "object" &&
      "value" in res &&
      Array.isArray(res.value)
    ) {
      const total = res["@odata.count"] ?? res.value.length;
      return {
        items: res.value,
        total: total,
      };
    }

    const allShops = await this.getAllShopsForPaginationAsync(
      searchTerm,
      statusFilter,
      sortOrder,
      shopNameSearch,
      ownerSearch,
      isActive
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedShops = allShops.slice(startIndex, endIndex);

    return {
      items: paginatedShops,
      total: allShops.length,
    };
  }

  async getAllShopsForPaginationAsync(
    searchTerm?: string,
    statusFilter?: string,
    sortOrder?: "asc" | "desc",
    shopNameSearch?: string,
    ownerSearch?: string,
    isActive?: boolean
  ): Promise<ShopForAdmin[]> {
    const params = new URLSearchParams();

    let filter = "";

    if (shopNameSearch && shopNameSearch.trim()) {
      filter = `contains(name, '${shopNameSearch.trim()}')`;
    }

    if (ownerSearch && ownerSearch.trim()) {
      const ownerFilter = `contains(ownerUsername, '${ownerSearch.trim()}')`;
      filter = filter ? `(${filter}) and (${ownerFilter})` : ownerFilter;
    }

    if (!filter && searchTerm && searchTerm.trim()) {
      filter = `contains(name, '${searchTerm}') or contains(ownerUsername, '${searchTerm}')`;
    }

    if (statusFilter && statusFilter !== "ALL") {
      const statusFilterQuery =
        statusFilter === "active" ? "isActive eq true" : "isActive eq false";
      filter = filter
        ? `(${filter}) and (${statusFilterQuery})`
        : statusFilterQuery;
    }

    if (isActive !== undefined) {
      const activeFilter = `isActive eq ${isActive}`;
      filter = filter ? `(${filter}) and (${activeFilter})` : activeFilter;
    }

    if (filter) params.set("$filter", filter);

    if (sortOrder) {
      const sortDirection = sortOrder === "asc" ? "asc" : "desc";
      params.set("$orderby", `createdAt ${sortDirection}`);
    }

    const query = params.toString() ? `?${params.toString()}` : "";

    const res = await httpGet<ShopForAdmin[]>(`shops${query}`);
    return Array.isArray(res) ? res : [];
  }

  async updateShopStatusAsync(
    shopId: number,
    isActive: boolean
  ): Promise<void> {
    const response = await httpPut<void>(`shops/${shopId}/status`, {
      shopId,
      isActive,
    });
    return response;
  }

  async approveShopAsync(shopId: number): Promise<void> {
    const response = await httpPut<void>(`shops/${shopId}/approve`, {
      shopId,
    });
    return response;
  }

  async getShopDetailsAsync(shopId: number): Promise<ShopForAdmin> {
    const response = await httpGet<ShopForAdmin>(`shops/${shopId}`);
    return response;
  }
}

export const shopServices = new ShopServices();
