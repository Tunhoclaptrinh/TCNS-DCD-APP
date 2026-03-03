import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootState } from "./src/store";
import { loadSettings } from "./src/store/slices/settingsSlice";

function RootContent() {
  const dispatch = useDispatch<any>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    // Load saved settings from storage on app start
    dispatch(loadSettings());
  }, [dispatch]);

  return <RootNavigator isAuthenticated={isAuthenticated} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootContent />
      </SafeAreaProvider>
    </Provider>
  );
}
