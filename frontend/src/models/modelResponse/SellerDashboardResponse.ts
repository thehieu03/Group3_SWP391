export type SellerRecentOrderItem = {
    orderId: number;
    createdAt: string | null;
    productName: string | null;
    variantName: string | null;
    categoryName: string | null;
    quantity: number;
    totalPrice: number;
    status: string | null;
};

export type SellerDashboardResponse = {
    shopId: number;
    shopName: string;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    recentOrders: SellerRecentOrderItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
};

