import Link from "next/link";
import { getFeedIndex } from "@/lib/feed-data";
import { getDictionary, type Locale } from "../dictionaries";

const typeBadge: Record<string, { label: string; color: string }> = {
  신규: { label: "NEW", color: "bg-blue-500/20 text-blue-400" },
  증가: { label: "UP", color: "bg-emerald-500/20 text-emerald-400" },
  감소: { label: "DOWN", color: "bg-red-500/20 text-red-400" },
};

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
        <div className="space-y-2">
          {index.dates.filter((entry) => entry.count > 0).map((entry) => (
            <Link
              key={entry.date}
              href={`/${lang}/feed/${entry.date}`}
              className="block bg-navy-light border border-navy-lighter rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold text-sm">
                    {entry.date}
                  </span>
                  <span className="ml-3 text-slate-400 text-xs">
                    {entry.count} {dict.feed.disclosures}
                  </span>
                </div>
                <div className="flex gap-2">
                  {Object.entries(entry.summary).map(([type, count]) => {
                    const badge = typeBadge[type] || {
                      label: type,
                      color: "bg-gray-500/20 text-gray-400",
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
              </div>
              {entry.highlights.length > 0 && (
                <div className="mt-1.5 text-xs text-slate-500">
                  {entry.highlights.join(", ")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
