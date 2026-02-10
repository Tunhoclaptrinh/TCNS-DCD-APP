// src/utils/i18n.ts


const translations = {
  vi: {
    settings: "Cài đặt",
    general: "Cài đặt chung",
    language: "Ngôn ngữ",
    theme: "Giao diện",
    themeDark: "Tối",
    themeLight: "Sáng",
    security: "Bảo mật & Dữ liệu",
    biometrics: "Đăng nhập sinh trắc học",
    notifications: "Thông báo",
    clearCache: "Xóa bộ nhớ đệm",
    info: "Thông tin",
    version: "Phiên bản",
    logout: "Đăng xuất",
    cancel: "Hủy",
    confirm: "Xác nhận",
    success: "Thành công",
    error: "Lỗi",
    biometricsError: "Thiết bị không hỗ trợ sinh trắc học",
    cacheCleared: "Đã dọn dẹp bộ nhớ đệm",
    login: "Đăng nhập",
  },
  en: {
    settings: "Settings",
    general: "General",
    language: "Language",
    theme: "Appearance",
    themeDark: "Dark",
    themeLight: "Light",
    security: "Security & Data",
    biometrics: "Biometric Login",
    notifications: "Notifications",
    clearCache: "Clear Cache",
    info: "Information",
    version: "Version",
    logout: "Logout",
    cancel: "Cancel",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    biometricsError: "Biometrics not supported",
    cacheCleared: "Cache cleared successfully",
    login: "Login",
  },
};

// Hook để lấy text
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export const useTranslation = () => {
  const language = useSelector((state: RootState) => state.settings.language);

  return {
    t: (key: keyof (typeof translations)["vi"]) => translations[language][key] || key,
    locale: language,
  };
};
