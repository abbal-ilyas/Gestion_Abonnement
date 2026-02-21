"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary, getDictionary } from "@/i18n/dictionaries";
import { createSubscription, deleteSubscription, fetchSubscribers, fetchSubscriptions, updateSubscription } from "@/lib/api";
import { Subscription, Subscriber, SubscriptionStatus, SubscriptionUpsertPayload } from "@/lib/types";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { FilterBar } from "@/components/FilterBar";
import { formatCurrency, readSettings, SETTINGS_EVENT } from "@/lib/settings";

export default function SubscriptionsPage({ params }: { params: { locale: Locale } }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    startDate: "",
    endDate: "",
    amount: "",
    status: "ACTIVE" as SubscriptionStatus,
    subscriberId: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    getDictionary(params.locale).then(setDict);
    refresh();

    const saved = readSettings(params.locale);
    setCurrency(saved.currency);

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

  const refresh = async (filters?: { search?: string; date?: string }) => {
    try {
      setError("");
      const [subs, subscr] = await Promise.all([
        fetchSubscriptions(
          filters?.date
            ? { startDate: filters.date, endDate: filters.date, search: filters.search }
            : { search: filters?.search }
        ),
        fetchSubscribers(filters?.search),
      ]);
      setSubscriptions(subs);
      setSubscribers(subscr);
    } catch {
      setError("Erreur API: impossible de charger les abonnements.");
    }
  };

  const handleCreate = async (payload: SubscriptionUpsertPayload) => {
    try {
      setError("");
      await createSubscription(payload);
      await refresh();
    } catch {
      setError("Erreur API: création abonnement échouée.");
    }
  };

  const toDateInput = (value: string) => new Date(value).toISOString().slice(0, 10);

  const startEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setEditForm({
      startDate: toDateInput(subscription.startDate),
      endDate: toDateInput(subscription.endDate),
      amount: String(subscription.amount ?? ""),
      status: subscription.status,
      subscriberId: subscription.subscriber?.id || 0,
    });
  };

  const saveEdit = async (id: number) => {
    try {
      setError("");
      await updateSubscription(id, {
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        amount: Number(editForm.amount),
        status: editForm.status,
        subscriberId: Number(editForm.subscriberId),
      });
      setEditingId(null);
      await refresh();
    } catch {
      setError("Erreur API: mise à jour abonnement échouée.");
    }
  };

  const removeSubscription = async (id: number) => {
    try {
      setError("");
      await deleteSubscription(id);
      if (editingId === id) {
        setEditingId(null);
      }
      await refresh();
    } catch {
      setError("Erreur API: suppression abonnement échouée.");
    }
  };

  if (!dict) return null;

  return (
    <div className="space-y-4">
      <FilterBar labels={dict.filters} onFilter={refresh} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <SubscriptionForm subscribers={subscribers} labels={dict.forms} onSubmit={handleCreate} />
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{dict.nav.subscriptions}</p>
            <span className="text-xs text-slate-400">{subscriptions.length} items</span>
          </div>
          <div className="space-y-3 max-h-[540px] overflow-auto pr-2">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                {editingId === sub.id ? (
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className="input"
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                      <input
                        className="input"
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        className="input"
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                      <select
                        className="input"
                        value={editForm.status}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as SubscriptionStatus }))}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="RENEWAL_REQUIRED">RENEWAL_REQUIRED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                      <select
                        className="input"
                        value={editForm.subscriberId}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, subscriberId: Number(e.target.value) }))}
                      >
                        {subscribers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary" type="button" onClick={() => saveEdit(sub.id)}>
                        Save update
                      </button>
                      <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">{sub.subscriber?.firstName} {sub.subscriber?.lastName}</p>
                      <span className="text-xs text-slate-300">{new Date(sub.endDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{formatCurrency(Number(sub.amount || 0), currency, params.locale)}</p>
                    <div className="flex gap-2 text-xs text-slate-400">
                      <span>Start: {new Date(sub.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(sub.endDate).toLocaleDateString()}</span>
                    </div>
                    <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">{sub.status}</span>
                    <div>
                      <button className="btn-secondary mt-2" type="button" onClick={() => startEdit(sub)}>
                        Update
                      </button>
                      <button className="btn-secondary mt-2 ml-2" type="button" onClick={() => removeSubscription(sub.id)}>
                        {dict.forms.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
