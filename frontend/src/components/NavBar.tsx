"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";

const links = [
  { href: "", key: "home" },
  { href: "/subscriptions", key: "subscriptions" },
  { href: "/subscribers", key: "subscribers" },
  { href: "/history", key: "history" },
  { href: "/config", key: "config" },
];

export function NavBar({ locale, labels }: { locale: Locale; labels: Record<string, string> }) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-200">
      {links.map((link) => {
        const target = `/${locale}${link.href}`;
        const active = pathname === target;
        return (
          <Link
            key={link.key}
            href={target}
            className={`rounded-lg px-3 py-2 transition ${active ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
          >
            {labels[link.key] ?? link.key}
          </Link>
        );
      })}
    </nav>
  );
}
