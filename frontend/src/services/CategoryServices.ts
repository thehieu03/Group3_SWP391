import type { CategoriesResponse } from "@models/modelResponse/CategoriesResponse.tsx";
import type { PaginationResponse } from "@models/modelResponse/PaginationResponse.tsx";
import { httpGet, httpPost, httpPatch, httpPut } from "@utils/http";

interface CreateCategoryRequest {
  categoryName: string;
}

interface UpdateCategoryRequest {
  categoryName: string;
}

class CategoryServices {
  async getAllCategoryAsync(): Promise<CategoriesResponse[]> {
    // For customer-facing pages, only get active categories
    // The backend now defaults to active categories, but we explicitly pass isActive=true for clarity
    const data = await httpGet<PaginationResponse<CategoriesResponse>>("categories?isActive=true");
    return data.data;
  }

  async getCategoriesPaginated(page: number = 1, pageSize: number = 6, isActive?: boolean): Promise<PaginationResponse<CategoriesResponse>> {
    let url = `categories?page=${page}&pageSize=${pageSize}`;
    if (isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }
    const data = await httpGet<PaginationResponse<CategoriesResponse>>(url);
    return data;
  }

  async createCategory(categoryName: string): Promise<number> {
    const requestData: CreateCategoryRequest = {
      categoryName: categoryName
    };
    const data = await httpPost<number>("categories", requestData);
    return data;
  }

  async activateCategory(categoryId: number): Promise<void> {
    await httpPatch<void>(`categories/${categoryId}/activate`, {});
  }

  async deactivateCategory(categoryId: number): Promise<void> {
    await httpPatch<void>(`categories/${categoryId}/deactivate`, {});
  }

  async updateCategory(categoryId: number, categoryName: string): Promise<void> {
    const requestData: UpdateCategoryRequest = {
      categoryName: categoryName
    };
    await httpPut<void>(`categories/${categoryId}`, requestData);
  }
}
export const categoryServices = new CategoryServices();
