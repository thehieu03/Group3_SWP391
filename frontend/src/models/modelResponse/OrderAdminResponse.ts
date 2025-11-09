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
  productVariantId?: number;
}

export interface AccountStorageInfo {
  storageId: number;
  username: string;
  password: string;
  status: boolean;
}

export interface OrderDetailResponse {
  orderId: number;
  productName?: string;
  productVariantName?: string;
  quantity: number;
  totalPrice: number;
  status?: string;
  orderDate?: string;
  payload?: string;
  accounts?: AccountStorageInfo[];
}
