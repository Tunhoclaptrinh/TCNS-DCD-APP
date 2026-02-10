import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  theme: "light" | "dark";
  language: "vi" | "en";
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: "light",
  language: "vi",
  notificationsEnabled: true,
  biometricsEnabled: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<"vi" | "en">) {
      state.language = action.payload;
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleBiometrics(state) {
      state.biometricsEnabled = !state.biometricsEnabled;
    },
  },
});

export const { setTheme, setLanguage, toggleNotifications, toggleBiometrics } = settingsSlice.actions;
export default settingsSlice.reducer;
