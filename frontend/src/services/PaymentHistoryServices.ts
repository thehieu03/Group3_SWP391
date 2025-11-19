import type { PaymentHistorySummary } from "@models/modelResponse/PaymentHistoryResponse";
import { httpGet } from "@utils/http";

class PaymentHistoryServices {
  async getPaymentHistory(
    userId: number,
    startDate?: string,
    endDate?: string,
    transactionType?: string,
    page: number = 1,
    pageSize: number = 5
  ): Promise<PaymentHistorySummary> {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (transactionType) params.set("transactionType", transactionType);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    // Backend route is payment-history/{userId}, so userId goes in the path
    // BaseURL is /api/, so full path becomes /api/payment-history/{userId}?params
    const queryString = params.toString();
    const path = `payment-history/${userId}${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      return await httpGet<PaymentHistorySummary>(path);
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      if (error.response?.status === 404) {
        // Return empty payment history if not found
        return {
          totalBalance: 0,
          transactions: [],
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
      throw err;
    }
  }
}

export const paymentHistoryServices = new PaymentHistoryServices();
