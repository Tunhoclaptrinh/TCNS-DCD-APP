export const API_CONFIG = {
  // Use 10.0.2.2 for Android Emulator to access host machine's localhost
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.101:3000/api",
  TIMEOUT: 60000, // Increased to 60s for Render cold starts
  AUTH_TIMEOUT: 90000, // 90s for auth endpoints (handles cold starts)
  RETRY_COUNT: 3,
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Users
  USERS: {
    BASE: "/users",
    GET_ONE: (id: number | string) => `/users/${id}`,
    PROFILE: "/users/profile",
    STATS: "/users/stats/summary",
  },

  // Reviews/Comments
  REVIEWS: {
    BASE: "/reviews",
    GET_BY_TYPE: (type: string) => `/reviews/type/${type}`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: (id: number | string) => `/notifications/${id}/read`,
  },

  // Duty (Lịch trực)
  DUTY: {
    WEEK: "/duty/week",
    SLOT: (id: number | string) => `/duty/slots/${id}`,
    REGISTER: (id: number | string) => `/duty/slots/${id}/register`,
    CANCEL: (id: number | string) => `/duty/slots/${id}/cancel`,
    SELF_CHECK_IN: (id: number | string) => `/duty/slots/${id}/check-in`,
    MARK_ATTENDANCE: (id: number | string) => `/duty/slots/${id}/attendance`,
    // Kíp trưởng điểm danh từng thành viên (POST body: { userId })
    LEADER_MARK_ATTENDANCE: (id: number | string) => `/duty/slots/${id}/attendance`,
    // Logs
    SLOT_LOGS: (id: number | string) => `/duty/slots/${id}/logs`,
    STATS: "/duty/stats/summary",
    // Shift management (duty:manage)
    UPDATE_SHIFT: (id: number | string) => `/duty/shifts/${id}`,
    // Kip management (duty:manage)
    UPDATE_KIP: (id: number | string) => `/duty/kips/${id}`,
    DELETE_KIP: (id: number | string) => `/duty/kips/${id}`,
  },
};
