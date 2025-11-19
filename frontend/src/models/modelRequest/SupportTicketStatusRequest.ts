import type { TicketStatus } from "@/models/modelResponse/SupportTicketResponse";

export interface SupportTicketStatusRequest {
  status: TicketStatus;
}
