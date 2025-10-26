import { httpGet } from "@utils/http";
import type { OrderAdminResponse } from "@models/modelResponse/OrderAdminResponse";

// Interface for count API response
interface CountResponse {
  count?: number;
  Count?: number;
  totalCount?: number;
  TotalCount?: number;
}

class AdminOrderServices {
  async getOrdersAdminAsync(
    shopNameSearch?: string,
    buyerNameSearch?: string,
    sellerNameSearch?: string,
    statusFilter?: string,
    sortOrder?: "asc" | "desc",
    sortField?: "orderDate" | "totalPrice" | "orderId",
    page?: number,
    pageSize?: number
  ): Promise<OrderAdminResponse[]> {
    const params = new URLSearchParams();
    const filters: string[] = [];

    if (shopNameSearch && shopNameSearch.trim()) {
      filters.push(
        `contains(tolower(shopName), tolower('${shopNameSearch.trim()}'))`
      );
    }

    if (buyerNameSearch && buyerNameSearch.trim()) {
      filters.push(
        `contains(tolower(buyerName), tolower('${buyerNameSearch.trim()}'))`
      );
    }

    if (sellerNameSearch && sellerNameSearch.trim()) {
      filters.push(
        `contains(tolower(sellerName), tolower('${sellerNameSearch.trim()}'))`
      );
    }

    // Combine filters with 'and' operator
    if (filters.length > 0) {
      params.set("$filter", filters.join(" and "));
    }

    // Status filter
    if (statusFilter && statusFilter !== "ALL") {
      const existingFilter = params.get("$filter");
      const statusFilterQuery = `status eq '${statusFilter}'`;
      if (existingFilter) {
        params.set("$filter", `(${existingFilter}) and (${statusFilterQuery})`);
      } else {
        params.set("$filter", statusFilterQuery);
      }
    }

    // Sorting
    if (sortOrder && sortField) {
      params.set("$orderby", `${sortField} ${sortOrder}`);
    } else if (sortOrder) {
      params.set("$orderby", `orderDate ${sortOrder}`);
    }

    // Pagination
    if (pageSize) {
      params.set("$top", String(pageSize));
      if (page && page > 0) {
        const skip = (page - 1) * pageSize;
        params.set("$skip", String(skip));
      }
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await httpGet<OrderAdminResponse[]>(`orders${query}`);
    return response;
  }

  async getOrdersAdminCountAsync(
    shopNameSearch?: string,
    buyerNameSearch?: string,
    sellerNameSearch?: string,
    statusFilter?: string
  ): Promise<number> {
    const params = new URLSearchParams();
    params.set("$count", "true");

    // Build filter queries for each search field
    const filters: string[] = [];

    if (shopNameSearch && shopNameSearch.trim()) {
      filters.push(
        `contains(tolower(shopName), tolower('${shopNameSearch.trim()}'))`
      );
    }

    if (buyerNameSearch && buyerNameSearch.trim()) {
      filters.push(
        `contains(tolower(buyerName), tolower('${buyerNameSearch.trim()}'))`
      );
    }

    if (sellerNameSearch && sellerNameSearch.trim()) {
      filters.push(
        `contains(tolower(sellerName), tolower('${sellerNameSearch.trim()}'))`
      );
    }

    // Combine filters with 'and' operator
    if (filters.length > 0) {
      params.set("$filter", filters.join(" and "));
    }

    if (statusFilter && statusFilter !== "ALL") {
      const existingFilter = params.get("$filter");
      const statusFilterQuery = `status eq '${statusFilter}'`;
      if (existingFilter) {
        params.set("$filter", `(${existingFilter}) and (${statusFilterQuery})`);
      } else {
        params.set("$filter", statusFilterQuery);
      }
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await httpGet<
      CountResponse | number | OrderAdminResponse[]
    >(`orders${query}`);

    // If response is an array of OrderAdminResponse, return its length
    if (Array.isArray(response)) {
      return response.length;
    }

    // If response is a number, return it directly
    if (typeof response === "number") {
      return response;
    }

    // If response is a CountResponse object, extract count
    if (response && typeof response === "object" && !Array.isArray(response)) {
      const countResponse = response as CountResponse;
      return (
        countResponse.count ||
        countResponse.Count ||
        countResponse.totalCount ||
        countResponse.TotalCount ||
        0
      );
    }

    return 0;
  }
}

export const adminOrderServices = new AdminOrderServices();
