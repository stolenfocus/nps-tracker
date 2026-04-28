import { getFeedIndex, getFeedDay } from "@/lib/feed-data";
import { getDictionary, type Locale } from "../dictionaries";
import FeedList from "@/components/FeedSearch";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.feed.title,
    description: dict.feed.subtitle,
  };
}

export default async function FeedIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isKo = lang === "ko";
  const index = getFeedIndex();

  // Build highlights + search data from feed files
  const highlightsMap: Record<string, string[]> = {};
  const searchItems: { date: string; stock_name: string; name_eng: string; stock_code: string; change_type: string; stake_pct: string; stake_change: string }[] = [];

  for (const entry of index.dates) {
    if (entry.count === 0) continue;
    const feed = getFeedDay(entry.date);
    if (!feed || !feed.disclosures.length) continue;

    highlightsMap[entry.date] = feed.disclosures
      .slice(0, 3)
      .map((d) => (isKo || !d.name_eng) ? d.stock_name : d.name_eng.split(" CO")[0].split(" Co")[0]);

    for (const d of feed.disclosures) {
      searchItems.push({
        date: entry.date,
        stock_name: d.stock_name,
        name_eng: d.name_eng || "",
        stock_code: d.stock_code,
        change_type: d.change_type,
        stake_pct: String(d.stake_pct),
        stake_change: String(d.stake_change ?? ""),
      });
    }
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {dict.feed.title}
        </h1>
        <p className="text-xs text-slate-400">
          {dict.feed.subtitle}
        </p>
      </div>

      {index.dates.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          {dict.feed.noData}
        </div>
      ) : (
        <FeedList
          entries={index.dates}
          searchItems={searchItems}
          highlightsMap={highlightsMap}
          lang={lang}
          placeholder={isKo ? "종목명, 영문명, 종목코드 검색..." : "Search by name, English name, or stock code..."}
          disclosuresLabel={dict.feed.disclosures}
        />
      )}
    </main>
  );
}
