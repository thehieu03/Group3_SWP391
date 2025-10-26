import { httpGet } from "@utils/http";
import type {OrderUserResponse} from "@models/modelResponse/OrderUserResponse.ts";

class OrderServices {
  async getOrdersUserAsync():Promise<OrderUserResponse[]>{
      const response = await httpGet<OrderUserResponse[]>("orders/my-orders");
      return response;
  }
}

export const orderServices = new OrderServices();
