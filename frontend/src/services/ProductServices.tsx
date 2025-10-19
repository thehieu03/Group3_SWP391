import type {ProductResponse} from "../models/modelResponse/ProductResponse.tsx";
import {httpGet} from "../utils/http.tsx";

class ProductServices {
    async getAllProducts(): Promise<ProductResponse[]> {
        const data = await httpGet<ProductResponse[]>("products");
        return data;
    }
}
export const productServices = new ProductServices();


