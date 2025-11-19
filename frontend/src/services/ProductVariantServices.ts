import type { ProductVariantResponse } from "@models/modelResponse/ProductVariantResponse";
import { httpGet } from "@utils/http";

class ProductVariantServices {
  /**
   * Lấy danh sách product variants theo product ID
   * @param productId - ID của sản phẩm
   * @returns Promise<ProductVariantResponse[]> - Danh sách các biến thể sản phẩm
   */
  async getProductVariantsAsync(
    productId: number
  ): Promise<ProductVariantResponse[]> {
    const response = await httpGet<ProductVariantResponse[]>(
      `productVariants/product/${productId}`
    );
    return response;
  }
}

export const productVariantServices = new ProductVariantServices();
