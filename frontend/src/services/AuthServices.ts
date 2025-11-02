import { httpGet, httpPost } from "@utils/http.ts";
import type { LoginRequest } from "@models/modelRequest/LoginRequest";
import type { RegisterRequest } from "@models/modelRequest/RegisterRequest";
import type { LoginOrRegisterWithGoogleRequest } from "@models/modelRequest/LoginOrRegisterWithGoogleRequest";
import type { LoginResponse, User } from "@models/modelResponse/LoginResponse";

class AuthServices {
  async loginAsync(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await httpPost<LoginResponse, LoginRequest>(
      "auth/login",
      loginData
    );
    return response;
  }

  async loginOrRegisterWithGoogleAsync(
    googleData: LoginOrRegisterWithGoogleRequest
  ): Promise<LoginResponse> {
    const response = await httpPost<
      LoginResponse,
      LoginOrRegisterWithGoogleRequest
    >("accounts/google", googleData);
    return response;
  }

  async registerAsync(registerData: RegisterRequest): Promise<LoginResponse> {
    const response = await httpPost<LoginResponse, RegisterRequest>(
      "auth/register",
      registerData
    );
    return response;
  }

  async getCurrentUserAsync(): Promise<User> {
    const response = await httpGet<User>("auth/me");
    return response;
  }

  async forgotPasswordAsync(email: string): Promise<{ message: string }> {
    const response = await httpPost<{ message: string }, { email: string }>(
      "auth/forgot-password",
      { email }
    );
    return response;
  }
}

export const authServices = new AuthServices();
