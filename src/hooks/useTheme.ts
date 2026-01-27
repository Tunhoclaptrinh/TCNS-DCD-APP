import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {LightTheme, DarkTheme} from "@/src/styles/theme";

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.settings.theme);

  const colors = themeMode === "dark" ? DarkTheme : LightTheme;
  const isDark = themeMode === "dark";

  return {colors, isDark, themeMode};
};
