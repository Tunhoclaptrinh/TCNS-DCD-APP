import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useAuth } from "@/src/hooks/useAuth";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import { validateEmail, validatePassword } from "@/src/utils/validation";
import { COLORS } from "@/src/styles/colors";
import { useTranslation } from "@/src/utils/i18n";
import { useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { BiometricService } from "@/src/utils/biometric";
import { StorageService } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("123456");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState("Sinh trắc học");

  const { t } = useTranslation();
  const { colors } = useTheme();
  const biometricsEnabled = useSelector(
    (state: RootState) => state.settings.biometricsEnabled,
  );

  // Kiểm tra khả năng sử dụng sinh trắc học khi component mount
  useEffect(() => {
    checkBiometricAvailability();
  }, [biometricsEnabled]);

  const checkBiometricAvailability = async () => {
    if (!biometricsEnabled) {
      console.log("🔒 Biometrics not enabled in settings");
      setBiometricAvailable(false);
      return;
    }

    const isAvailable = await BiometricService.isAvailable();
    const hasSavedCredentials = await StorageService.getBiometricCredentials();

    console.log("🔐 Biometric check:", {
      enabled: biometricsEnabled,
      hardwareAvailable: isAvailable,
      hasCredentials: !!hasSavedCredentials,
    });

    setBiometricAvailable(isAvailable && hasSavedCredentials !== null);

    if (isAvailable) {
      const typeName = await BiometricService.getBiometricTypeName();
      setBiometricType(typeName);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!validateEmail(email)) newErrors.email = t("auth.invalidEmail");
    if (!validatePassword(password))
      newErrors.password = t("auth.passwordTooShort");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || t("auth.loginFailed");

      // Xử lý lỗi rate limiting
      if (error.response?.status === 429) {
        Alert.alert(
          t("auth.tooManyAttempts"),
          t("auth.tooManyAttemptsMessage"),
          [{ text: t("common.ok") }],
        );
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      // Xác thực sinh trắc học
      const isAuthenticated = await BiometricService.authenticate(
        t("auth.loginWithBiometric", { type: biometricType }),
      );

      if (!isAuthenticated) {
        return; // User đã hủy hoặc xác thực thất bại
      }

      // Lấy credentials đã lưu
      const credentials = await StorageService.getBiometricCredentials();

      if (!credentials) {
        Alert.alert(t("common.error"), t("errors.unknownError"));
        setBiometricAvailable(false);
        return;
      }

      // Đăng nhập với credentials đã lưu
      setLoading(true);
      try {
        await login({
          email: credentials.email,
          password: credentials.password,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          t("errors.tryAgain");

        // Xử lý lỗi rate limiting
        if (error.response?.status === 429) {
          Alert.alert(
            t("auth.tooManyAttempts"),
            t("auth.tooManyAttemptsMessage"),
          );
        } else {
          Alert.alert(t("auth.loginFailed"), errorMessage);
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      Alert.alert(t("common.error"), t("errors.unknownError"));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>BASE APP</Text>
        <Text style={styles.subtitle}>{t("auth.welcomeBack")}</Text>
      </View>

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <Input
        label={t("auth.email")}
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={errors.email}
        containerStyle={styles.input}
      />

      <Input
        label={t("auth.password")}
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        containerStyle={styles.input}
      />

      <Button
        title={t("auth.login")}
        onPress={handleLogin}
        loading={loading}
        containerStyle={styles.button}
      />

      {biometricAvailable && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Ionicons
            name={biometricType.includes("Face") ? "scan" : "finger-print"}
            size={28}
            color={COLORS.PRIMARY}
          />
          <Text style={styles.biometricText}>
            {t("auth.loginWithBiometric", { type: biometricType })}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("auth.dontHaveAccount")} </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>{t("auth.register")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  content: { padding: 20, justifyContent: "center", flexGrow: 1 },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: "center",
  },
  input: { marginVertical: 12 },
  button: { marginTop: 20, width: "100%" },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.LIGHT_BLUE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    gap: 10,
  },
  biometricText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: { color: COLORS.ERROR, marginBottom: 12, textAlign: "center" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: COLORS.GRAY },
  linkText: { color: COLORS.PRIMARY, fontWeight: "600" },
});

export default LoginScreen;
