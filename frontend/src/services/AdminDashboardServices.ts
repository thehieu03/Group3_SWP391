import { httpGet } from "@utils/http.ts";
import type { DashboardResponse } from "@models/modelResponse/DashboardResponse";

class AdminDashboardServices {
  // Lấy dữ liệu dashboard overview
  async getDashboardOverviewAsync(): Promise<DashboardResponse> {
    return await httpGet<DashboardResponse>("dashboard/overview");
  }
}

export const adminDashboardServices = new AdminDashboardServices();
