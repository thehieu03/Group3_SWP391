import type { ProductResponse } from "../models/modelResponse/ProductResponse.tsx";
import { httpGet } from "../utils/http.tsx";

class ProductServices {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    async getAllProducts(params?: { 
        categoryId?: number; 
        subcategoryId?: number; 
        searchTerm?: string; 
        sortBy?: string; 
    }): Promise<ProductResponse[]> {
        const q = new URLSearchParams();
        if (params?.categoryId != null) q.set("categoryId", String(params.categoryId));
        if (params?.subcategoryId != null) q.set("subcategoryId", String(params.subcategoryId));
        if (params?.searchTerm) q.set("searchTerm", params.searchTerm);
        if (params?.sortBy) q.set("sortBy", params.sortBy);
        const path = q.toString() ? `products?${q.toString()}` : "products";
        try {
            return await httpGet<ProductResponse[]>(path);
        } catch (err: any) {
            if (err?.response?.status === 404) return [];
            throw err;
        }
=======
=======
>>>>>>> Stashed changes
    async getAllProductAsync(): Promise<ProductResponse[]> {
        const response = await httpGet<ProductResponse[]>("products");
        return response;
    }

    async searchProductsAsync(searchTerm: string): Promise<ProductResponse[]> {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const response = await httpGet<ProductResponse[]>(`products?$filter=contains(name,'${encodedSearchTerm}') or contains(description,'${encodedSearchTerm}')&$top=5`);
        return response;
    }

    async getProductsByCategoryAsync(categoryId: number): Promise<ProductResponse[]> {
        const response = await httpGet<ProductResponse[]>(`products?$filter=categoryId eq ${categoryId}`);
        return response;
>>>>>>> Stashed changes
    }

    async getProductsBySubcategoryAsync(subcategoryId: number): Promise<ProductResponse[]> {
        const response = await httpGet<ProductResponse[]>(`products/by-subcategory?subcategoryId=${subcategoryId}`);
        return response;
    }

    async getProductsBySubcategoryAsync(subcategoryId: number): Promise<ProductResponse[]> {
        const response = await httpGet<ProductResponse[]>(`products/by-subcategory?subcategoryId=${subcategoryId}`);
        return response;
    }
}
export const productServices = new ProductServices();
<<<<<<< Updated upstream
<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
