import type { Metadata } from "next";
import { ReactNode } from "react";
import { Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { ThemeBoot } from "@/components/ThemeBoot";

export const metadata: Metadata = {
  title: "Subscriptions dashboard",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ params, children }: { params: { locale: Locale }; children: ReactNode }) {
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen">
      <ThemeBoot />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Header locale={params.locale} navLabels={dict.nav} />
        {children}
      </main>
    </div>
  );
}
