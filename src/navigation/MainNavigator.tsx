import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { ROUTE_NAMES, SCREEN_OPTIONS } from "../config/routes.config";
import { COLORS } from "../styles/colors";
import { useTheme } from "../hooks/useTheme";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import TermsPrivacyScreen from "../screens/profile/TermsPrivacyScreen";
import SupportScreen from "../screens/profile/SupportScreen";
import NotificationSettingsScreen from "../screens/profile/NotificationSettingsScreen";
import DutyScreen from "../screens/duty/DutyScreen";
import RegisterDutyScreen from "../screens/duty/RegisterDutyScreen";
import EditShiftKipScreen from "../screens/duty/EditShiftKipScreen";
import MeetingListScreen from "../screens/meetings/MeetingListScreen";
import MeetingDetailScreen from "../screens/meetings/MeetingDetailScreen";
import BonusCampaignsScreen from "../screens/bonus/BonusCampaignsScreen";
import RegisterBonusScreen from "../screens/bonus/RegisterBonusScreen";
import ActivityReportScreen from "../screens/profile/ActivityReportScreen";
import FinancialReportScreen from "../screens/profile/FinancialReportScreen";
import FeedbackScreen from "../screens/profile/FeedbackScreen";
import FormListScreen from "../screens/forms/FormListScreen";
import SubmitFormScreen from "../screens/forms/SubmitFormScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HeaderLogo = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Image
      source={require("../assets/logo-dcd/logo.png")}
      style={{ width: 40, height: 35, marginBottom: 4, marginTop: 1 }}
    />
  </View>
);

