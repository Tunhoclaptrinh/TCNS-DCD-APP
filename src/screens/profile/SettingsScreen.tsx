// src/screens/profile/SettingsScreen.tsx
import React from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { 
  setTheme, 
  setLanguage, 
  toggleNotifications, 
  toggleBiometrics 
} from "@/src/store/slices/settingsSlice";
import { logout } from "@/src/store/slices/authSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication"; // Import thư viện
import {useTheme} from "@/src/hooks/useTheme"; // Import theme hook
import {useTranslation} from "@/src/utils/i18n"; // Import i18n hook

const SettingsScreen = ({navigation}: any) => {
  const dispatch = useDispatch<any>();
  // Sử dụng hook Theme và Translation - giả định các hook này vẫn hoạt động hoặc sẽ được fix sau nếu lỗi
  // Nếu useTheme/useTranslation phụ thuộc vào store cũ, chúng cũng cần được refactor.
  // Tuy nhiên, ưu tiên fix lỗi build do import sai trước.
  const {colors, isDark} = useTheme(); 
  const {t, locale} = useTranslation();

  const { language, notificationsEnabled, biometricsEnabled } = useSelector((state: RootState) => state.settings);
  // Theme hiện tại đang được lấy từ useTheme hook, có thể bị conflict với store. 
  // Để an toàn, ta tạm thời tin tưởng useTheme điều khiển UI, và settings store lưu trạng thái.

  const handleLogout = () => {
      dispatch(logout());
  };

  // Xử lý bật/tắt Sinh trắc học thực tế
  const handleBiometricsToggle = async () => {
    // Nếu đang bật -> tắt ngay
    if (biometricsEnabled) {
      dispatch(toggleBiometrics());
      return;
    }

    // Nếu đang tắt -> bật lên (cần kiểm tra phần cứng)
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(t("error"), t("biometricsError"));
        return;
      }

      // Xác thực thử để kích hoạt
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để kích hoạt",
        fallbackLabel: "Sử dụng mật khẩu",
      });

      if (result.success) {
        dispatch(toggleBiometrics());
        Alert.alert(t("success"), "Đã kích hoạt đăng nhập sinh trắc học");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCache = () => {
    Alert.alert(t("clearCache"), "Bạn có chắc chắn không?", [
      {text: t("cancel"), style: "cancel"},
      {
        text: t("confirm"),
        onPress: () => Alert.alert(t("success"), t("cacheCleared")),
      },
    ]);
  };

  // Helper render section (có style động theo theme)
  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, {color: colors.TEXT_SECONDARY}]}>{title}</Text>
  );

  // Helper render item (có style động theo theme)
  const renderItem = (
    icon: string,
    label: string,
    rightElement: React.ReactNode,
    onPress?: () => void,
    iconColor: string = colors.PRIMARY
  ) => (
    <TouchableOpacity
      style={[styles.itemContainer, {backgroundColor: colors.CARD_BG, borderColor: colors.BORDER}]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, {backgroundColor: iconColor + "15"}]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.itemLabel, {color: colors.TEXT_PRIMARY}]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>{rightElement}</View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.BACKGROUND}]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* --- Giao diện & Ngôn ngữ --- */}
        {renderSectionHeader(t("general"))}

        {renderItem(
          "language-outline",
          t("language"),
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>
              {locale === "vi" ? "Tiếng Việt" : "English"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.TEXT_SECONDARY} />
          </View>,
          () => {
            Alert.alert(t("language"), "", [
              {text: "Tiếng Việt", onPress: () => dispatch(setLanguage("vi"))},
              {text: "English", onPress: () => dispatch(setLanguage("en"))},
            ]);
          },
          "#4CAF50"
        )}

        {renderItem(
          isDark ? "moon" : "sunny",
          t("theme"),
          <View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
            <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>
              {isDark ? t("themeDark") : t("themeLight")}
            </Text>
            <Switch
              value={isDark}
              onValueChange={(val) => dispatch(setTheme(val ? "dark" : "light"))}
              trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
              thumbColor="#FFFFFF"
            />
          </View>,
          undefined,
          "#FF9800"
        )}

        {/* --- Bảo mật --- */}
        {renderSectionHeader(t("security"))}

        {renderItem(
          "finger-print-outline",
          t("biometrics"),
          <Switch
            value={biometricsEnabled}
            onValueChange={handleBiometricsToggle} // Sử dụng hàm xử lý thực tế
            trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#9C27B0"
        )}

        {renderItem(
          "notifications-outline",
          t("notifications"),
          <Switch
            value={notificationsEnabled}
            onValueChange={() => dispatch(toggleNotifications())}
            trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#F44336"
        )}

        {renderItem(
          "trash-bin-outline",
          t("clearCache"),
          <Ionicons name="chevron-forward" size={20} color={colors.TEXT_SECONDARY} />,
          handleClearCache,
          "#607D8B"
        )}

        {/* --- Thông tin --- */}
        {renderSectionHeader(t("info"))}

        {renderItem(
          "information-circle-outline",
          t("version"),
          <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>1.0.0</Text>,
          undefined,
          colors.INFO
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, {color: colors.TEXT_SECONDARY}]}>SEN Mobile App © 2025</Text>
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
    shadowOffset: {width: 0, height: 1},
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
