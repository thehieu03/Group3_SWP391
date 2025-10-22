import { httpGet } from "../utils/http";

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

class ShopServices {
  async getAllShopsAsync(): Promise<Shop[]> {
    const response = await httpGet<Shop[]>("shops");
    return response;
  }
}

export const shopServices = new ShopServices();
