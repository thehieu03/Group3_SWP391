import { httpPost } from "../utils/http.tsx";
import type { LoginRequest } from "../models/modelReqeust/LoginRequest";
import type { LoginResponse } from "../models/modelResponse/LoginResponse";

class AuthServices {
    async loginAsync(loginData: LoginRequest): Promise<LoginResponse> {
        const response = await httpPost<LoginResponse, LoginRequest>("auth/login", loginData);
        return response;
    }
}

export const authServices = new AuthServices();