const HomeStack = () => {
  const { colors } = useTheme();

  const GLOBAL_HEADER_OPTIONS = {
    ...SCREEN_OPTIONS.DEFAULT_HEADER,
    headerStyle: { backgroundColor: COLORS.PRIMARY },
    headerTintColor: COLORS.WHITE,
    headerRight: () => <HeaderLogo />,
  };

  const CustomBackHeader = (navigation: any, title?: string) => ({
    headerBackVisible: false,
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingRight: 16,
          paddingLeft: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
      <Stack.Screen
        name={ROUTE_NAMES.HOME.SCREEN}
        component={HomeScreen}
        options={{ title: "Home", headerBackVisible: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
        component={NotificationsScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Notifications")
        }
      />
    </Stack.Navigator>
  );
};

const DutyStack = () => {
  const { colors } = useTheme();

  const GLOBAL_HEADER_OPTIONS = {
    ...SCREEN_OPTIONS.DEFAULT_HEADER,
    headerStyle: { backgroundColor: COLORS.PRIMARY },
    headerTintColor: COLORS.WHITE,
    headerRight: () => <HeaderLogo />,
  };

  const CustomBackHeader = (navigation: any, title?: string) => ({
    headerBackVisible: false,
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ flexDirection: "row", alignItems: "center", paddingRight: 16, paddingLeft: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
      <Stack.Screen
        name={ROUTE_NAMES.DUTY.SCREEN}
        component={DutyScreen}
        options={{ title: "Lịch trực", headerBackVisible: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DUTY.REGISTER_DUTY}
        component={RegisterDutyScreen}
        options={({ navigation }: any) => CustomBackHeader(navigation, "Đăng ký lịch trực")}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DUTY.EDIT_SHIFT_KIP}
        component={EditShiftKipScreen}
        options={({ navigation }: any) => CustomBackHeader(navigation, "Chi tiết ca / kíp")}
      />
    </Stack.Navigator>
  );
};

const MeetingStack = () => {
  const GLOBAL_HEADER_OPTIONS = {
    ...SCREEN_OPTIONS.DEFAULT_HEADER,
    headerStyle: { backgroundColor: COLORS.PRIMARY },
    headerTintColor: COLORS.WHITE,
    headerRight: () => <HeaderLogo />,
  };

  const CustomBackHeader = (navigation: any, title?: string) => ({
    headerBackVisible: false,
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ flexDirection: "row", alignItems: "center", paddingRight: 16, paddingLeft: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
      <Stack.Screen
        name={ROUTE_NAMES.MEETINGS.LIST}
        component={MeetingListScreen}
        options={{ title: "Lịch họp", headerBackVisible: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MEETINGS.DETAIL}
        component={MeetingDetailScreen}
        options={({ navigation }: any) => CustomBackHeader(navigation, "Chi tiết cuộc họp")}
      />
    </Stack.Navigator>
  );
};

const BonusStack = () => {
  const GLOBAL_HEADER_OPTIONS = {
    ...SCREEN_OPTIONS.DEFAULT_HEADER,
    headerStyle: { backgroundColor: COLORS.PRIMARY },
    headerTintColor: COLORS.WHITE,
    headerRight: () => <HeaderLogo />,
  };

  const CustomBackHeader = (navigation: any, title?: string) => ({
    headerBackVisible: false,
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ flexDirection: "row", alignItems: "center", paddingRight: 16, paddingLeft: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
      <Stack.Screen
        name={ROUTE_NAMES.BONUS.CAMPAIGNS}
        component={BonusCampaignsScreen}
        options={{ title: "Cộng điểm", headerBackVisible: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.BONUS.REGISTER}
        component={RegisterBonusScreen}
        options={({ navigation }: any) => CustomBackHeader(navigation, "Đăng ký điểm cộng")}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { colors } = useTheme();

  const GLOBAL_HEADER_OPTIONS = {
    ...SCREEN_OPTIONS.DEFAULT_HEADER,
    headerStyle: { backgroundColor: COLORS.PRIMARY },
    headerTintColor: COLORS.WHITE,
    headerRight: () => <HeaderLogo />,
  };

  const CustomBackHeader = (navigation: any, title?: string) => ({
    headerBackVisible: false,
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingRight: 16,
          paddingLeft: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.SCREEN}
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.EDIT_PROFILE}
        component={EditProfileScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Edit Profile")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.COMMON.SETTINGS}
        component={SettingsScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Settings")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
        component={NotificationsScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Notifications")
        }
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Change Password")
        }
      />
      <Stack.Screen
        name="TermsPrivacy"
        component={TermsPrivacyScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Terms & Privacy")
        }
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Support")
        }
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Notification Settings")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE_EXTRAS.ACTIVITY_REPORT}
        component={ActivityReportScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Thống kê hoạt động")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE_EXTRAS.FINANCIAL_REPORT}
        component={FinancialReportScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Tài chính cá nhân")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE_EXTRAS.FEEDBACK}
        component={FeedbackScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Đóng góp ý kiến")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORMS.LIST}
        component={FormListScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Đơn từ")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORMS.SUBMIT}
        component={SubmitFormScreen}
        options={({ navigation }: any) =>
          CustomBackHeader(navigation, "Điền đơn")
        }
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "home";
          if (route.name === ROUTE_NAMES.TABS.HOME) {
            iconName = focused
              ? SCREEN_OPTIONS.TAB_ICONS.HOME.focused
              : SCREEN_OPTIONS.TAB_ICONS.HOME.unfocused;
          } else if (route.name === ROUTE_NAMES.TABS.DUTY) {
            iconName = focused
              ? SCREEN_OPTIONS.TAB_ICONS.DUTY.focused
              : SCREEN_OPTIONS.TAB_ICONS.DUTY.unfocused;
          } else if (route.name === "Meetings") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Bonus") {
            iconName = focused ? "star" : "star-outline";
          } else if (route.name === ROUTE_NAMES.TABS.PROFILE) {
            iconName = focused
              ? SCREEN_OPTIONS.TAB_ICONS.PROFILE.focused
              : SCREEN_OPTIONS.TAB_ICONS.PROFILE.unfocused;
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: colors.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: colors.CARD_BG,
          borderTopColor: colors.BORDER,
        },
      })}
    >
      <Tab.Screen
        name={ROUTE_NAMES.TABS.HOME}
        component={HomeStack}
        options={{ tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen
        name={ROUTE_NAMES.TABS.DUTY}
        component={DutyStack}
        options={{ tabBarLabel: "Lịch trực" }}
      />
      <Tab.Screen
        name="Meetings"
        component={MeetingStack}
        options={{ tabBarLabel: "Lịch họp" }}
      />
      <Tab.Screen
        name="Bonus"
        component={BonusStack}
        options={{ tabBarLabel: "Điểm cộng" }}
      />
      <Tab.Screen
        name={ROUTE_NAMES.TABS.PROFILE}
        component={ProfileStack}
        options={{ tabBarLabel: "Cá nhân" }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
