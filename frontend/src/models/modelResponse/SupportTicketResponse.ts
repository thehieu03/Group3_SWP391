export type TicketStatus = "PENDING" | "PROCESSING" | "CLOSED";

export interface AccountMini {
  id: number;
  username: string;
  email: string;
}

export interface SupportTicketResponse {
  id: number;
  accountId?: number;
  email: string;
  phone?: string;
  title: string;
  content: string;
  createdAt?: string;
  status?: TicketStatus;
  account?: AccountMini;
}

export interface SupportTicketListResponse {
  items: SupportTicketResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SupportTicketStatsResponse {
  totalTickets: number;
  pending: number;
  processing: number;
  closed: number;
}

// Response format from backend API
export interface SupportTicketApiResponse {
  value: SupportTicketResponse[];
  stats: SupportTicketStatsResponse;
}
