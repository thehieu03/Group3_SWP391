import { httpGet, httpPost, httpPut } from "@utils/http";

interface ProductStorageResponse {
  id: number;
  result: string; // JSON string
}

interface GetStoragesResponse {
  productVariantId: number;
  count: number;
  storages: ProductStorageResponse[];
}

class ProductStorageServices {
  /**
   * Lấy danh sách storages theo variant ID
   * @param variantId - ID của product variant
   * @returns Promise<GetStoragesResponse> - Danh sách storages
   */
  async getStoragesByVariantIdAsync(
    variantId: number
  ): Promise<GetStoragesResponse> {
    const response = await httpGet<GetStoragesResponse>(
      `productStorage/variant/${variantId}`
    );
    return response;
  }

  /**
   * Tạo storages cho variant
   * @param variantId - ID của product variant
   * @param accounts - Mảng tài khoản
   */
  async createStoragesAsync(
    variantId: number,
    accounts: Array<{ username: string; password: string; status: boolean }>
  ): Promise<void> {
    await httpPost("productStorage", {
      productVariantId: variantId,
      accounts: accounts,
    });
  }

  /**
   * Update storage status
   * @param storageId - ID của storage
   * @param status - Trạng thái mới
   */
  async updateStorageStatusAsync(
    storageId: number,
    status: boolean
  ): Promise<void> {
    await httpPut(`productStorage/${storageId}/status`, {
      storageId: storageId,
      status: status,
    });
  }
}

export const productStorageServices = new ProductStorageServices();
