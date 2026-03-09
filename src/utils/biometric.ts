import * as LocalAuthentication from "expo-local-authentication";

export class BiometricService {
  /**
   * Kiểm tra xem thiết bị có hỗ trợ sinh trắc học không
   */
  static async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  /**
   * Xác thực sinh trắc học
   * @param promptMessage Thông điệp hiển thị khi xác thực
   * @returns true nếu xác thực thành công
   */
  static async authenticate(
    promptMessage: string = "Xác thực để tiếp tục",
  ): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: "Sử dụng mật khẩu",
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  }

  /**
   * Lấy loại sinh trắc học được hỗ trợ
   * @returns Mảng các loại sinh trắc học (FINGERPRINT, FACIAL_RECOGNITION, IRIS)
   */
  static async getSupportedTypes(): Promise<
    LocalAuthentication.AuthenticationType[]
  > {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  }

  /**
   * Lấy tên hiển thị của loại sinh trắc học
   */
  static async getBiometricTypeName(): Promise<string> {
    const types = await this.getSupportedTypes();
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    return "Sinh trắc học";
  }
}
