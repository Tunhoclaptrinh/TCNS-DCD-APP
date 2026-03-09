// src/utils/i18n.ts
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import viTranslations from "@/src/i18n/locales/vi.json";
import enTranslations from "@/src/i18n/locales/en.json";

const translations = {
  vi: viTranslations,
  en: enTranslations,
};

type TranslationKeys = typeof viTranslations;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationKeys>;

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
}

// Hook để lấy text với hỗ trợ nested keys và interpolation
export const useTranslation = () => {
  const language = useSelector((state: RootState) => state.settings.language);

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = getNestedValue(translations[language], key);

    // Handle string interpolation {variable}
    if (params && typeof text === "string") {
      Object.keys(params).forEach((param) => {
        text = text.replace(
          new RegExp(`\\{${param}\\}`, "g"),
          String(params[param]),
        );
      });
    }

    return text || key;
  };

  return {
    t,
    locale: language,
  };
};
