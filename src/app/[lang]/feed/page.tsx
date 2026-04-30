import { getFeedIndex, getAllSearchItems, getHighlightsMap } from "@/lib/feed-data";
import FeedList from "@/components/FeedSearch";
import { getDictionary, type Locale } from "../dictionaries";

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
  const index = getFeedIndex();
  const searchItems = getAllSearchItems();
  const highlightsMap = getHighlightsMap(lang);

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
          placeholder={lang === "ko" ? "종목명 또는 종목코드 검색..." : "Search by stock name or code..."}
          disclosuresLabel={dict.feed.disclosures}
        />
      )}
    </main>
  );
}
