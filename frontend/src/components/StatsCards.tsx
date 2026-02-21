type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
};

export function StatsCards({ cards }: { cards: StatCardProps[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-panel rounded-2xl p-4">
          <p className="text-sm uppercase tracking-wide text-slate-300">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          {card.sub && <p className="text-sm text-slate-400">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
