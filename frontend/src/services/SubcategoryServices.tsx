import type { SubcategoryResponse } from "../models/modelResponse/SubcategoryResponse.tsx";
import { httpGet, httpPost, httpPut } from "../utils/http.tsx";

class SubcategoryServices {
    async getAllSubcategories(categoryId?: number, includeInactive: boolean = false): Promise<SubcategoryResponse[]> {
        const params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId.toString());
        if (includeInactive) params.set('includeInactive', 'true');
        
        const path = `subcategories${params.toString() ? `?${params.toString()}` : ''}`;
        try {
            return await httpGet<SubcategoryResponse[]>(path);
        } catch (err: any) {
            if (err?.response?.status === 404) return [];
            throw err;
        }
    }

    async createSubcategory(data: { categoryId: number; name: string }): Promise<SubcategoryResponse> {
        return await httpPost<SubcategoryResponse>("subcategories", data);
    }

    async deactivateSubcategory(id: number): Promise<void> {
        await httpPut(`subcategories/deactivate/${id}`, {});
    }

    async activateSubcategory(id: number): Promise<void> {
        await httpPut(`subcategories/activate/${id}`, {});
    }

    async updateSubcategory(id: number, name: string): Promise<void> {
        await httpPut(`subcategories/${id}`, { name });
    }
}

export const subcategoryServices = new SubcategoryServices();


