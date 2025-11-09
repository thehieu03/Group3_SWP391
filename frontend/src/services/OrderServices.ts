import { httpGet, httpPost } from "@utils/http.ts";
import type { OrderUserResponse } from "@models/modelResponse/OrderUserResponse.ts";
import type {
  OrderAdminResponse,
  OrderDetailResponse,
} from "@models/modelResponse/OrderAdminResponse.ts";

// Interface for count API response
interface CountResponse {
  count?: number;
  Count?: number;
  totalCount?: number;
  TotalCount?: number;
}

class OrderServices {
  async getOrdersUserAsync(
    productNameSearch?: string,
    shopNameSearch?: string,
    sellerNameSearch?: string,
    statusFilter?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    pageSize?: number
  ): Promise<OrderUserResponse[]> {
    const params = new URLSearchParams();
    const filters: string[] = [];

    if (productNameSearch && productNameSearch.trim()) {
      filters.push(`contains(productName, '${productNameSearch.trim()}')`);
    }

    if (shopNameSearch && shopNameSearch.trim()) {
      filters.push(`contains(shopName, '${shopNameSearch.trim()}')`);
    }

    if (sellerNameSearch && sellerNameSearch.trim()) {
      filters.push(`contains(sellerName, '${sellerNameSearch.trim()}')`);
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
    if (sortOrder) {
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
    const response = await httpGet<OrderUserResponse[]>(
      `orders/my-orders${query}`
    );
    return response;
  }

  async getOrdersUserCountAsync(
    productNameSearch?: string,
    shopNameSearch?: string,
    sellerNameSearch?: string,
    statusFilter?: string
  ): Promise<number> {
    const params = new URLSearchParams();
    params.set("$count", "true");

    // Build filter queries for each search field
    const filters: string[] = [];

    if (productNameSearch && productNameSearch.trim()) {
      filters.push(`contains(productName, '${productNameSearch.trim()}')`);
    }

    if (shopNameSearch && shopNameSearch.trim()) {
      filters.push(`contains(shopName, '${shopNameSearch.trim()}')`);
    }

    if (sellerNameSearch && sellerNameSearch.trim()) {
      filters.push(`contains(sellerName, '${sellerNameSearch.trim()}')`);
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
      CountResponse | number | OrderUserResponse[]
    >(`orders/my-orders${query}`);
    // If response is an array of OrderUserResponse, return its length
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

  async getShopOrdersAsync(
    productNameSearch?: string,
    productVariantNameSearch?: string,
    statusFilter?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    pageSize?: number
  ): Promise<OrderAdminResponse[]> {
    const params = new URLSearchParams();
    const filters: string[] = [];

    if (productNameSearch && productNameSearch.trim()) {
      filters.push(`contains(productName, '${productNameSearch.trim()}')`);
    }

    if (productVariantNameSearch && productVariantNameSearch.trim()) {
      filters.push(
        `contains(productVariantName, '${productVariantNameSearch.trim()}')`
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
    if (sortOrder) {
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
    const response = await httpGet<OrderAdminResponse[]>(
      `orders/shop-orders${query}`
    );
    return response;
  }

  async getShopOrdersCountAsync(
    productNameSearch?: string,
    productVariantNameSearch?: string,
    statusFilter?: string
  ): Promise<number> {
    const params = new URLSearchParams();
    params.set("$count", "true");

    // Build filter queries
    const filters: string[] = [];

    if (productNameSearch && productNameSearch.trim()) {
      filters.push(`contains(productName, '${productNameSearch.trim()}')`);
    }

    if (productVariantNameSearch && productVariantNameSearch.trim()) {
      filters.push(
        `contains(productVariantName, '${productVariantNameSearch.trim()}')`
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
    >(`orders/shop-orders${query}`);
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

  async getOrderDetailsAsync(orderId: number): Promise<OrderDetailResponse> {
    const response = await httpGet<OrderDetailResponse>(
      `orders/${orderId}/details`
    );
    return response;
  }

  async createOrderAsync(
    productVariantId: number,
    quantity: number
  ): Promise<{ message: string; orderId?: number; status?: string }> {
    const response = await httpPost<
      { message: string; orderId?: number; status?: string },
      { productVariantId: number; quantity: number }
    >("orders", {
      productVariantId,
      quantity,
    });
    return response;
  }
}

export const orderServices = new OrderServices();
