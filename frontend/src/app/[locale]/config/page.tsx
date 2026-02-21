import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ConfigForm } from "@/components/ConfigForm";

export default async function ConfigPage({ params }: { params: { locale: Locale } }) {
  const dict = await getDictionary(params.locale);

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-4">
        <p className="text-sm font-semibold text-white">{dict.nav.config}</p>
        <p className="text-slate-300">Theme, logo, and language scaffolding.</p>
      </div>
      <ConfigForm labels={dict.forms} locale={params.locale} />
    </div>
  );
}
