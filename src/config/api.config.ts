export const API_CONFIG = {
  // Use 10.0.2.2 for Android Emulator to access host machine's localhost
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.37:3000/api",
  TIMEOUT: 30000,
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

  // Heritage Sites (Di sản)
  HERITAGE: {
    BASE: "/heritage-sites",
    GET_ONE: (id: number | string) => `/heritage-sites/${id}`,
    SEARCH: "/heritage-sites/search",
    NEARBY: "/heritage-sites/nearby",
    ARTIFACTS: (id: number | string) => `/heritage-sites/${id}/artifacts`,
    TIMELINE: (id: number | string) => `/heritage-sites/${id}/timeline`,
  },

  // History / Articles
  HISTORY: {
    BASE: "/history",
    GET_ONE: (id: number | string) => `/history/${id}`,
    RELATED: (id: number | string) => `/history/${id}/related`,
    STATS: "/history/stats/summary",
  },

  // Artifacts (Hiện vật)
  ARTIFACTS: {
    BASE: "/artifacts",
    GET_ONE: (id: number | string) => `/artifacts/${id}`,
    SEARCH: "/artifacts/search",
    RELATED: (id: number | string) => `/artifacts/${id}/related`,
  },

  // Game System
  GAME: {
    PROGRESS: "/game/progress",
    CHAPTERS: "/game/chapters",
    CHAPTER_DETAIL: (id: number | string) => `/game/chapters/${id}`,
    UNLOCK_CHAPTER: (id: number | string) => `/game/chapters/${id}/unlock`,
    LEVELS: (chapterId: number | string) => `/game/levels/${chapterId}`,
    LEVEL_DETAIL: (id: number | string) => `/game/levels/${id}/detail`,
    START_LEVEL: (id: number | string) => `/game/levels/${id}/start`,
    COLLECT_CLUE: (id: number | string) => `/game/levels/${id}/collect-clue`,
    COMPLETE_LEVEL: (id: number | string) => `/game/levels/${id}/complete`,
    // Session Management
    NEXT_SCREEN: (sessionId: number | string) => `/game/sessions/${sessionId}/next-screen`,
    SUBMIT_ANSWER: (sessionId: number | string) => `/game/sessions/${sessionId}/submit-answer`,
    SUBMIT_TIMELINE: (sessionId: number | string) => `/game/sessions/${sessionId}/submit-timeline`,
    
    MUSEUM: "/game/museum",
    BADGES: "/game/badges",
    LEADERBOARD: "/game/leaderboard",
    INVENTORY: "/game/inventory",
  },

  // AI Assistant
  AI: {
    CHAT: "/ai/chat",
    HISTORY: "/ai/history",
    ASK_HINT: "/ai/ask-hint",
    EXPLAIN: "/ai/explain",
    QUIZ: "/ai/quiz",
  },

  // Collections (User Content)
  COLLECTIONS: {
    BASE: "/collections",
    GET_ONE: (id: number | string) => `/collections/${id}`,
    ADD_ARTIFACT: (id: number | string, artifactId: number | string) => `/collections/${id}/artifacts/${artifactId}`,
    REMOVE_ARTIFACT: (id: number | string, artifactId: number | string) => `/collections/${id}/artifacts/${artifactId}`,
  },

  // Favorites
  FAVORITES: {
    BASE: "/favorites",
    GET_BY_TYPE: (type: string) => `/favorites/${type}`,
    TOGGLE: (type: string, id: number | string) => `/favorites/${type}/${id}/toggle`, // type: 'heritage' | 'artifact'
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
