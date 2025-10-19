import type {SubcategoryResponse} from "../models/modelResponse/SubcategoryResponse.tsx";
import {httpGet} from "../utils/http.tsx";

class SubcategoryServices {
    async getAllSubcategories(categoryId?: number): Promise<SubcategoryResponse[]> {
        const path = categoryId ? `subcategories?categoryId=${categoryId}` : "subcategories";
        try {
            return await httpGet<SubcategoryResponse[]>(path);
        } catch (err: any) {
            if (err?.response?.status === 404) return [];
            throw err;
        }
    }
}
export const subcategoryServices = new SubcategoryServices();


