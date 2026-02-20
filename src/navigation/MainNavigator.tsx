import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";

import { ROUTE_NAMES, SCREEN_OPTIONS } from "../config/routes.config";
import { COLORS } from "../styles/colors";

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HeaderLogo = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text style={{ color: COLORS.WHITE, fontWeight: "bold", fontSize: 18 }}>BASE APP</Text>
  </View>
);

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

const HomeStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.HOME.SCREEN}
      component={HomeScreen}
      options={{ title: "Home", headerBackVisible: false }}
    />
    <Stack.Screen
      name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
      component={NotificationsScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Notifications")}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen name={ROUTE_NAMES.PROFILE.SCREEN} component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.EDIT_PROFILE}
      component={EditProfileScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Edit Profile")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.COMMON.SETTINGS}
      component={SettingsScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Settings")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
      component={NotificationsScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Notifications")}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Change Password")}
    />
    <Stack.Screen
      name="TermsPrivacy"
      component={TermsPrivacyScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Terms & Privacy")}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Support")}
    />
    <Stack.Screen
      name="NotificationSettings"
      component={NotificationSettingsScreen}
      options={({ navigation }: any) => CustomBackHeader(navigation, "Notification Settings")}
    />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = "home";
        if (route.name === ROUTE_NAMES.TABS.HOME) {
          iconName = focused ? SCREEN_OPTIONS.TAB_ICONS.HOME.focused : SCREEN_OPTIONS.TAB_ICONS.HOME.unfocused;
        } else if (route.name === ROUTE_NAMES.TABS.PROFILE) {
          iconName = focused ? SCREEN_OPTIONS.TAB_ICONS.PROFILE.focused : SCREEN_OPTIONS.TAB_ICONS.PROFILE.unfocused;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.PRIMARY,
      tabBarInactiveTintColor: COLORS.GRAY,
    })}
  >
    <Tab.Screen name={ROUTE_NAMES.TABS.HOME} component={HomeStack} options={{ tabBarLabel: "Home" }} />
    <Tab.Screen name={ROUTE_NAMES.TABS.PROFILE} component={ProfileStack} options={{ tabBarLabel: "Profile" }} />
  </Tab.Navigator>
);

export default MainNavigator;
