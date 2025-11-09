import { httpGet, httpPut } from "../utils/http";

export interface Shop {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerUsername: string | null;
  productCount: number;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

class ShopServices {
  async getAllShopsAsync(): Promise<Shop[]> {
    const response = await httpGet<Shop[]>("shops");
    return response;
  }

  async getShopByIdAsync(id: number): Promise<Shop> {
    const response = await httpGet<Shop>(`shops/${id}`);
    return response;
  }

  async updateShopAsync(id: number, data: UpdateShopRequest): Promise<Shop> {
    const response = await httpPut<Shop, UpdateShopRequest>(`shops/${id}`, data);
    return response;
  }

  async updateMyShopAsync(data: UpdateShopRequest): Promise<Shop> {
    const response = await httpPut<Shop, UpdateShopRequest>("shops/my-shop", data);
    return response;
  }

  async getShopByAccountIdAsync(accountId: number): Promise<Shop | null> {
    try {
      // Get all shops and filter by accountId
      // Note: This assumes the backend allows sellers to get their own shop
      // If backend has a specific endpoint, use that instead
      const shops = await httpGet<Shop[]>("shops");
      const shop = shops.find(s => s.ownerUsername !== null);
      // For now, we'll try to get shop by making a request
      // If backend has endpoint like /api/shops/my-shop, use that
      return shop || null;
    } catch (error) {
      console.error("Error getting shop by account ID:", error);
      return null;
    }
  }

  async getMyShopAsync(): Promise<Shop | null> {
    try {
      // Get current seller's shop using the new endpoint
      const shop = await httpGet<Shop>("shops/my-shop");
      return shop;
    } catch (error: any) {
      console.error("Error getting my shop:", error);
      // Return null if shop not found (404) or other errors
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const shopServices = new ShopServices();
