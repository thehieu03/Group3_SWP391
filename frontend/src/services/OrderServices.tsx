import { httpGet } from "../utils/http";
import type { OrderResponse } from "../models/modelResponse/OrderResponse";

class OrderServices {
    async getMyOrdersAsync(): Promise<OrderResponse[]> {
        const response = await httpGet<OrderResponse[]>("orders/my-orders");
        return response;
    }

    async getUserOrdersAsync(userId: number): Promise<OrderResponse[]> {
        const response = await httpGet<OrderResponse[]>(`orders/user/${userId}`);
        return response;
    }
}

export const orderServices = new OrderServices();
