import type { CategoriesResponse } from "@models/modelResponse/CategoriesResponse.tsx";
import { httpGet } from "@utils/http.ts";

class CategoryServices {
  async getAllCategoryAsync(): Promise<CategoriesResponse[]> {
    const data = await httpGet<CategoriesResponse[]>("categories");
    return data;
  }
}
export const categoryServices = new CategoryServices();
