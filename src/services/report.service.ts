import { apiClient } from "../config/api.client";
import { BaseApiResponse } from "../types/api.types";

export interface ReportOverview {
  generatedAt: string;
  users: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    expelledUsers: number;
    usersByRole: Record<string, number>;
  };
  duty: {
    totalSlots: number;
    totalCapacity: number;
    totalAssigned: number;
    coverageRate: number;
    pendingSwapRequests: number;
  };
  finance: {
    totalEntries: number;
    totalReward: number;
    totalPenalty: number;
    netBalance: number;
  };
  notifications: {
    totalNotifications: number;
    unreadNotifications: number;
  };
  recentNotifications: any[];
}

class ReportServiceClass {
  protected baseEndpoint = "/reports";

  /**
   * Get overview report
   */
  async getOverview(): Promise<ReportOverview> {
    const response = await apiClient.get<BaseApiResponse<ReportOverview>>(`${this.baseEndpoint}/overview`);
    // API client resolves response.data when status >= 200 && status < 300
    // but in case it's nested in data
    if ((response as any).data && (response as any).data.duty) {
      return (response as any).data as ReportOverview;
    }
    return response as unknown as ReportOverview;
  }
}

export const ReportService = new ReportServiceClass();
