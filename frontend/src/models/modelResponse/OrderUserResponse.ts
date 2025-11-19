export interface OrderUserResponse {
  orderId: number;
  orderDate: string;
  productId: number;
  productName: string;
  shopName: string;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  payload?: string;
  hasFeedback: boolean;
}
