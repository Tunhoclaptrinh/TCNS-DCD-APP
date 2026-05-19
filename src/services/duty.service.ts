import { apiClient } from "../config/api.client";
import { ENDPOINTS } from "../config/api.config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DutyUser {
  id: number;
  name: string;
  studentId?: string;
  avatar?: string;
  role?: string;
  position?: string;
}

export interface DutySlot {
  id: number;
  shiftDate: string;
  shiftLabel: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  status: "open" | "locked";
  kipId: number;
  shiftId?: number;
  assignedUserIds: number[];
  attendedUserIds: number[];
  tempLeaderId?: number;
  assignedUsers: DutyUser[];
  attendedUsers: DutyUser[];
  note?: string;
  weekStart?: string;
}

export interface DutyShift {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  kips: DutyKip[];
}

export interface DutyKip {
  id: number;
  name: string;
  shiftId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  coefficient: number;
}

export interface WeeklyScheduleResponse {
  slots: DutySlot[];
  days: any[];
  templates: DutyShift[];
  userMetadata?: {
    weeklyQuota: number;
    registeredKips: number;
    limitMode: string;
    weeklyLimitEnabled: boolean;
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

class DutyServiceClass {
  /**
   * Lấy lịch trực theo tuần.
   * apiClient.get(url, params, config) — tham số 2 là params object trực tiếp.
   * Response interceptor đã unwrap response.data nên res chính là body JSON.
   */
  async getWeeklySchedule(
    weekStart: string,
    userId?: number
  ): Promise<{ weekStart: string; weekEnd: string; data: WeeklyScheduleResponse }> {
    // Truyền params là object thường (không wrap trong { params })
    const queryParams: Record<string, string> = { weekStart };
    if (userId) queryParams.userId = String(userId);

    console.log("[DutyService] GET /duty/week params:", queryParams);

    // apiClient.get(url, params, config) — tham số 2 là params
    const res: any = await apiClient.get(ENDPOINTS.DUTY.WEEK, queryParams);

    // response interceptor đã trả về response.data trực tiếp
    // BE trả về: { success, data: { slots, days, templates, userMetadata }, weekStart, weekEnd }
    console.log("[DutyService] Response keys:", Object.keys(res || {}));
    console.log("[DutyService] success:", res?.success, "| weekStart:", res?.weekStart);
    console.log("[DutyService] slots count:", res?.data?.slots?.length ?? "N/A");

    return {
      weekStart: res.weekStart,
      weekEnd: res.weekEnd,
      data: res.data as WeeklyScheduleResponse,
    };
  }

  /**
   * Lấy chi tiết một slot.
   */
  async getSlot(slotId: number): Promise<DutySlot> {
    const res: any = await apiClient.get(ENDPOINTS.DUTY.SLOT(slotId));
    return res.data ?? res;
  }

  /**
   * Tự đăng ký vào một slot.
   */
  async registerToSlot(slotId: number): Promise<DutySlot> {
    const res: any = await apiClient.patch(ENDPOINTS.DUTY.REGISTER(slotId));
    return res.data ?? res;
  }

  /**
   * Hủy đăng ký slot.
   */
  async cancelRegistration(slotId: number): Promise<DutySlot> {
    const res: any = await apiClient.patch(ENDPOINTS.DUTY.CANCEL(slotId));
    return res.data ?? res;
  }

  /**
   * Tự điểm danh (chỉ trong cửa sổ +/- 2 phút và đúng IP).
   */
  async selfCheckIn(slotId: number): Promise<DutySlot> {
    const res: any = await apiClient.post(ENDPOINTS.DUTY.SELF_CHECK_IN(slotId));
    return res.data ?? res;
  }

  /**
   * Kíp trưởng điểm danh cho thành viên.
   * BE controller dùng body: { ids, isIncremental }
   */
  async markAttendance(slotId: number, userIds: number[]): Promise<DutySlot> {
    const res: any = await apiClient.post(
      ENDPOINTS.DUTY.MARK_ATTENDANCE(slotId),
      { ids: userIds, isIncremental: true }
    );
    return res.data ?? res;
  }

  /**
   * Kíp trưởng điểm danh từng thành viên riêng lẻ (toggle).
   * BE controller: if (userId) => leaderMarkAttendance, body: { userId }
   */
  async leaderMarkAttendance(slotId: number, targetUserId: number): Promise<DutySlot> {
    const res: any = await apiClient.post(
      ENDPOINTS.DUTY.LEADER_MARK_ATTENDANCE(slotId),
      { userId: targetUserId }
    );
    return res.data ?? res;
  }

  /**
   * Lấy logs điểm danh của một slot.
   */
  async getSlotLogs(slotId: number): Promise<any[]> {
    const res: any = await apiClient.get(ENDPOINTS.DUTY.SLOT_LOGS(slotId));
    return res.data ?? res ?? [];
  }

  /**
   * Cập nhật thông tin Ca trực (shift) — chỉ admin/staff.
   * PUT /duty/shifts/:id
   */
  async updateShift(shiftId: number, payload: {
    name?: string;
    startTime?: string;
    endTime?: string;
    note?: string;
    status?: string;
  }): Promise<any> {
    const res: any = await apiClient.put(
      ENDPOINTS.DUTY.UPDATE_SHIFT(shiftId),
      payload
    );
    return res.data ?? res;
  }

  /**
   * Cập nhật thông tin Kíp trực — chỉ admin/staff.
   * PUT /duty/kips/:id
   */
  async updateKip(kipId: number, payload: {
    name?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    coefficient?: number;
    note?: string;
    status?: string;
  }): Promise<any> {
    const res: any = await apiClient.put(
      ENDPOINTS.DUTY.UPDATE_KIP(kipId),
      payload
    );
    return res.data ?? res;
  }

  /**
   * Xóa kíp trực — chỉ admin/staff.
   * DELETE /duty/kips/:id
   */
  async deleteKip(kipId: number): Promise<any> {
    const res: any = await apiClient.delete(
      ENDPOINTS.DUTY.DELETE_KIP(kipId)
    );
    return res.data ?? res;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Tính ngày thứ 2 của tuần chứa date (dùng local time).
   */
  getWeekStartDate(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay(); // 0=CN, 1=T2, ...6=T7
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Tính 7 ngày trong tuần từ weekStart "YYYY-MM-DD" (local time).
   */
  getWeekDays(weekStart: string): { date: Date; label: string; dateStr: string }[] {
    const [y, m, d] = weekStart.split("-").map(Number);
    const start = new Date(y, m - 1, d); // local time, không UTC
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const dateStr = day.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      return { date: day, label: labels[i], dateStr };
    });
  }

  /**
   * Kiểm tra cửa sổ self check-in +/- 2 phút.
   */
  isInCheckInWindow(shiftDate: string, startTime?: string): boolean {
    if (!startTime) return false;
    const [hour, minute] = startTime.split(":").map(Number);
    // Parse shiftDate là ngày (YYYY-MM-DD hoặc ISO), set giờ bắt đầu ca theo local
    const raw = shiftDate.substring(0, 10); // "YYYY-MM-DD"
    const [sy, sm, sd] = raw.split("-").map(Number);
    const shiftStart = new Date(sy, sm - 1, sd, hour, minute, 0, 0);
    const diffMin = (Date.now() - shiftStart.getTime()) / 60000;
    return diffMin >= -2 && diffMin <= 2;
  }
}

export const DutyService = new DutyServiceClass();
