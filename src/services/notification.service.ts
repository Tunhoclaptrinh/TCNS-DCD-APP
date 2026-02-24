/**
 * Notification Service
 */

import {apiClient} from "../config/api.client";
import {BaseApiResponse} from "../types/api.types";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "review";
  refId?: number;
  isRead: boolean;
  createdAt: string;
}

class NotificationServiceClass {
  protected baseEndpoint = "/notifications";

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{unreadCount: number}>(`${this.baseEndpoint}`);
      return response.unreadCount || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`${this.baseEndpoint}/${id}/read`);
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseEndpoint}/read-all`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}`);
  }

  /**
   * Get notifications with filters
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<BaseApiResponse<Notification[]>> {
    const response = await apiClient.get<BaseApiResponse<Notification[]>>(this.baseEndpoint, params);
    
    // Support the possibility of data wrapping based on typical interceptor configs
    if (response.data && Array.isArray((response.data as any).data)) {
        return response.data as any;
    }
    
    return response as unknown as BaseApiResponse<Notification[]>;
  }
}

export const NotificationService = new NotificationServiceClass();
