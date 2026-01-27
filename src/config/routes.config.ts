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
  HeritageDetail: {id: number | string};
  ArtifactDetail: {artifact: any};
  
  // Main Stack - Discovery
  DiscoveryScreen: undefined;

  // Main Stack - Study
  StudyScreen: undefined;

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
    DISCOVERY: "Discovery",
    STUDY: "Study",
    GAME: "Game",
    PROFILE: "Profile",
  },

  // Discovery Stack
  DISCOVERY: {
    SCREEN: "DiscoveryScreen",
  },

  // Study Stack
  STUDY: {
     SCREEN: "StudyScreen",
  },

  // Home Stack
  HOME: {
    SCREEN: "HomeScreen",
    HERITAGE_DETAIL: "HeritageDetail",
    ARTIFACT_DETAIL: "ArtifactDetail",
  },

  // Profile Stack
  PROFILE: {
    SCREEN: "ProfileScreen",
    EDIT_PROFILE: "EditProfile",
  },

  // Common
  COMMON: {
    NOTIFICATIONS: "Notifications",
    SETTINGS: "Settings",
    AI_CHAT: "AIChat",
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
    DISCOVERY: {focused: "search", unfocused: "search-outline"},
    STUDY: {focused: "book", unfocused: "book-outline"},
    GAME: {focused: "basketball", unfocused: "basketball-outline"},
    PROFILE: {focused: "person", unfocused: "person-outline"},
  },
} as const;

// Navigation helper types
export type RootStackParamList = RouteParams;
export type TabParamList = Pick<
  RouteParams,
  "HomeScreen" | "ProfileScreen"
>;
