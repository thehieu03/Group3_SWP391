import type { PaymentHistoryResponse, PaymentHistorySummary } from "../models/modelResponse/PaymentHistoryResponse";
import { httpGet } from "../utils/http";

class PaymentHistoryServices {
    async getPaymentHistory(userId: number, startDate?: string, endDate?: string, transactionType?: string, page: number = 1, pageSize: number = 5): Promise<PaymentHistorySummary> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            if (transactionType) params.set('transactionType', transactionType);
            params.set('page', page.toString());
            params.set('pageSize', pageSize.toString());
            
            const queryString = params.toString();
            const url = `payment-history/${userId}?${queryString}`;
            
            return await httpGet<PaymentHistorySummary>(url);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                return { 
                    totalBalance: 0, 
                    moneyOnHold: 0, 
                    transactions: [],
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 5,
                    hasNextPage: false,
                    hasPreviousPage: false
                };
            }
            throw err;
        }
    }
}

export const paymentHistoryServices = new PaymentHistoryServices();
