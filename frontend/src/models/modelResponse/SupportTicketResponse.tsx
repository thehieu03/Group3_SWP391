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
