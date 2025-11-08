export interface AdminProductResponse {
  id: number;
  name: string;
  description: string;
  price: number; // Keep for backward compatibility
  minPrice?: number | null;
  maxPrice?: number | null;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  shopId: number;
  shopName: string;
  stock: number;
  // Backend now returns image URLs instead of base64.
  // Prefer imageUrls; keep images optional for backward compatibility.
  imageUrls?: string[];
  primaryImageUrl?: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalRevenue: number;
  details?: string;
}

export interface AdminProductListResponse {
  products: AdminProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminProductStatsResponse {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  averagePrice: number;
}
