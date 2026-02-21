"use client";

import { useEffect, useState } from "react";
import { Locale, locales } from "@/i18n/config";
import { usePathname, useRouter } from "next/navigation";
import { AppMode, AppSettings, readSettings, saveSettings } from "@/lib/settings";

export function ConfigForm({ labels, locale }: { labels: Record<string, string>; locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState("sky");
  const [mode, setMode] = useState<AppMode>("dark");
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState<Locale>(locale);
  const [logoName, setLogoName] = useState<string>("");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [savedSnapshot, setSavedSnapshot] = useState<AppSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const saved = readSettings(locale);
    setTheme(saved.themeColor);
    setMode(saved.mode);
    setCurrency(saved.currency);
    setLanguage(saved.language);
    setLogoName(saved.logoName);
    setLogoDataUrl(saved.logoDataUrl);
    setSavedSnapshot(saved);
  }, [locale]);

  const pendingSettings: AppSettings = {
    themeColor: theme,
    mode,
    currency,
    language,
    logoName,
    logoDataUrl,
  };

  const hasChanges =
    !savedSnapshot ||
    savedSnapshot.themeColor !== pendingSettings.themeColor ||
    savedSnapshot.mode !== pendingSettings.mode ||
    savedSnapshot.currency !== pendingSettings.currency ||
    savedSnapshot.language !== pendingSettings.language ||
    savedSnapshot.logoName !== pendingSettings.logoName ||
    savedSnapshot.logoDataUrl !== pendingSettings.logoDataUrl;

  const handleSave = () => {
    saveSettings(pendingSettings);
    setSavedSnapshot(pendingSettings);
    setSavedMessage("Settings saved");
    setTimeout(() => setSavedMessage(""), 1800);

    if (pendingSettings.language !== locale) {
      const parts = pathname.split("/").filter(Boolean);
      parts[0] = pendingSettings.language;
      router.push(`/${parts.join("/")}`);
      router.refresh();
      return;
    }

    router.refresh();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoName("");
      setLogoDataUrl("");
      return;
    }

    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-300" />
        <p className="text-sm font-semibold text-white">Branding</p>
      </div>
      <div>
        <label className="text-xs text-slate-400">{labels.uploadLogo}</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="file"
            className="text-sm text-slate-200"
            accept="image/*"
            onChange={handleLogoChange}
            aria-label={labels.uploadLogo}
          />
          {logoName && <span className="text-xs text-slate-300">{logoName}</span>}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">{labels.theme}</label>
          <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="sky">Sky</option>
            <option value="violet">Violet</option>
            <option value="emerald">Emerald</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.language}</label>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as Locale)}>
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">{labels.currency}</label>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="MAD">MAD (د.م.)</option>
            <option value="AED">AED (د.إ)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.mode}</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as AppMode)}>
            <option value="dark">{labels.dark}</option>
            <option value="light">{labels.light}</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-primary" type="button" onClick={handleSave} disabled={!hasChanges}>
          {labels.save}
        </button>
        {savedMessage && <span className="text-xs text-slate-300">{savedMessage}</span>}
      </div>
      <p className="text-xs text-slate-400">Settings are scaffolded; wire to backend when ready.</p>
    </div>
  );
}
