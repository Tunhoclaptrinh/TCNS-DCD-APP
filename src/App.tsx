import React, {useEffect} from "react";
import {ActivityIndicator, View, Text, TouchableOpacity, Alert} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Provider, useDispatch, useSelector} from "react-redux";
import {store, RootState} from "./store";
import {initializeAuth} from "./store/slices/authSlice";
import {API_CONFIG} from "./config/api.config";
import RootNavigator from "./navigation/RootNavigator";

const AppContent = () => {
  const dispatch = useDispatch<any>();
  const {isAuthenticated, isInitialized} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log("App: Dispatching initializeAuth...");
    dispatch(initializeAuth());
  }, [dispatch]);

  console.log(`App: Render. isInitialized=${isInitialized}, isAuthenticated=${isAuthenticated}`);

  // Debug: Expose config to UI
  if (!isInitialized) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{marginTop: 20, fontSize: 16, fontWeight: 'bold'}}>Đang kết nối đến máy chủ...</Text>
        <Text style={{marginTop: 10, color: '#666', textAlign: 'center'}}>URL: {API_CONFIG.BASE_URL}</Text>
        <Text style={{marginTop: 5, color: '#999', fontSize: 12, textAlign: 'center'}}>
          Nếu quay tròn mãi, hãy thử đổi IP bên dưới:
        </Text>

        <View style={{flexDirection: 'row', marginTop: 20, gap: 10}}>
             {/* Import Button here if needed, using standard ToucableOpacity for safety */}
             <TouchableOpacity 
                style={{padding: 10, backgroundColor: '#eee', borderRadius: 8}}
                onPress={() => {
                    import("./config/api.client").then(({apiClient}) => {
                        apiClient.setBaseUrl("http://10.0.2.2:3000/api");
                        Alert.alert("Thông báo", "Đã chuyển sang Emulator IP (10.0.2.2). App sẽ thử kết nối lại...");
                        dispatch(initializeAuth());
                    });
                }}
             >
                <Text>Dùng Emulator IP (10.0.2.2)</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                style={{padding: 10, backgroundColor: '#eee', borderRadius: 8}}
                onPress={() => {
                     import("./config/api.client").then(({apiClient}) => {
                        apiClient.setBaseUrl("http://192.168.1.141:3000/api");
                        Alert.alert("Thông báo", "Đã chuyển sang LAN IP (192.168.1.141). App sẽ thử kết nối lại...");
                        dispatch(initializeAuth());
                    });
                }}
             >
                <Text>Dùng LAN IP</Text>
             </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <RootNavigator isAuthenticated={isAuthenticated} />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
