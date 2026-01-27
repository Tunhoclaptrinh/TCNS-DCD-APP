import axios, {AxiosInstance, AxiosError} from "axios";
import {API_CONFIG} from "../config/api.config";
import {StorageService} from "../utils/storage";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(async (config) => {
      const token = await StorageService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`[API Req] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Res] ${response.status} ${response.config.url}`);
        return response.data;
      },
      async (error: AxiosError) => {
        console.error(`[API Err] ${error.config?.baseURL}${error.config?.url}`, error.message);
        if (error.response) {
            console.error("Status:", error.response.status, "Data:", error.response.data);
        }
        if (error.response?.status === 401) {
          // Token expired or invalid
          await StorageService.removeToken();
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, {params}) as Promise<T>;
  }

  post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data) as Promise<T>;
  }

  put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data) as Promise<T>;
  }

  patch<T>(url: string, data?: any): Promise<T> {
    return this.client.patch(url, data) as Promise<T>;
  }

  delete<T>(url: string): Promise<T> {
    return this.client.delete(url) as Promise<T>;
  }

  setBaseUrl(url: string) {
    this.client.defaults.baseURL = url;
  }
}

export const apiClient = new ApiClient();
