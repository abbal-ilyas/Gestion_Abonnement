import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { HomeStats } from "@/components/HomeStats";

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const dict = await getDictionary(params.locale);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-xl font-semibold text-white">{dict.home.title}</p>
        <p className="text-slate-300">{dict.home.subtitle}</p>
      </div>
      <HomeStats
        labels={{
          ...dict.home.cards,
          searchPlaceholder: dict.home.search.placeholder,
          searchAction: dict.home.search.action,
          searchResults: dict.home.search.results,
          searchEmpty: dict.home.search.empty,
          code: dict.forms.code,
          status: dict.forms.status,
        }}
        locale={params.locale}
      />
    </div>
  );
}
