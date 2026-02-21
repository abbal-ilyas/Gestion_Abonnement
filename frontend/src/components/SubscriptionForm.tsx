"use client";

import { useState } from "react";
import { SubscriptionStatus, Subscriber } from "@/lib/types";

type SubscriptionFormPayload = {
  startDate: string;
  endDate: string;
  amount: number;
  status: SubscriptionStatus;
  subscriberId: number;
};

export function SubscriptionForm({
  subscribers,
  labels,
  onSubmit,
}: {
  subscribers: Subscriber[];
  labels: Record<string, string>;
  onSubmit: (payload: SubscriptionFormPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    amount: "",
    status: "ACTIVE" as SubscriptionStatus,
    subscriberId: subscribers[0]?.id ?? 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      amount: Number(form.amount),
      subscriberId: Number(form.subscriberId),
    });
    setForm((prev) => ({ ...prev, amount: "", startDate: "", endDate: "" }));
  };

  const disabled = subscribers.length === 0;

  return (
    <form onSubmit={submit} className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-sky-400" />
        <p className="text-sm font-semibold text-white">{labels.subscription}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">{labels.start}</label>
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.end}</label>
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs text-slate-400">{labels.amount}</label>
          <input className="input" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="49.90" required />
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.status}</label>
          <select className="input" name="status" value={form.status} onChange={handleChange}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RENEWAL_REQUIRED">RENEWAL_REQUIRED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.subscriberSelect}</label>
          <select className="input" name="subscriberId" value={form.subscriberId} onChange={handleChange}>
            {subscribers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="btn-primary disabled:opacity-50" type="submit" disabled={disabled}>
        {disabled ? "No subscribers" : labels.save}
      </button>
    </form>
  );
}
