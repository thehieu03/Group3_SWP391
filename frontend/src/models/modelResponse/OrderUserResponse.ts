export interface OrderUserResponse {
  orderId: string;
  orderDate: string;
  productId: number;
  productName: string;
  shopName: string;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  hasFeedback: boolean;
}
