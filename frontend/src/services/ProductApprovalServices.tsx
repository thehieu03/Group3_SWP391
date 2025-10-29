import http from "../utils/http";

export interface ProductApprovalRequest {
    searchProductName?: string;
    searchShopName?: string;
    categoryId?: number;
    sortBy?: string;
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface ProductApprovalItem {
    id: number;
    productName: string;
    description?: string;
    shopId?: number;
    shopName: string;
    shopOwnerName?: string;
    image?: string;
    details?: string;
    fee?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    categoryId?: number;
    categoryName?: string;
}

export interface ProductApprovalPagedResponse {
    products: ProductApprovalItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

class ProductApprovalServices {
    // Lấy danh sách sản phẩm chờ duyệt
    async getPendingProducts(params: ProductApprovalRequest): Promise<ProductApprovalPagedResponse> {
        try {
            const response = await http.get("/products/pending", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching pending products:", error);
            throw error;
        }
    }

    // Duyệt sản phẩm
    async approveProduct(productId: number): Promise<{ message: string }> {
        try {
            const response = await http.put(`/products/${productId}/approve`);
            return response.data;
        } catch (error) {
            console.error(`Error approving product ${productId}:`, error);
            throw error;
        }
    }

    // Từ chối sản phẩm
    async rejectProduct(productId: number): Promise<{ message: string }> {
        try {
            const response = await http.delete(`/products/${productId}/reject`);
            return response.data;
        } catch (error) {
            console.error(`Error rejecting product ${productId}:`, error);
            throw error;
        }
    }

    // Thay đổi trạng thái active/inactive của sản phẩm
    async toggleProductActive(productId: number, isActive: boolean): Promise<{ message: string }> {
        try {
            const response = await http.put(`/products/${productId}/toggle-active`, { isActive });
            return response.data;
        } catch (error) {
            console.error(`Error toggling product ${productId} active status:`, error);
            throw error;
        }
    }
}

export default new ProductApprovalServices();

