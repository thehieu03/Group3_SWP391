import { httpGet, httpPut } from "../utils/http.tsx";
import type { SystemsConfigResponse } from "../models/modelResponse/SystemsConfigResponse";

export interface UpdateSystemConfigRequest {
  email: string;
  fee: number;
  googleAppPassword: string;
}

class SystemConfigServices {
  async getSystemConfigAsync(): Promise<SystemsConfigResponse> {
    const response = await httpGet<SystemsConfigResponse>("systemsconfig");
    return response;
  }

  async updateSystemConfigAsync(data: UpdateSystemConfigRequest): Promise<{ message: string }> {
    const response = await httpPut<{ message: string }, UpdateSystemConfigRequest>(
      "systemsconfig",
      data
    );
    return response;
  }
}

export const systemConfigServices = new SystemConfigServices();

