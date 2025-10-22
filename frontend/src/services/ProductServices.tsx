import type {ProductResponse} from "../models/modelResponse/ProductResponse.tsx";
import {httpGet} from "../utils/http.tsx";
import type { AxiosError } from "axios";

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
        } catch (err: unknown) {
            const error = err as AxiosError;
            if (error.response?.status === 404) return [];
            throw error;
        }
    }

    async getAllProductAsync():Promise<ProductResponse[]> {
        const response=await httpGet<ProductResponse[]>("products");
        return response;
    }

    async searchProductsAsync(searchTerm: string): Promise<ProductResponse[]> {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const response = await httpGet<ProductResponse[]>(`products?$filter=contains(name,'${encodedSearchTerm}') or contains(description,'${encodedSearchTerm}')&$top=5`);
        return response;
    }
    
}
export const productServices = new ProductServices();


