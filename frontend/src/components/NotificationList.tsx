import { Notification } from "@/lib/types";

export function NotificationList({ items, title, empty }: { items: Notification[]; title: string; empty: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-slate-400 text-sm">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.subscriptionId} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">{n.subscriberName}</p>
                <span className="text-xs text-slate-300">{new Date(n.endDate).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-300">Subscription #{n.subscriptionId}</p>
              <p className="text-xs text-slate-400">Days until end: {n.daysUntilEnd}</p>
              <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">{n.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
