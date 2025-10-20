import type {ProductResponse} from "../models/modelResponse/ProductResponse.tsx";
import {httpGet} from "../utils/http.tsx";

class ProductServices {
    async getProductsByCategory(params: { 
        categoryId: number; 
        subcategoryId?: number; 
        searchTerm?: string; 
        sortBy?: string; 
    }): Promise<ProductResponse[]> {
        const q = new URLSearchParams();
        q.set("categoryId", String(params.categoryId));
        if (params?.subcategoryId != null) q.set("subcategoryId", String(params.subcategoryId));
        if (params?.searchTerm) q.set("searchTerm", params.searchTerm);
        if (params?.sortBy) q.set("sortBy", params.sortBy);
        const path = `products?${q.toString()}`;
        try {
            return await httpGet<ProductResponse[]>(path);
        } catch (err: any) {
            if (err?.response?.status === 404) return [];
            throw err;
        }
    }
}
export const productServices = new ProductServices();


