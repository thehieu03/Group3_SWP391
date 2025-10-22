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
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
