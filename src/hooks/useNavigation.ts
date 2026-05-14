import {useNavigation as useRNNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import type {RouteParams} from "@/src/config/routes.config";
import {NavigationService} from "@/src/services/navigation.service";

type NavigationProp = NativeStackNavigationProp<RouteParams>;

export const useNavigation = () => {
  const navigation = useRNNavigation<NavigationProp>();

  return {
    // React Navigation instance methods (hook-based, use inside components)
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    canGoBack: navigation.canGoBack,
    reset: navigation.reset,
    replace: navigation.replace as any,

    // NavigationService shortcut helpers (ref-based, usable anywhere)
    service: NavigationService,
  };
};

export default useNavigation;
