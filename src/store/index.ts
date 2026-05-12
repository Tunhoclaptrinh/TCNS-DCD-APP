import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import settingsReducer from "./slices/settingsSlice";
import reportReducer from "./slices/reportSlice";

// Initially syncing core slices. Add more as needed.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    settings: settingsReducer,
    report: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
