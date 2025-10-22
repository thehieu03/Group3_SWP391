import { httpGet, httpPost } from "@utils/http.tsx";
import type { LoginRequest } from "@models/modelRequest/LoginRequest";
import type { LoginResponse, User } from "@models/modelResponse/LoginResponse";

class AuthServices {
  async loginAsync(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await httpPost<LoginResponse, LoginRequest>(
      "auth/login",
      loginData
    );
    return response;
  }
  async getCurrentUserAsync(): Promise<User> {
    const response = await httpGet<User>("auth/me");
    return response;
  }
}

export const authServices = new AuthServices();
