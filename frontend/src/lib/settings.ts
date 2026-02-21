import { Locale } from "@/i18n/config";

export type AppMode = "dark" | "light";

export type AppSettings = {
  themeColor: string;
  mode: AppMode;
  currency: string;
  language: Locale;
  logoName: string;
  logoDataUrl: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  themeColor: "sky",
  mode: "dark",
  currency: "EUR",
  language: "en",
  logoName: "",
  logoDataUrl: "",
};

export const SETTINGS_EVENT = "app-settings-updated";

export function readSettings(fallbackLocale: Locale): AppSettings {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS, language: fallbackLocale };
  }

  const themeColor = localStorage.getItem("app_theme_color") || DEFAULT_SETTINGS.themeColor;
  const mode = (localStorage.getItem("app_mode") as AppMode) || DEFAULT_SETTINGS.mode;
  const currency = localStorage.getItem("app_currency") || DEFAULT_SETTINGS.currency;
  const language = (localStorage.getItem("app_language") as Locale) || fallbackLocale;
  const logoName = localStorage.getItem("app_logo_name") || DEFAULT_SETTINGS.logoName;
  const logoDataUrl = localStorage.getItem("app_logo_data") || DEFAULT_SETTINGS.logoDataUrl;

  return {
    themeColor,
    mode,
    currency,
    language,
    logoName,
    logoDataUrl,
  };
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;

  localStorage.setItem("app_theme_color", settings.themeColor);
  localStorage.setItem("app_mode", settings.mode);
  localStorage.setItem("app_currency", settings.currency);
  localStorage.setItem("app_language", settings.language);
  localStorage.setItem("app_logo_name", settings.logoName);
  localStorage.setItem("app_logo_data", settings.logoDataUrl);

  document.documentElement.setAttribute("data-theme", settings.mode);
  window.dispatchEvent(new CustomEvent<AppSettings>(SETTINGS_EVENT, { detail: settings }));
}

export function formatCurrency(amount: number, currency: string, locale: Locale | string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
