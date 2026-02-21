"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSubscribers, fetchSubscriptions } from "@/lib/api";
import { StatsCards } from "@/components/StatsCards";
import { Locale } from "@/i18n/config";
import { formatCurrency, readSettings, SETTINGS_EVENT } from "@/lib/settings";
import { Subscription } from "@/lib/types";

type HomeLabels = {
  active: string;
  expiring: string;
  revenue: string;
  subscribers: string;
  searchPlaceholder: string;
  searchAction: string;
  searchResults: string;
  searchEmpty: string;
  code: string;
  status: string;
};

export function HomeStats({ labels, locale }: { labels: HomeLabels; locale: Locale }) {
  const [activeCount, setActiveCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Subscription[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    const saved = readSettings(locale);
    setCurrency(saved.currency);

    const refresh = async () => {
      const [subscriptions, subscribers] = await Promise.all([
        fetchSubscriptions(),
        fetchSubscribers(),
      ]);

      const active = subscriptions.filter((subscription) => subscription.status === "ACTIVE").length;
      const expiring = subscriptions.filter((subscription) => subscription.status === "RENEWAL_REQUIRED").length;
      const recurringRevenue = subscriptions
        .filter((subscription) => subscription.status !== "EXPIRED")
        .reduce((sum, subscription) => sum + Number(subscription.amount || 0), 0);

      setActiveCount(active);
      setExpiringCount(expiring);
      setSubscribersCount(subscribers.length);
      setMrr(recurringRevenue);
    };

    refresh();

    const onSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      if (customEvent.detail?.currency) {
        setCurrency(customEvent.detail.currency);
      }
    };

    const onStorage = () => {
      const current = readSettings(locale);
      setCurrency(current.currency);
    };

    window.addEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [locale]);

  const formattedRevenue = useMemo(() => {
    return formatCurrency(mrr, currency, locale);
  }, [currency, locale, mrr]);

  const handleSearch = async () => {
    const query = search.trim();
    if (!query) {
      setSearchDone(false);
      setSearchResults([]);
      return;
    }
    const results = await fetchSubscriptions({ search: query });
    setSearchResults(results);
    setSearchDone(true);
  };

  return (
    <div className="space-y-4">
      <StatsCards
        cards={[
          { label: labels.active, value: String(activeCount) },
          { label: labels.expiring, value: String(expiringCount) },
          { label: labels.revenue, value: formattedRevenue },
          { label: labels.subscribers, value: String(subscribersCount) },
        ]}
      />

      <div className="glass-panel rounded-2xl border border-sky-400/20 p-4 space-y-3">
        <p className="text-sm font-semibold text-white">{labels.searchResults}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn-primary" type="button" onClick={handleSearch}>
            {labels.searchAction}
          </button>
        </div>

        {searchDone && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-400">{labels.searchEmpty}</p>
            ) : (
              searchResults.map((subscription) => (
                <div key={subscription.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-semibold">
                      {subscription.subscriber?.firstName} {subscription.subscriber?.lastName}
                    </p>
                    <span className="text-xs text-slate-300">{labels.code}: {subscription.subscriber?.code || "-"}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-slate-300">{labels.status}: {subscription.status}</span>
                    <span className="text-sm text-slate-300">{formatCurrency(Number(subscription.amount || 0), currency, locale)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
