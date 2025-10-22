import { httpGet, httpPut, httpDelete } from "../utils/http";

export interface SupportTicket {
  id: number;
  title: string;
  content: string;
  email: string;
  phone: string;
  username?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

class SupportTicketServices {
  async getAllTicketsAsync(): Promise<SupportTicket[]> {
    return await httpGet<SupportTicket[]>("supporttickets");
  }

  async markAsDoneAsync(id: number): Promise<void> {
    await httpPut(`supporttickets/${id}/done`);
  }

  async deleteTicketAsync(id: number): Promise<void> {
    await httpDelete(`supporttickets/${id}`);
  }
}

export const supportTicketServices = new SupportTicketServices();
