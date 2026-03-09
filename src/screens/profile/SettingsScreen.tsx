// src/screens/profile/SettingsScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/src/store";
import {
  setTheme,
  setLanguage,
  toggleNotifications,
  toggleBiometrics,
} from "@/src/store/slices/settingsSlice";
import { logout } from "@/src/store/slices/authSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication"; // Import thư viện
import { useTheme } from "@/src/hooks/useTheme"; // Import theme hook
import { useTranslation } from "@/src/utils/i18n"; // Import i18n hook
import { BiometricService } from "@/src/utils/biometric"; // Import BiometricService
import { StorageService } from "@/src/utils/storage"; // Import StorageService

const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  // Sử dụng hook Theme và Translation - giả định các hook này vẫn hoạt động hoặc sẽ được fix sau nếu lỗi
  // Nếu useTheme/useTranslation phụ thuộc vào store cũ, chúng cũng cần được refactor.
  // Tuy nhiên, ưu tiên fix lỗi build do import sai trước.
  const { colors, isDark } = useTheme();
  const { t, locale } = useTranslation();

  const { language, notificationsEnabled, biometricsEnabled } = useAppSelector(
    (state) => state.settings,
  );
  // Theme hiện tại đang được lấy từ useTheme hook, có thể bị conflict với store.
  // Để an toàn, ta tạm thời tin tưởng useTheme điều khiển UI, và settings store lưu trạng thái.

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleThemeToggle = (val: boolean) => {
    dispatch(setTheme(val ? "dark" : "light"));
  };

  const handleNotificationsToggle = () => {
    dispatch(toggleNotifications());
  };

  // Xử lý bật/tắt Sinh trắc học thực tế
  const handleBiometricsToggle = async () => {
    // Nếu đang bật -> tắt ngay
    if (biometricsEnabled) {
      dispatch(toggleBiometrics());
      // Xóa credentials đã lưu
      await StorageService.removeBiometricCredentials();
      Alert.alert(t("common.success"), t("settings.biometricsDisabled"));
      return;
    }

    // Nếu đang tắt -> bật lên (cần kiểm tra phần cứng)
    try {
      const isAvailable = await BiometricService.isAvailable();

      if (!isAvailable) {
        Alert.alert(t("common.error"), t("settings.biometricsError"));
        return;
      }

      // Kiểm tra xem đã có credentials được lưu chưa
      const savedCredentials = await StorageService.getBiometricCredentials();

      if (!savedCredentials) {
        // BẬT sinh trắc học TRƯỚC rồi yêu cầu đăng nhập lại
        dispatch(toggleBiometrics());

        Alert.alert(
          t("settings.biometricsRequireLogin"),
          t("settings.biometricsRequireLoginMessage"),
          [
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () => {
                // Nếu user hủy, tắt lại sinh trắc học
                dispatch(toggleBiometrics());
              },
            },
            {
              text: t("common.confirm"),
              onPress: () => {
                // Đăng xuất để họ đăng nhập lại
                dispatch(logout());
              },
            },
          ],
        );
        return;
      }

      // Nếu đã có credentials, xác thực thử để kích hoạt
      const biometricName = await BiometricService.getBiometricTypeName();
      const isAuthenticated = await BiometricService.authenticate(
        `Xác thực ${biometricName} để kích hoạt`,
      );

      if (isAuthenticated) {
        dispatch(toggleBiometrics());
        Alert.alert(t("common.success"), t("settings.biometricsEnabled"));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.error"), t("errors.unknownError"));
    }
  };

  const handleClearCache = () => {
    Alert.alert(t("settings.clearCache"), t("settings.clearCacheConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        onPress: () =>
          Alert.alert(t("common.success"), t("settings.cacheCleared")),
      },
    ]);
  };

  // Helper render section (có style động theo theme)
  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: colors.TEXT_SECONDARY }]}>
      {title}
    </Text>
  );

  // Helper render item (có style động theo theme)
  const renderItem = (
    icon: string,
    label: string,
    rightElement: React.ReactNode,
    onPress?: () => void,
    iconColor: string = colors.PRIMARY,
  ) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconColor + "15" }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.TEXT_PRIMARY }]}>
          {label}
        </Text>
      </View>
      <View style={styles.itemRight}>{rightElement}</View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* --- Giao diện & Ngôn ngữ --- */}
        {renderSectionHeader(t("settings.general"))}

        {renderItem(
          "language-outline",
          t("settings.language"),
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.valueText, { color: colors.TEXT_SECONDARY }]}>
              {locale === "vi" ? "Tiếng Việt" : "English"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.TEXT_SECONDARY}
            />
          </View>,
          () => {
            Alert.alert(t("settings.language"), "", [
              {
                text: "Tiếng Việt",
                onPress: () => dispatch(setLanguage("vi")),
              },
              { text: "English", onPress: () => dispatch(setLanguage("en")) },
            ]);
          },
          "#4CAF50",
        )}

        {renderItem(
          isDark ? "moon" : "sunny",
          t("settings.theme"),
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.valueText, { color: colors.TEXT_SECONDARY }]}>
              {isDark ? t("settings.themeDark") : t("settings.themeLight")}
            </Text>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: "#E5E7EB", true: colors.PRIMARY }}
              thumbColor="#FFFFFF"
            />
          </View>,
          undefined,
          "#FF9800",
        )}

        {/* --- Bảo mật --- */}
        {renderSectionHeader(t("settings.security"))}

        {renderItem(
          "finger-print-outline",
          t("settings.biometrics"),
          <Switch
            value={biometricsEnabled}
            onValueChange={handleBiometricsToggle} // Sử dụng hàm xử lý thực tế
            trackColor={{ false: "#E5E7EB", true: colors.PRIMARY }}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#9C27B0",
        )}

        {renderItem(
          "notifications-outline",
          t("settings.notifications"),
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: "#E5E7EB", true: colors.PRIMARY }}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#F44336",
        )}

        {renderItem(
          "trash-bin-outline",
          t("settings.clearCache"),
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.TEXT_SECONDARY}
          />,
          handleClearCache,
          "#607D8B",
        )}

        {/* --- Thông tin --- */}
        {renderSectionHeader(t("settings.info"))}

        {renderItem(
          "information-circle-outline",
          t("settings.version"),
          <Text style={[styles.valueText, { color: colors.TEXT_SECONDARY }]}>
            1.0.0
          </Text>,
          undefined,
          colors.INFO,
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("auth.logout")}</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.TEXT_SECONDARY }]}>
          Base App © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent", // Sẽ được ghi đè bởi inline style
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#FEE2E2", // Đỏ nhạt
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#DC2626", // Đỏ đậm
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
});

export default SettingsScreen;
