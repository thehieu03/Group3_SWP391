import axios, {type AxiosRequestConfig} from "axios";
import Cookies from 'js-cookie';

const http = axios.create({baseURL: "/api/"});
http.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
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
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Sử dụng http client đã có sẵn với baseURL
                const response = await http.post('/auth/refresh', {
                    refreshToken
                });

                const isHttps = window.location.protocol === 'https:';
                const { accessToken } = response;
                
                if (!accessToken) {
                    throw new Error('No access token in refresh response');
                }
                
                Cookies.set('accessToken', accessToken, {
                    expires: 7,
                    secure: isHttps,
                    sameSite: 'strict'
                });
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return http(originalRequest);
            } catch (refreshError) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                window.location.href = '/login';
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

export default http;
