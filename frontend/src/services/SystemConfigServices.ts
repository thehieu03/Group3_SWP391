import { httpGet, httpPut } from "@utils/http.ts";
import type { SystemsConfigResponse } from "@models/modelResponse/SystemsConfigResponse";

interface SystemConfigRequest {
  email: string;
  fee?: number;
  googleAppPassword: string;
}

class SystemConfigServices {
  // Lấy cấu hình hệ thống
  async getSystemConfigAsync(): Promise<SystemsConfigResponse> {
    return await httpGet<SystemsConfigResponse>("system-config");
  }

  // Cập nhật cấu hình hệ thống
  async updateSystemConfigAsync(
    request: SystemConfigRequest
  ): Promise<{ message: string }> {
    return await httpPut<{ message: string }, SystemConfigRequest>(
      "system-config",
      request
    );
  }
}

export const systemConfigServices = new SystemConfigServices();

