"use client";

import { useState } from "react";

type SubscriberFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function SubscriberForm({ labels, onSubmit }: { labels: Record<string, string>; onSubmit: (payload: SubscriberFormPayload) => Promise<void> | void }) {
  const [form, setForm] = useState<SubscriberFormPayload>({ firstName: "", lastName: "", email: "", phone: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
  };

  return (
    <form onSubmit={submit} className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
        <p className="text-sm font-semibold text-white">{labels.subscriber}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">{labels.firstName}</label>
          <input className="input" name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.lastName}</label>
          <input className="input" name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">{labels.email}</label>
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-slate-400">{labels.phone}</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} />
        </div>
      </div>
      <button className="btn-primary" type="submit">{labels.save}</button>
    </form>
  );
}
