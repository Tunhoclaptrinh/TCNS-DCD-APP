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
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'researcher';
  avatar?: string;
  points: number;
  level: number;
  phone?: string;
  bio?: string;
  lastLogin?: string;
}

export interface AuthResponse {
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

export type FavoriteType = 'restaurant' | 'product' | 'heritage' | 'article' | 'artifact';

export interface Favorite {
  id: number;
  type: FavoriteType;
  referenceId: number;
  item?: any;
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}
