import { apiClient } from "../config/api.client";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export abstract class BaseApiService<T> {
  protected abstract baseEndpoint: string;

  /**
   * Get all items with pagination and filters
   */
  async getAll(params?: any): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<any>(this.baseEndpoint, params);
    return response.data || response;
  }

  /**
   * Get item by ID
   */
  async getById(id: number | string): Promise<T> {
    const response = await apiClient.get<any>(`${this.baseEndpoint}/${id}`);
    return response.data || response;
  }

  /**
   * Create new item
   */
  async create(data: any): Promise<T> {
    const response = await apiClient.post<any>(this.baseEndpoint, data);
    return response.data || response;
  }

  /**
   * Update item
   */
  async update(id: number | string, data: any): Promise<T> {
    const response = await apiClient.put<any>(`${this.baseEndpoint}/${id}`, data);
    return response.data || response;
  }

  /**
   * Delete item
   */
  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/${id}`);
  }
}
