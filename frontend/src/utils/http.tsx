import axios, {type AxiosRequestConfig} from "axios";

const http = axios.create({baseURL: "http://localhost:8080/api/v1"});

export type ApiEnvelope<T> = { data: T };
export async function httpGet<T>(
    path: string,
    options?: AxiosRequestConfig
): Promise<T> {
    const res = await http.get<T>(path, options);
    return res.data;
}
export default http;