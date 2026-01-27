export const COLORS = {
  PRIMARY: "#8b1d1d",
  SECONDARY: "#4ECDC4",
  SUCCESS: "#2ECC71",
  ERROR: "#E74C3C",
  WARNING: "#F39C12",
  INFO: "#8b1d1d",
  LIGHT_GRAY: "#F5F5F5",
  GRAY: "#9CA3AF",
  DARK_GRAY: "#6B7280",
  DARK: "#1F2937",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  BORDER: "#E5E7EB",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: COLORS.WARNING, // Chờ xác nhận
  confirmed: "#4ECDC4", // Đã xác nhận
  preparing: "#FFB800", // Đang chuẩn bị
  shipping: "#3498DB", // Đang giao
  on_the_way: "#3498DB", // Đồng nghĩa shipping
  delivered: COLORS.SUCCESS, // Đã giao
  cancelled: COLORS.ERROR, // Đã hủy
};
