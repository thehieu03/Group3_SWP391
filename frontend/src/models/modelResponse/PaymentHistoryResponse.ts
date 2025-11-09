export interface PaymentHistoryResponse {
    id: number;
    userId: number;
    type: 'PURCHASE' | 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    paymentDescription: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    createdAt: string;
}

export interface PaymentHistorySummary {
    totalBalance: number;
    transactions: PaymentHistoryResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
