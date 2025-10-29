<<<<<<< Updated upstream
<<<<<<< Updated upstream
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


=======
import { httpGet } from "../utils/http";
import type { SubcategoryResponse } from "../models/modelResponse/SubcategoryResponse";

class SubcategoryServices {
  async getAllSubcategoryAsync(): Promise<SubcategoryResponse[]> {
    const response = await httpGet<SubcategoryResponse[]>("subcategories");
    return response;
  }

  async getSubcategoryByIdAsync(id: number): Promise<SubcategoryResponse> {
    const response = await httpGet<SubcategoryResponse>(`subcategories/${id}`);
    return response;
  }
}

export const subcategoryServices = new SubcategoryServices();
>>>>>>> Stashed changes
=======
import axios from "axios";
import type { SubcategoryResponse } from "../models/modelResponse/SubcategoryResponse";

export const subCategoryServices = {
    getAllSubCategoryAsync: async (): Promise<SubcategoryResponse[]> => {
        const res = await axios.get("/api/subcategories");
        return res.data;
    },

    getSubCategoryByIdAsync: async (id: number): Promise<SubcategoryResponse> => {
        const res = await axios.get(`/api/products/by-subcategory?subcategoryId=${id}`);
        return res.data;
    },
};
>>>>>>> Stashed changes
