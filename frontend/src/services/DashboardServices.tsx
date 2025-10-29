import { httpGet } from "@utils/http.tsx";
import type { SellerDashboardResponse } from "@models/modelResponse/SellerDashboardResponse.tsx";

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
    return await httpGet<SellerDashboardResponse>("dashboard/seller-overview", { params });
  }
}

export const dashboardServices = new DashboardServices();


