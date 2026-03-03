type AppEnv = "development" | "staging" | "production";

const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_URL_DEV ||
  "http://10.0.2.2:3000/api";

const ENV = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_DEV || DEFAULT_API_URL,
    logLevel: "debug",
    storageKeys: {
      token: process.env.EXPO_PUBLIC_STORAGE_TOKEN_KEY || "base_token",
      user: process.env.EXPO_PUBLIC_STORAGE_USER_KEY || "base_user",
    },
  },
  staging: {
    apiUrl: "https://staging-api.baseproject.dev",
    logLevel: "info",
    storageKeys: {
      token: process.env.EXPO_PUBLIC_STORAGE_TOKEN_KEY || "base_token",
      user: process.env.EXPO_PUBLIC_STORAGE_USER_KEY || "base_user",
    },
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
    logLevel: "warn",
    storageKeys: {
      token: process.env.EXPO_PUBLIC_STORAGE_TOKEN_KEY || "base_token",
      user: process.env.EXPO_PUBLIC_STORAGE_USER_KEY || "base_user",
    },
  },
};

const currentEnv = (process.env.EXPO_PUBLIC_ENV || "development") as AppEnv;

const config = ENV[currentEnv];

if (!config?.apiUrl) {
  console.error("❌ API URL is undefined. Check ENV config");
}

export default config;
