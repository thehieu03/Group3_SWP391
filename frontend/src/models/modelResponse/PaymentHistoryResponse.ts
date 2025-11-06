export interface PaymentHistoryResponse {
    id: number;
    userId: number;
    type: 'Mua Hàng' | 'Nạp tiền' | 'Rút tiền';
    amount: number;
    paymentDescription: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    createdAt: string;
}

export interface PaymentHistorySummary {
    totalBalance: number;
    transactions: PaymentHistoryResponse[];
}
