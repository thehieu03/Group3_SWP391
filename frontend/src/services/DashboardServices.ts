import { httpGet } from "@utils/http";
import type { SellerDashboardResponse } from "@models/modelResponse/SellerDashboardResponse";

class DashboardServices {
  async getSellerOverview(
    searchTerm?: string,
    statusFilter?: string,
    categoryFilter?: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SellerDashboardResponse> {
    const params: Record<string, string | number> = { page, pageSize };
    if (searchTerm) params.searchTerm = searchTerm;
    if (statusFilter) params.statusFilter = statusFilter;
    if (categoryFilter) params.categoryFilter = categoryFilter;

    // Thử các endpoint có thể đúng (theo thứ tự ưu tiên)
    const possibleEndpoints = [
      "dashboard/seller", // Có thể đúng
      "seller/dashboard", // Có thể đúng
      "sellers/dashboard", // Có thể đúng
      "dashboard/seller-overview", // Endpoint hiện tại (404)
    ];

    const endpoint = possibleEndpoints[0]; // Thử endpoint đầu tiên
    const fullUrl = `/api/${endpoint}?${new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()}`;
    console.log("[DashboardServices] Gọi API:", fullUrl);
    console.log("[DashboardServices] Params:", params);
    console.log(
      "[DashboardServices] ⚠️ Nếu 404, thử các endpoint:",
      possibleEndpoints
    );

    return await httpGet<SellerDashboardResponse>(endpoint, {
      params,
    });
  }
}

export const dashboardServices = new DashboardServices();
