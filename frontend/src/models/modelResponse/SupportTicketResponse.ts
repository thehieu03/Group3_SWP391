export type TicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

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
  createdAt: string;
  status: TicketStatus;
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
  open: number;
  pending: number;
  resolved: number;
  closed: number;
}

export interface SupportTicketResponse {
  id: number;
  accountId?: number;
  email: string;
  phone?: string;
  title: string;
  content: string;
  createdAt?: string;
  account?: {
    id: number;
    username: string;
    email: string;
  };
}
