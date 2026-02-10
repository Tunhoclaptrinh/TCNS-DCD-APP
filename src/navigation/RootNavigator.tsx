import React, {useEffect, useState} from "react";
import {View, ActivityIndicator, Text, TouchableOpacity, StyleSheet} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {navigationRef} from "@services/navigation.service";
import * as LocalAuthentication from "expo-local-authentication";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "../styles/colors";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import {RootState} from "@/src/store";
import {useSelector} from "react-redux";

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

const RootNavigator = ({isAuthenticated}: RootNavigatorProps) => {
  const {user} = useSelector((state: RootState) => state.auth);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    setIsLocked(false);
  }, [isAuthenticated]);

  const authenticate = async () => {
    // Placeholder for authentication logic
  };

  if (isAuthenticated && isLocked) {
      return (
        <View style={styles.lockContainer}>
             <Ionicons name="lock-closed" size={64} color={COLORS.PRIMARY} style={{marginBottom: 24}} />
             <Text style={styles.lockTitle}>Locked</Text>
             <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
                <Text style={styles.unlockText}>Unlock</Text>
             </TouchableOpacity>
        </View>
      );
  }

  const getNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }
    // Future role checks can go here
    return <MainNavigator />;
  };

  return <NavigationContainer ref={navigationRef}>{getNavigator()}</NavigationContainer>;
};

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  unlockButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
  },
  unlockText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RootNavigator;
