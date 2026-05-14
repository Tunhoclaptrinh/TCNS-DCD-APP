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
  RegisterDuty: { weekStart?: string };
  EditShiftKip: { shiftId: number; kipId?: number; weekStart: string };

  // Main Stack - Meetings
  MeetingList: undefined;
  MeetingDetail: { meetingId?: string };
  ManageMeeting: { meetingId?: string };

  // Main Stack - Bonus
  BonusCampaigns: undefined;
  RegisterBonus: { campaignId?: string };

  // Main Stack - Profile
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ActivityReport: undefined;
  FinancialReport: undefined;
  Feedback: undefined;

  // Main Stack - Forms
  FormList: undefined;
  SubmitForm: { formType?: string };

  // Common
  Notifications: undefined;
  Settings: undefined;
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
    REGISTER_DUTY: "RegisterDuty",
    EDIT_SHIFT_KIP: "EditShiftKip",
  },

  // Meetings Stack
  MEETINGS: {
    LIST: "MeetingList",
    DETAIL: "MeetingDetail",
    MANAGE: "ManageMeeting",
  },

  // Bonus Stack
  BONUS: {
    CAMPAIGNS: "BonusCampaigns",
    REGISTER: "RegisterBonus",
  },

  // Forms Stack
  FORMS: {
    LIST: "FormList",
    SUBMIT: "SubmitForm",
  },

  // Profile extras
  PROFILE_EXTRAS: {
    ACTIVITY_REPORT: "ActivityReport",
    FINANCIAL_REPORT: "FinancialReport",
    FEEDBACK: "Feedback",
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
