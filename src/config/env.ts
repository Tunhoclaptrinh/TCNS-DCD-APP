type AppEnv = "development" | "staging" | "production";

const ENV = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_DEV!,
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
    apiUrl: process.env.EXPO_PUBLIC_API_URL!,
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
