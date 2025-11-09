export interface ProductVariantResponse {
  id: number;
  productId?: number | null;
  name: string;
  price: number;
  stock?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
