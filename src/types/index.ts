export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Metadata {
  [key: string]: any;
}

export interface User extends BaseEntity {
  data: User | undefined;
  username?: string;
  name: string;
  email: string;
  fullName?: string; // Fallback for old code
  role: "user" | "admin" | "researcher" | "customer";
  avatar?: string;
  permissions?: string[];
  points?: number;
  level?: number;
  phone?: string;
  address?: string;
  bio?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  data: AuthResponse | undefined;
  token: string;
  user: User;
  refreshToken?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password?: string;
  fullName?: string;
}
