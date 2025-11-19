import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const http = axios.create({ baseURL: "/api/" });
http.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic if:
    // 1. Request is already retried
    // 2. Request is to refresh token endpoint (avoid infinite loop)
    // 3. Request is to login endpoint
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");
    const isLoginEndpoint = originalRequest.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        // If no refresh token, logout immediately
        if (!refreshToken) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          window.location.href = "/";
          return Promise.reject(error);
        }

        // Use axios directly to avoid interceptor loop
        // Create a new axios instance without interceptors for refresh token call
        const refreshAxios = axios.create({
          baseURL: http.defaults.baseURL,
          headers: { "Content-Type": "application/json" },
        });

        const refreshResponse = await refreshAxios.post("auth/refresh", {
          refreshToken,
        });

        const { accessToken } = refreshResponse.data;
        Cookies.set("accessToken", accessToken, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export type ApiEnvelope<T> = { data: T };
export async function httpGet<T>(
  path: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const res = await http.get<T>(path, options);
  return res.data;
}

export async function httpPost<T, D = unknown>(
  path: string,
  data?: D,
  options?: AxiosRequestConfig
): Promise<T> {
  const res = await http.post<T>(path, data, options);
  return res.data;
}

export async function httpPut<T, D = unknown>(
  path: string,
  data?: D,
  options?: AxiosRequestConfig
): Promise<T> {
  const res = await http.put<T>(path, data, options);
  return res.data;
}

export async function httpDelete<T>(
  path: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const res = await http.delete<T>(path, options);
  return res.data;
}

export async function httpPatch<T, D = unknown>(
  path: string,
  data?: D,
  options?: AxiosRequestConfig
): Promise<T> {
  const res = await http.patch<T>(path, data, options);
  return res.data;
}

export default http;
