"use client";

import { locales, Locale } from "@/i18n/config";
import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = value;
    router.push("/" + segments.join("/"));
  };

  return (
    <select
      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
      value={locale}
      onChange={(e) => handleChange(e.target.value as Locale)}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
