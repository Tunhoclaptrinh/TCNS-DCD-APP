import { Pagination } from './index';

export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  errors?: any[];
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
  errors?: any[];
}
