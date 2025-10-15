import axios, {type AxiosRequestConfig} from "axios";

// Use Vite dev proxy: calls to /api will be proxied to backend
const http = axios.create({baseURL: "/api/"});

export type ApiEnvelope<T> = { data: T };
export async function httpGet<T>(
    path: string,
    options?: AxiosRequestConfig
): Promise<T> {
    const res = await http.get<T>(path, options);
    return res.data;
}
export default http;
