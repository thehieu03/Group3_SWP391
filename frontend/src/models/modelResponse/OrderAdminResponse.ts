export interface OrderAdminResponse {
  orderId: number;
  shopName: string;
  totalPrice: number;
  quantity: number;
  buyerName: string;
  sellerName: string;
  status: string;
  orderDate: string;
  productName?: string;
  productVariantName?: string;
}
