import React from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootState } from "./src/store";

function RootContent() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
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
