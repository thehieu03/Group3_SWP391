import { httpGet, httpPost } from "@utils/http.ts";
import type { SupportTicketRequest } from "@/models";
import type { SupportTicketResponse } from "@/models/modelResponse/SupportTicketResponse";

type ODataList<T> = {
  value: T[];
  "@odata.count"?: number;
};

export interface AdminTicketListRawParams {
  top?: number;
  skip?: number;
  count?: boolean;
  filter?: string;
  orderby?: string;
  select?: string;
}

function buildODataRawQuery(params: AdminTicketListRawParams = {}): string {
  const q: string[] = [];
  if (params.top !== undefined) q.push(`$top=${params.top}`);
  if (params.skip !== undefined) q.push(`$skip=${params.skip}`);
  if (params.count) q.push(`$count=true`);
  if (params.filter) q.push(`$filter=${encodeURIComponent(params.filter)}`);
  if (params.orderby) q.push(`$orderby=${encodeURIComponent(params.orderby)}`);
  if (params.select) q.push(`$select=${encodeURIComponent(params.select)}`);
  return q.length ? `?${q.join("&")}` : "";
}

class SupportTicketServices {
  async createAsync(data: SupportTicketRequest): Promise<string> {
    const res = await httpPost<string, SupportTicketRequest>(
      "supporttickets",
      data
    );
    return res;
  }

  // Admin OData list: GET /api/admin/supporttickets?... (Bearer handled by interceptor)
  async getAllAdminAsync(
    params: AdminTicketListRawParams = {}
  ): Promise<ODataList<SupportTicketResponse>> {
    const query = buildODataRawQuery(params);
    return await httpGet<ODataList<SupportTicketResponse>>(
      `admin/supporttickets${query}`
    );
  }
}

export const supportTicketServices = new SupportTicketServices();
