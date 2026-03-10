import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Load settings from AsyncStorage
export const loadSettings = createAsyncThunk(
  "settings/loadSettings",
  async () => {
    try {
      const theme = await AsyncStorage.getItem("theme");
      const language = await AsyncStorage.getItem("language");
      const biometricsEnabled = await AsyncStorage.getItem("biometric_enabled");

      return {
        theme: (theme as "light" | "dark") || "light",
        language: (language as "vi" | "en") || "vi",
        biometricsEnabled: biometricsEnabled === "true",
      };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return {
        theme: "light" as const,
        language: "vi" as const,
        biometricsEnabled: false,
      };
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
      // Persist to storage
      AsyncStorage.setItem("theme", action.payload).catch((err) =>
        console.error("Failed to save theme:", err),
      );
    },
    setLanguage(state, action: PayloadAction<"vi" | "en">) {
      state.language = action.payload;
      // Persist to storage
      AsyncStorage.setItem("language", action.payload).catch((err) =>
        console.error("Failed to save language:", err),
      );
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleBiometrics(state) {
      state.biometricsEnabled = !state.biometricsEnabled;
      // Persist to storage
      AsyncStorage.setItem(
        "biometric_enabled",
        state.biometricsEnabled.toString(),
      ).catch((err) =>
        console.error("Failed to save biometrics setting:", err),
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.theme = action.payload.theme;
      state.language = action.payload.language;
      state.biometricsEnabled = action.payload.biometricsEnabled;
    });
  },
});

export const { setTheme, setLanguage, toggleNotifications, toggleBiometrics } =
  settingsSlice.actions;
export default settingsSlice.reducer;
