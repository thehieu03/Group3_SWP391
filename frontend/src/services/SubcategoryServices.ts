import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";
import { httpGet, httpPost, httpPut } from "@utils/http";

interface CreateSubcategoryRequest {
  categoryId: number;
  name: string;
}

class SubcategoryServices {
  async getAllSubcategories(
    categoryId?: number,
    includeInactive: boolean = false
  ): Promise<SubcategoryResponse[]> {
    let path = "subcategories";
    const params: string[] = [];
    
    if (categoryId) {
      params.push(`categoryId=${categoryId}`);
    }
    
    if (includeInactive) {
      params.push(`includeInactive=true`);
    }
    
    if (params.length > 0) {
      path += `?${params.join("&")}`;
    }
    
    try {
      return await httpGet<SubcategoryResponse[]>(path);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 404) return [];
      throw err;
    }
  }

  async createSubcategory(request: CreateSubcategoryRequest): Promise<void> {
    await httpPost<void>("subcategories", request);
  }

  async updateSubcategory(subcategoryId: number, name: string): Promise<void> {
    await httpPut<void>(`subcategories/${subcategoryId}`, { name });
  }

  async activateSubcategory(subcategoryId: number): Promise<void> {
    await httpPut<void>(`subcategories/activate/${subcategoryId}`, {});
  }

  async deactivateSubcategory(subcategoryId: number): Promise<void> {
    await httpPut<void>(`subcategories/deactivate/${subcategoryId}`, {});
  }
}
export const subcategoryServices = new SubcategoryServices();
