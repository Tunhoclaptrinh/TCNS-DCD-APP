/**
 * Routes Configuration
 * Centralized route definitions for the app
 */

export type RouteParams = {
  // Auth Stack
  Login: undefined;
  Register: undefined;

  // Main Stack - Home
  HomeScreen: undefined;

  // Main Stack - Duty
  DutyScreen: undefined;

  // Main Stack - Profile
  ProfileScreen: undefined;
  EditProfile: undefined;

  // Common
  Notifications: undefined;
  Settings: undefined;
  FavoritesList: undefined;
  Support: undefined;
  TermsPrivacy: undefined;
  NotificationSettings: undefined;
};

export const ROUTE_NAMES = {
  // Auth
  AUTH: {
    LOGIN: "Login",
    REGISTER: "Register",
  },

  // Main Tabs
  TABS: {
    HOME: "Home",
    DUTY: "Duty",
    PROFILE: "Profile",
  },

  // Home Stack
  HOME: {
    SCREEN: "HomeScreen",
  },

  // Profile Stack
  PROFILE: {
    SCREEN: "ProfileScreen",
    EDIT_PROFILE: "EditProfile",
  },

  // Duty Stack
  DUTY: {
    SCREEN: "DutyScreen",
  },

  // Common
  COMMON: {
    NOTIFICATIONS: "Notifications",
    SETTINGS: "Settings",
  },
} as const;

export const SCREEN_OPTIONS = {
  // Common header styles
  DEFAULT_HEADER: {
    headerShown: true,
    headerStyle: {
      backgroundColor: "#FFFFFF",
    },
    headerTintColor: "#FF6B6B",
    headerTitleStyle: {
      fontWeight: "700" as const,
    },
  },

  // Modal presentation
  MODAL: {
    presentation: "modal" as const,
  },

  // No header
  NO_HEADER: {
    headerShown: false,
  },

  // Tab bar icons
  TAB_ICONS: {
    HOME: {focused: "home", unfocused: "home-outline"},
    DUTY: {focused: "calendar", unfocused: "calendar-outline"},
    PROFILE: {focused: "person", unfocused: "person-outline"},
  },
} as const;

// Navigation helper types
export type RootStackParamList = RouteParams;
export type TabParamList = Pick<RouteParams, "HomeScreen" | "DutyScreen" | "ProfileScreen">;
