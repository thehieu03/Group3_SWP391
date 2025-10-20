import type { PaymentHistoryResponse, PaymentHistorySummary } from "../models/modelResponse/PaymentHistoryResponse";
import { httpGet } from "../utils/http";

class PaymentHistoryServices {
    async getPaymentHistory(userId: number): Promise<PaymentHistorySummary> {
        try {
            return await httpGet<PaymentHistorySummary>(`payment-history/${userId}`);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                return { totalBalance: 0, transactions: [] };
            }
            throw err;
        }
    }
}

export const paymentHistoryServices = new PaymentHistoryServices();
