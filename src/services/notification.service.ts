/**
 * Notification Service
 */

import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";

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

class NotificationServiceClass extends BaseApiService<Notification> {
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
    await this.delete(id);
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
  }): Promise<PaginatedResponse<Notification>> {
    const response = await this.getAll(params);
    
    // Map backend snake_case to frontend camelCase
    if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            message: item.message,
            type: item.type,
            refId: item.ref_id,
            isRead: item.is_read || false,
            createdAt: item.created_at,
        }));
    }
    
    return response;
  }
}

export const NotificationService = new NotificationServiceClass();
