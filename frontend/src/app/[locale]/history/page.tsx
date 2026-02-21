"use client";

import { useEffect, useMemo, useState } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary, getDictionary } from "@/i18n/dictionaries";
import { fetchSubscriptionHistory, purgeSubscriber, purgeSubscription } from "@/lib/api";
import { Subscription, SubscriptionStatus } from "@/lib/types";
import { formatCurrency, readSettings, SETTINGS_EVENT } from "@/lib/settings";

export default function HistoryPage({ params }: { params: { locale: Locale } }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [items, setItems] = useState<Subscription[]>([]);
  const [currency, setCurrency] = useState("EUR");

  const [search, setSearch] = useState("");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [exactDate, setExactDate] = useState<string>("");
  const [status, setStatus] = useState<"" | SubscriptionStatus>("");
  const [price, setPrice] = useState<string>("");
  const [deletedTarget, setDeletedTarget] = useState<string>("");
  const [adminPin, setAdminPin] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getDictionary(params.locale).then(setDict);

    const settings = readSettings(params.locale);
    setCurrency(settings.currency);

    const onSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>;
      if (customEvent.detail?.currency) {
        setCurrency(customEvent.detail.currency);
      }
    };

    window.addEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSettingsUpdated as EventListener);
    };
  }, [params.locale]);

  const refresh = async () => {
    setError("");
    const data = await fetchSubscriptionHistory({
      search: search || undefined,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      date: exactDate || undefined,
      status: status || undefined,
      amount: price ? Number(price) : undefined,
      deletedTarget: deletedTarget || undefined,
    });
    setItems(data);
  };

  useEffect(() => {
    fetchSubscriptionHistory()
      .then(setItems)
      .catch(() => setError("Erreur API: impossible de charger l'historique."));
  }, [params.locale]);

  const handlePurgeSubscription = async (subscriptionId: number) => {
    if (busy) return;
    if (!adminPin.trim()) {
      setError(dict?.forms.adminPin ? `${dict.forms.adminPin} requis` : "Admin PIN requis");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await purgeSubscription(subscriptionId, adminPin.trim());
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("403")) {
        setError("PIN invalide ou accès refusé");
      } else if (message.includes("404")) {
        setError("Abonnement introuvable");
      } else {
        setError("Suppression définitive échouée");
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePurgeSubscriber = async (subscriberId?: number) => {
    if (busy) return;
    if (!subscriberId) {
      setError("Abonné introuvable pour cet historique");
      return;
    }
    if (!adminPin.trim()) {
      setError(dict?.forms.adminPin ? `${dict.forms.adminPin} requis` : "Admin PIN requis");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await purgeSubscriber(subscriberId, adminPin.trim());
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("403")) {
        setError("PIN invalide ou accès refusé");
      } else if (message.includes("404")) {
        setError("Abonné introuvable");
      } else {
        setError("Suppression définitive échouée");
      }
    } finally {
      setBusy(false);
    }
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  if (!dict) return null;

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white">{dict.history.title}</p>
        <div className="grid gap-3 md:grid-cols-7">
          <input
            className="input"
            placeholder={dict.filters.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">{dict.forms.year}</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">{dict.forms.month}</option>
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={exactDate}
            onChange={(e) => setExactDate(e.target.value)}
            aria-label={dict.forms.exactDate}
          />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as "" | SubscriptionStatus)}>
            <option value="">{dict.forms.status}</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RENEWAL_REQUIRED">RENEWAL_REQUIRED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder={dict.forms.amount}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select className="input" value={deletedTarget} onChange={(e) => setDeletedTarget(e.target.value)}>
            <option value="">{dict.forms.activeOnly}</option>
            <option value="SUBSCRIBER">{dict.forms.deletedSubscribers}</option>
            <option value="SUBSCRIPTION">{dict.forms.deletedSubscriptions}</option>
            <option value="ANY">{dict.forms.deletedAny}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            className="input max-w-[180px]"
            type="password"
            placeholder={dict.forms.adminPin}
            value={adminPin}
            onChange={(e) => {
              setAdminPin(e.target.value);
              if (error) setError("");
            }}
          />
          <button className="btn-primary" type="button" onClick={refresh}>
            {dict.filters.search}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setSearch("");
              setYear("");
              setMonth("");
              setExactDate("");
              setStatus("");
              setPrice("");
              setDeletedTarget("");
              fetchSubscriptionHistory()
                .then(setItems)
                .catch(() => setError("Erreur API: impossible de charger l'historique."));
            }}
          >
            {dict.filters.reset}
          </button>
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>

      <div className="glass-panel rounded-2xl p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-400 text-sm">{dict.history.empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">
                  {item.subscriber?.firstName} {item.subscriber?.lastName}
                </p>
                <span className="text-xs text-slate-300">{new Date(item.startDate).toLocaleDateString(params.locale)}</span>
              </div>
              <p className="text-sm text-slate-300">{formatCurrency(Number(item.amount || 0), currency, params.locale)}</p>
              <p className="text-xs text-slate-400">
                {new Date(item.startDate).toLocaleDateString(params.locale)} → {new Date(item.endDate).toLocaleDateString(params.locale)}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">{item.status}</span>
              {(item.deleted || item.subscriber?.deleted) && (
                <span className="ml-2 mt-2 inline-flex rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-200">{dict.forms.deletedTarget}</span>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-secondary" type="button" onClick={() => handlePurgeSubscription(item.id)} disabled={busy || !adminPin.trim()}>
                  {dict.forms.purgeSubscription}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => handlePurgeSubscriber(item.subscriber?.id)}
                  disabled={busy || !adminPin.trim() || !item.subscriber?.id}
                >
                  {dict.forms.purgeSubscriber}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
