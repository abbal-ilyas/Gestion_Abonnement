"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { NavBar } from "@/components/NavBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { readSettings, SETTINGS_EVENT } from "@/lib/settings";

export function Header({
  locale,
  navLabels,
}: {
  locale: Locale;
  navLabels: Record<string, string>;
}) {
  const [logoDataUrl, setLogoDataUrl] = useState("");

  useEffect(() => {
    const settings = readSettings(locale);
    setLogoDataUrl(settings.logoDataUrl);

    const onSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ logoDataUrl: string }>;
      if (typeof customEvent.detail?.logoDataUrl === "string") {
        setLogoDataUrl(customEvent.detail.logoDataUrl);
      }
    };

    const onStorage = () => {
      const current = readSettings(locale);
      setLogoDataUrl(current.logoDataUrl);
    };

    window.addEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [locale]);

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {logoDataUrl ? (
          <Image src={logoDataUrl} alt="App logo" width={40} height={40} unoptimized className="h-10 w-10 rounded-xl object-cover shadow-lg" />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg" />
        )}
        <div>
          <p className="text-lg font-semibold text-white">Gestion Abonnements</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NavBar locale={locale} labels={navLabels} />
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
