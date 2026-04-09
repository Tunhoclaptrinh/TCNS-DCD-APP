export const API_CONFIG = {
  // Use 10.0.2.2 for Android Emulator to access host machine's localhost
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://172.16.11.37:3000/api",
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

  // Collections (User Content)
  COLLECTIONS: {
    BASE: "/collections",
    GET_ONE: (id: number | string) => `/collections/${id}`,
  },

  // Favorites
  FAVORITES: {
    BASE: "/favorites",
    GET_BY_TYPE: (type: string) => `/favorites/${type}`,
    TOGGLE: (type: string, id: number | string) =>
      `/favorites/${type}/${id}/toggle`,
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
};
