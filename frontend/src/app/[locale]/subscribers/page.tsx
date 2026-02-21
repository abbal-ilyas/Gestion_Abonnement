"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary, getDictionary } from "@/i18n/dictionaries";
import { createSubscriber, deleteSubscriber, fetchSubscribers, fetchSubscriptions, updateSubscriber } from "@/lib/api";
import { Subscriber, Subscription } from "@/lib/types";
import { SubscriberForm } from "@/components/SubscriberForm";
import { FilterBar } from "@/components/FilterBar";

export default function SubscribersPage({ params }: { params: { locale: Locale } }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    getDictionary(params.locale).then(setDict);
    refresh();
  }, [params.locale]);

  const refresh = async (filters?: { search?: string; date?: string }) => {
    try {
      setError("");
      const subs = await fetchSubscribers(filters?.search);
      const subscr = await fetchSubscriptions();
      setSubscribers(subs);
      setSubscriptions(subscr);
    } catch {
      setError("Erreur API: impossible de charger les abonnés.");
    }
  };

  const handleCreate = async (payload: Partial<Subscriber>) => {
    try {
      setError("");
      await createSubscriber(payload);
      await refresh();
    } catch {
      setError("Erreur API: création abonné échouée.");
    }
  };

  const startEdit = (subscriber: Subscriber) => {
    setEditingId(subscriber.id);
    setEditForm({
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      email: subscriber.email,
      phone: subscriber.phone || "",
    });
  };

  const saveEdit = async (id: number) => {
    try {
      setError("");
      await updateSubscriber(id, editForm);
      setEditingId(null);
      await refresh();
    } catch {
      setError("Erreur API: mise à jour abonné échouée.");
    }
  };

  const removeSubscriber = async (id: number) => {
    try {
      setError("");
      await deleteSubscriber(id);
      if (editingId === id) {
        setEditingId(null);
      }
      await refresh();
    } catch {
      setError("Erreur API: suppression abonné échouée.");
    }
  };

  if (!dict) return null;

  return (
    <div className="space-y-4">
      <FilterBar labels={dict.filters} onFilter={refresh} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <SubscriberForm labels={dict.forms} onSubmit={handleCreate} />
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{dict.nav.subscribers}</p>
            <span className="text-xs text-slate-400">{subscribers.length} items</span>
          </div>
          <div className="space-y-3 max-h-[540px] overflow-auto pr-2">
            {subscribers.map((s) => {
              const linked = subscriptions.filter((sub) => sub.subscriber?.id === s.id);
              const isEditing = editingId === s.id;
              return (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className="input"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        />
                        <input
                          className="input"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className="input"
                          value={editForm.email}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                        <input
                          className="input"
                          value={editForm.phone}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-primary" type="button" onClick={() => saveEdit(s.id)}>
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
                        <p className="text-white font-semibold">{s.firstName} {s.lastName}</p>
                        <span className="text-xs text-slate-300">{s.email}</span>
                      </div>
                      <p className="text-xs text-slate-300">{dict.forms.code}: {s.code || "-"}</p>
                      <p className="text-xs text-slate-400">{s.phone}</p>
                      <p className="text-xs text-slate-300">{linked.length} subscriptions</p>
                      <button className="btn-secondary mt-2" type="button" onClick={() => startEdit(s)}>
                        Update
                      </button>
                      <button className="btn-secondary mt-2 ml-2" type="button" onClick={() => removeSubscriber(s.id)}>
                        {dict.forms.delete}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
