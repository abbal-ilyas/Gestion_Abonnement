"use client";

import { useState } from "react";

export function FilterBar({ labels, onFilter }: { labels: Record<string, string>; onFilter: (params: { search?: string; date?: string }) => void | Promise<void> }) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label className="text-xs text-slate-400">{labels.search}</label>
        <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Alice, plan, email..." />
      </div>
      <div>
        <label className="text-xs text-slate-400">{labels.date}</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={() => onFilter({ search, date })} type="button">
          {labels.search}
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => {
            setSearch("");
            setDate("");
            onFilter({});
          }}
        >
          {labels.reset}
        </button>
      </div>
    </div>
  );
}
