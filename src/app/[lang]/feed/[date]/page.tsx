import Link from "next/link";
import { getFeedDay, getAllFeedDates } from "@/lib/feed-data";
import FeedTable from "@/components/FeedTable";
import { getDictionary, type Locale } from "../../dictionaries";

export function generateStaticParams() {
  return getAllFeedDates().map((date) => ({ date }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; date: string }>;
}) {
  const { lang, date } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: `${dict.feed.title} ${date}`,
    description: `${date} NPS domestic stock stake changes.`,
  };
}

const typeBadge: Record<string, { label: string; color: string; order: number }> = {
  신규: { label: "NEW", color: "bg-blue-500/20 text-blue-400", order: 0 },
  증가: { label: "UP", color: "bg-emerald-500/20 text-emerald-400", order: 1 },
  감소: { label: "DOWN", color: "bg-red-500/20 text-red-400", order: 2 },
  전량처분: { label: "EXIT", color: "bg-red-700/30 text-red-300", order: 3 },
  확인필요: { label: "?", color: "bg-yellow-500/20 text-yellow-400", order: 4 },
};

export default async function FeedDatePage({
  params,
}: {
  params: Promise<{ lang: string; date: string }>;
}) {
  const { lang, date } = await params;
  const dict = await getDictionary(lang as Locale);
  const feed = getFeedDay(date);

  if (!feed) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <p className="text-slate-400">{dict.feed.noData}</p>
        <Link href={`/${lang}/feed`} className="text-blue-400 text-sm mt-2 inline-block">
          &larr; {dict.feed.back}
        </Link>
      </main>
    );
  }

  if (feed.count === 0) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <Link href={`/${lang}/feed`} className="text-slate-500 text-xs hover:text-white">
          &larr; {dict.feed.back}
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">{feed.date}</h1>
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-8 text-center">
          <p className="text-slate-400">{dict.feed.noDisclosures}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <Link href={`/${lang}/feed`} className="text-slate-500 text-xs hover:text-white">
        &larr; {dict.feed.back}
      </Link>

      <div className="mt-4 mb-5 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-white">{feed.date}</h1>
        <span className="text-slate-400 text-sm">{feed.count} {dict.feed.disclosures}</span>
        {Object.entries(feed.summary)
          .sort(([a], [b]) => (typeBadge[a]?.order ?? 99) - (typeBadge[b]?.order ?? 99))
          .map(([type, count]) => {
          const badge = typeBadge[type] || {
            label: type,
            color: "bg-gray-500/20 text-gray-400",
            order: 99,
          };
          return (
            <span
              key={type}
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}
            >
              {badge.label} {count}
            </span>
          );
        })}
      </div>

      <FeedTable disclosures={feed.disclosures} lang={lang} />

      <div className="mt-6 text-[10px] text-slate-600">
        <span className="text-yellow-500">*</span> {dict.feed.footer} &middot;{" "}
        {dict.feed.dataSource} &middot;{" "}
        {feed.disclosures[0]?.fin_period &&
          `Financials as of ${feed.disclosures[0].fin_period} · `}
        Generated {feed.generated_at?.slice(0, 16)} KST
      </div>
    </main>
  );
}
