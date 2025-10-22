export interface ProductResponse {
    price: any;
    id: number;
    shopId?: number | null;
    categoryId?: number | null;
    subcategoryId?: number | null;
    name: string;
    description?: string | null;
    image?: string | null | Uint8Array;
    isActive: boolean | null;
    details?: string | null;
    fee?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    
    shopName?: string | null;
    categoryName?: string | null;
    subcategoryName?: string | null;
    
    //data for product card
    minPrice?: number | null;
    maxPrice?: number | null;
    totalStock: number;
    totalSold: number;
    averageRating: number;
    reviewCount: number;
    complaintRate: number;
}


