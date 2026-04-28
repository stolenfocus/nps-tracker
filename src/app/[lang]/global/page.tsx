import { getGlobalData, getLatestGlobalYear } from "@/lib/data";
import GlobalHeatmap from "@/components/GlobalHeatmap";
import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.global.title,
    description: dict.global.description,
  };
}

export default async function GlobalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const globalData = getGlobalData();
  const latestYear = getLatestGlobalYear();

  // Serialize year data for client component
  const yearsData: Record<string, {
    date: string;
    exchange_rate: number;
    kr_total_usd: number;
    us_total_usd: number;
    total_usd: number;
    kr_count: number;
    us_count: number;
    holdings: {
      name: string;
      name_kr?: string;
      ticker: string;
      country: "KR" | "US";
      value_usd: number;
      pct_of_total: number;
      sector: string;
    }[];
  }> = {};

  for (const [year, data] of Object.entries(globalData.years)) {
    yearsData[year] = {
      date: data.date,
      exchange_rate: data.exchange_rate,
      kr_total_usd: data.kr_total_usd,
      us_total_usd: data.us_total_usd,
      total_usd: data.total_usd,
      kr_count: data.kr_count,
      us_count: data.us_count,
      // Send top 100 per year (heatmap uses max 50 after filtering)
      holdings: data.holdings
        .sort((a, b) => b.value_usd - a.value_usd)
        .slice(0, 100)
        .map((h) => ({
          name: h.name,
          name_kr: h.name_kr,
          ticker: h.ticker,
          country: h.country,
          value_usd: h.value_usd,
          pct_of_total: h.pct_of_total,
          sector: h.sector,
        })),
    };
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {dict.global.title}
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl">
          {dict.global.description}
        </p>
      </div>

      <GlobalHeatmap years={yearsData} defaultYear={latestYear} lang={lang} />

      {/* Disclaimer */}
      <div className="mt-8 bg-navy-light border border-navy-lighter rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">{dict.global.dataCoverage}</strong>{" "}
        {dict.global.disclaimer}
      </div>
    </div>
  );
}
