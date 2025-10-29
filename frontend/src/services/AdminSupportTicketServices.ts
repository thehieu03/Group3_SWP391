import { httpGet, httpPost, httpPut } from "@utils/http.ts";
import type {
  SupportTicketListResponse,
  SupportTicketResponse,
  SupportTicketStatsResponse,
  TicketStatus,
} from "@/models/modelResponse/SupportTicketResponse";
import type {
  SupportTicketReplyRequest,
  SupportTicketStatusRequest,
} from "@/models/modelRequest";

export interface TicketListParams {
  top?: number;
  skip?: number;
  count?: boolean;
  search?: string;
  status?: TicketStatus;
  orderBy?: string; // e.g., "createdAt desc"
  select?: string; // e.g., "id,title,email"
}

function buildODataQuery(params: TicketListParams = {}): string {
  const qs: string[] = [];
  if (params.top !== undefined) qs.push(`$top=${params.top}`);
  if (params.skip !== undefined) qs.push(`$skip=${params.skip}`);
  if (params.count) qs.push(`$count=true`);

  const filters: string[] = [];
  if (params.status) {
    filters.push(`status eq '${params.status}'`);
  }
  if (params.search && params.search.trim()) {
    const term = params.search.trim().toLowerCase();
    const contains = (field: string) => `contains(tolower(${field}),'${term}')`;
    filters.push(
      `${contains("title")} or ${contains("content")} or ${contains("email")}`
    );
  }
  if (filters.length)
    qs.push(`$filter=${encodeURIComponent(filters.join(" and "))}`);

  if (params.orderBy) qs.push(`$orderby=${encodeURIComponent(params.orderBy)}`);
  if (params.select) qs.push(`$select=${encodeURIComponent(params.select)}`);

  return qs.length ? `?${qs.join("&")}` : "";
}

class AdminSupportTicketServices {
  private readonly base = "admin/supporttickets";

  async getListAsync(
    params: TicketListParams = {}
  ): Promise<SupportTicketListResponse> {
    const query = buildODataQuery(params);
    return await httpGet<SupportTicketListResponse>(`${this.base}${query}`);
  }

  async getDetailAsync(id: number): Promise<SupportTicketResponse> {
    return await httpGet<SupportTicketResponse>(`${this.base}/${id}`);
  }

  async postReplyAsync(
    id: number,
    body: SupportTicketReplyRequest
  ): Promise<{ message: string }> {
    return await httpPost<{ message: string }, SupportTicketReplyRequest>(
      `${this.base}/${id}/reply`,
      body
    );
  }

  async updateStatusAsync(
    id: number,
    status: TicketStatus
  ): Promise<SupportTicketResponse> {
    const body: SupportTicketStatusRequest = { status };
    return await httpPut<SupportTicketResponse, SupportTicketStatusRequest>(
      `${this.base}/${id}/status`,
      body
    );
  }

  async getStatsAsync(): Promise<SupportTicketStatsResponse> {
    return await httpGet<SupportTicketStatsResponse>(`${this.base}/stats`);
  }
}

export const adminSupportTicketServices = new AdminSupportTicketServices();
