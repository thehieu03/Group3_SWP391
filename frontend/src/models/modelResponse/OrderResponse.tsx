export interface OrderResponse {
    id: number;
    userId: number;
    productId: number;
    productName: string;
    productImage: string;
    productDescription: string;
    categoryName: string;
    sellerName: string;
    price: number;
    quantity: number;
    totalAmount: number;
    orderDate: string;
    status: string;
    rating?: number;
    review?: string;
}
