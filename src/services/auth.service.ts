import { apiClient } from "../config/api.client";
import { ENDPOINTS } from "../config/api.config";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";
import { BaseApiResponse } from "../types/api.types";

/**
 * Auth Service
 * Handles authentication operations
 */
class AuthServiceClass {
  protected baseEndpoint = ENDPOINTS.AUTH.LOGIN.split("/login")[0]; // '/auth'

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.success || response.token) {
        return response.data || response;
    }
    return response as any;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.AUTH.REGISTER, data);
    if (response.success || response.token) {
        return response.data || response;
    }
    return response as any;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<any>(ENDPOINTS.AUTH.ME);
    if (response.success || response.id) {
        return response.data || response;
    }
    return response as any;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Refresh token (if implemented)
   */
  async refreshToken(): Promise<{token: string}> {
    // Assuming backend endpoint exists or is standard
    // Note: api.client.ts usually handles refresh token logic automatically via interceptors
    return { token: "" }; 
  }
}

export const AuthService = new AuthServiceClass();
