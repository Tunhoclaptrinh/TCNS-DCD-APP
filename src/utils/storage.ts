import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config/env";

export class StorageService {
  private static readonly TOKEN_KEY = config.storageKeys.token;
  private static readonly USER_KEY = config.storageKeys.user;
  private static readonly BIOMETRIC_CREDENTIALS_KEY = "biometric_credentials";
  private static readonly BIOMETRIC_ENABLED_KEY = "biometric_enabled";

  static async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.TOKEN_KEY, token);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  static async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  static async clear(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  // Biometric Authentication Methods
  static async setBiometricCredentials(
    email: string,
    password: string,
  ): Promise<void> {
    const credentials = { email, password };
    await AsyncStorage.setItem(
      this.BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials),
    );
  }

  static async getBiometricCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    const credentials = await AsyncStorage.getItem(
      this.BIOMETRIC_CREDENTIALS_KEY,
    );
    return credentials ? JSON.parse(credentials) : null;
  }

  static async removeBiometricCredentials(): Promise<void> {
    await AsyncStorage.removeItem(this.BIOMETRIC_CREDENTIALS_KEY);
  }

  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(
      this.BIOMETRIC_ENABLED_KEY,
      JSON.stringify(enabled),
    );
  }

  static async getBiometricEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
    return enabled ? JSON.parse(enabled) : false;
  }
}
