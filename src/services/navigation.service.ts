import {createNavigationContainerRef} from "@react-navigation/native";
import type {RouteParams} from "@/src/config/routes.config";

export const navigationRef = createNavigationContainerRef<RouteParams>();

export function navigate<RouteName extends keyof RouteParams>(name: RouteName, params?: RouteParams[RouteName]) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(routeName: keyof RouteParams) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: routeName as any}],
    });
  }
}

export function replace<RouteName extends keyof RouteParams>(name: RouteName, params?: RouteParams[RouteName]) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: name as any, params: params as any}],
    });
  }
}

export const NavigationService = {
  // Auth flow
  toLogin: () => navigate("Login"),
  toRegister: () => navigate("Register"),

  // Home flow
  toHome: () => navigate("HomeScreen"),
  toHeritageDetail: (id: number | string) => navigate("HeritageDetail", {id}),

  // Search flow
  toSearch: () => navigate("DiscoveryScreen"),

  // Profile flow
  toProfile: () => navigate("ProfileScreen"),
  toEditProfile: () => navigate("EditProfile"),
  toChangePassword: () => navigate("Settings"), // Assuming change password is in Settings now or keep if exists
  toFavoritesList: () => navigate("FavoritesList"), // Kept but generic
  toNotificationSettings: () => navigate("Notifications"), // Or specific settings
  toSupport: () => navigate("Support"),
  toTermsPrivacy: () => navigate("TermsPrivacy"),



  // Common
  toNotifications: () => navigate("Notifications"),
  toSettings: () => navigate("Settings"),

  // Navigation actions
  goBack,
  reset,
  replace,
};

export default NavigationService;
