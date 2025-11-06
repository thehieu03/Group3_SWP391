import type { CategoriesResponse } from "@models/modelResponse/CategoriesResponse";
import { httpGet } from "@utils/http";

class CategoryServices {
  async getAllCategoryAsync(): Promise<CategoriesResponse[]> {
    const data = await httpGet<CategoriesResponse[]>("categories");
    return data;
  }
}
export const categoryServices = new CategoryServices();
