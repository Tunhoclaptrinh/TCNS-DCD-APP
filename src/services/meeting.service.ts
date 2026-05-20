import { apiClient } from "../config/api.client";
import { ENDPOINTS } from "../config/api.config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MeetingParticipant {
  id: number;
  name: string;
  avatar?: string;
  studentId?: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface MeetingConfirmation {
  userId: number;
  rsvpStatus: "pending" | "accepted" | "declined";
  attendanceStatus: "none" | "present" | "late" | "absent";
  reason?: string;
  respondedAt?: string | null;
}

export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type RsvpStatus = "pending" | "accepted" | "declined";
export type AttendanceStatus = "none" | "present" | "late" | "absent";

export interface Meeting {
  id: number | string;
  title: string;
  location: string;
  meetingAt: string;      // ISO date-time — thời gian bắt đầu
  endAt?: string | null;  // ISO date-time — thời gian kết thúc
  agenda?: string;        // Nội dung / chương trình họp
  status: MeetingStatus;
  participantIds: number[];
  isAllParticipants: boolean;
  confirmations: MeetingConfirmation[];
  note?: string;
  createdBy: number;
  updatedBy?: number;
  // Populated by BE
  participants?: MeetingParticipant[];
  createdAt?: string;
  updatedAt?: string;
  // Minutes
  minutesContent?: string;
  minutesStatus?: "none" | "draft" | "submitted";
}

export interface MeetingListResponse {
  data: Meeting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMeetingPayload {
  title: string;
  location: string;
  meetingAt: string;       // ISO datetime
  endAt?: string;
  agenda?: string;
  note?: string;
  status?: MeetingStatus;
  participantIds?: number[];
  isAllParticipants?: boolean;
}

export interface UpdateMeetingPayload extends Partial<CreateMeetingPayload> {
  minutesContent?: string;
  minutesStatus?: "none" | "draft" | "submitted";
  chairpersonIds?: number[];
  secretaryIds?: number[];
  presentIds?: number[];
  absentIds?: number[];
}

export interface RsvpPayload {
  rsvpStatus: "accepted" | "declined";
  reason?: string;
}

export interface AttendancePayload {
  meetingId: number | string;
  userId: number;
  attendanceStatus: AttendanceStatus;
  reason?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class MeetingServiceClass {
  /**
   * Lấy danh sách cuộc họp.
   * BE tự lọc theo participantIds của user (nếu không có quyền manage).
   * Hỗ trợ filter: status, page, pageSize, sort, order.
   */
  async listMeetings(params?: {
    status?: MeetingStatus;
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
  }): Promise<Meeting[]> {
    // BE của parseApiQuery middleware đọc: limit (không phải pageSize), page, sort, order
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams["filter[status]"] = params.status;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.limit = String(params.pageSize); // ← BE dùng 'limit'
    if (params?.sort) queryParams.sort = params.sort;
    if (params?.order) queryParams.order = params.order;

    const res: any = await apiClient.get(ENDPOINTS.MEETINGS.BASE, queryParams);

    console.log("[MeetingService.listMeetings] res keys:", Object.keys(res ?? {}));
    console.log("[MeetingService.listMeetings] success:", res?.success, "| data length:", Array.isArray(res?.data) ? res.data.length : res?.data);

    if (Array.isArray(res?.data)) return res.data as Meeting[];
    if (Array.isArray(res)) return res as Meeting[];
    return [];
  }

  /**
   * Lấy chi tiết một cuộc họp.
   */
  async getMeetingById(id: number | string): Promise<Meeting> {
    const res: any = await apiClient.get(ENDPOINTS.MEETINGS.GET_ONE(id));
    return (res.data ?? res) as Meeting;
  }

  /**
   * Tạo lịch họp mới (chỉ duty:manage).
   */
  async createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const res: any = await apiClient.post(ENDPOINTS.MEETINGS.CREATE, payload);
    return (res.data ?? res) as Meeting;
  }

  /**
   * Cập nhật lịch họp (chỉ duty:manage).
   */
  async updateMeeting(
    id: number | string,
    payload: UpdateMeetingPayload
  ): Promise<Meeting> {
    const res: any = await apiClient.put(ENDPOINTS.MEETINGS.UPDATE(id), payload);
    return (res.data ?? res) as Meeting;
  }

  /**
   * Xóa lịch họp (chỉ duty:manage).
   */
  async deleteMeeting(id: number | string): Promise<{ success: boolean; id: number | string }> {
    const res: any = await apiClient.delete(ENDPOINTS.MEETINGS.DELETE(id));
    return res.data ?? res;
  }

  /**
   * RSVP cuộc họp (accepted / declined).
   * Nếu declined bắt buộc có reason.
   */
  async rsvpMeeting(id: number | string, payload: RsvpPayload): Promise<Meeting> {
    const res: any = await apiClient.post(ENDPOINTS.MEETINGS.RSVP(id), payload);
    return (res.data ?? res) as Meeting;
  }

  /**
   * Điểm danh thành viên trong cuộc họp (chỉ duty:manage).
   */
  async markAttendance(payload: AttendancePayload): Promise<Meeting> {
    const res: any = await apiClient.post(ENDPOINTS.MEETINGS.ATTENDANCE, payload);
    return (res.data ?? res) as Meeting;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Lấy RSVP status của user hiện tại trong cuộc họp.
   */
  getMyRsvp(meeting: Meeting, userId?: number | string): MeetingConfirmation | null {
    if (!userId || !meeting.confirmations?.length) return null;
    return (
      meeting.confirmations.find((c) => String(c.userId) === String(userId)) ?? null
    );
  }

  /**
   * Lấy số lượng xác nhận tham gia (accepted).
   */
  getAcceptedCount(meeting: Meeting): number {
    return (meeting.confirmations ?? []).filter((c) => c.rsvpStatus === "accepted").length;
  }

  /**
   * Kiểm tra cuộc họp đã qua chưa.
   */
  isPast(meeting: Meeting): boolean {
    if (!meeting.meetingAt) return false;
    return new Date(meeting.meetingAt).getTime() < Date.now();
  }

  /**
   * Format thời gian họp ra dạng "DD/MM/YYYY" và "HH:MM".
   */
  formatDateTime(isoString?: string | null): { date: string; time: string } {
    if (!isoString) return { date: "--/--/----", time: "--:--" };
    const d = new Date(isoString);
    const date = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date, time };
  }

  /**
   * Convert "DD/MM/YYYY" + "HH:MM" thành ISO string để gửi BE.
   */
  toIsoDateTime(dateStr: string, timeStr: string): string | null {
    // dateStr: "DD/MM/YYYY", timeStr: "HH:MM"
    const [day, month, year] = dateStr.split("/").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    if (!day || !month || !year || isNaN(hour) || isNaN(minute)) return null;
    const d = new Date(year, month - 1, day, hour, minute, 0, 0);
    return d.toISOString();
  }
}

export const MeetingService = new MeetingServiceClass();
