import { httpGet, httpPut ,httpPost} from "@utils/http.ts";
import type { RegisterShopRequest } from "@models/modelRequest/RegisterShopRequest";

export interface Shop {
  id: number;
  name: string;
  description: string;
  status: "PENDING" | "APPROVED" | "BANNED";
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
  status: "PENDING" | "APPROVED" | "BANNED";
  createdAt: string;
  updatedAt: string;
  ownerUsername: string | null;
  productCount: number;
  complaintCount: number;
  identificationF?: string | null;
  identificationB?: string | null;
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
    status?: "PENDING" | "APPROVED" | "BANNED"
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
      const statusFilterQuery = `status eq '${statusFilter.toUpperCase()}'`;
      filter = filter
        ? `(${filter}) and (${statusFilterQuery})`
        : statusFilterQuery;
    }

    if (status !== undefined) {
      const statusFilter = `status eq '${status}'`;
      filter = filter ? `(${filter}) and (${statusFilter})` : statusFilter;
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
      status
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
    status?: "PENDING" | "APPROVED" | "BANNED"
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
      const statusFilterQuery = `status eq '${statusFilter.toUpperCase()}'`;
      filter = filter
        ? `(${filter}) and (${statusFilterQuery})`
        : statusFilterQuery;
    }

    if (status !== undefined) {
      const statusFilter = `status eq '${status}'`;
      filter = filter ? `(${filter}) and (${statusFilter})` : statusFilter;
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
    status: "PENDING" | "APPROVED" | "BANNED"
  ): Promise<void> {
    const response = await httpPut<void>(`shops/${shopId}/status`, {
      shopId,
      status,
    });
    return response;
  }

  async approveShopAsync(shopId: number): Promise<void> {
    const response = await httpPut<void>(`shops/${shopId}/approve`);
    return response;
  }

  async banShopAsync(shopId: number): Promise<void> {
    const response = await httpPut<void>(`shops/${shopId}/ban`);
    return response;
  }

  async getShopDetailsAsync(shopId: number): Promise<ShopForAdmin> {
    const response = await httpGet<ShopForAdmin>(`shops/${shopId}`);
    return response;
  }

  async getShopsAsync(): Promise<{
    shops: ShopForAdmin[];
    statistics: ShopStatistics;
  }> {
    const response = await httpGet<{
      shops: ShopForAdmin[];
      statistics: ShopStatistics;
    }>("shops");
    return response;
  }

  async getShopStatisticsAsync(): Promise<ShopStatistics> {
    const response = await httpGet<ShopStatistics>("shops/statistics");
    return response;
  }

  async registerShopAsync(request: RegisterShopRequest): Promise<void> {
    const form = new FormData();
    form.append("name", request.name);
    form.append("phone", request.phone);
    form.append("description", request.description);
    form.append("identificationF", request.identificationF);
    form.append("identificationB", request.identificationB);

    await httpPost<void, FormData>("shops/register", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export interface ShopStatistics {
  totalShops: number;
  pendingShops: number;
  approvedShops: number;
  bannedShops: number;
}

export const shopServices = new ShopServices();
