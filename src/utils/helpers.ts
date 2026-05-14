/**
 * General utility helpers
 * Lưu ý: Các hàm liên quan đến bản đồ/định vị đã được xóa vì app không dùng tính năng này.
 */

import { Platform } from "react-native";

/**
 * Trả về giá trị mặc định nếu value là null/undefined
 */
export const defaultTo = <T>(value: T | null | undefined, fallback: T): T =>
  value ?? fallback;

/**
 * Rút gọn chuỗi nếu quá dài
 */
export const truncate = (str: string, maxLength: number = 50): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
};

/**
 * Định dạng số thành chuỗi có dấu phẩy ngăn cách hàng nghìn
 */
export const formatNumber = (num: number): string =>
  num.toLocaleString("vi-VN");

/**
 * Trả về platform hiện tại là "ios" hay "android"
 */
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

/**
 * Delay (dùng trong async/await)
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Kiểm tra chuỗi có rỗng không (bao gồm cả whitespace)
 */
export const isEmpty = (str?: string | null): boolean =>
  !str || str.trim().length === 0;
