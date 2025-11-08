export interface ProductStorageRequest {
  result: string; // JSON string
}

export interface ProductVariantRequest {
  id?: number; // Variant ID for update operations
  name: string;
  price: number;
  stock?: number;
  storages?: ProductStorageRequest[];
  storageJson?: string; // Raw JSON string chứa mảng tài khoản
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  subcategoryId?: number;
  shopId: number;
  stock: number;
  images: string[];
  isActive: boolean;
  details?: string;
  variants?: ProductVariantRequest[];
}

export interface ProductUpdateRequest extends ProductRequest {
  id: number;
}

export interface ProductListRequest {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  shopId?: number;
  isActive?: boolean;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
