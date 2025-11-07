import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import { httpGet } from "@utils/http";

class ProductServices {
  async getAllProductAsync(): Promise<ProductResponse[]> {
    const response = await httpGet<ProductResponse[]>("products");
    return response;
  }

  async searchProductsAsync(searchTerm: string): Promise<ProductResponse[]> {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await httpGet<ProductResponse[]>(
      `products?$filter=contains(name,'${encodedSearchTerm}') or contains(description,'${encodedSearchTerm}')&$top=5`
    );
    return response;
  }

  async getProductsByCategoryAsync(
    categoryId: number
  ): Promise<ProductResponse[]> {
    const response = await httpGet<ProductResponse[]>(
      `products?$filter=categoryId eq ${categoryId}`
    );
    return response;
  }
}
export const productServices = new ProductServices();
