import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  notifications: boolean;
  biometrics: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'vi',
  notifications: true,
  biometrics: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    toggleBiometrics: (state) => {
      state.biometrics = !state.biometrics;
    },
  },
});

export const { setTheme, setLanguage, toggleNotifications, toggleBiometrics } = settingsSlice.actions;
export default settingsSlice.reducer;
