"use client";

import Link from "next/link";

interface Holding {
  ticker: string;
  name: string;
  name_kr?: string;
  country: "KR" | "US";
  value_usd: number;
  pct_of_total: number;
}

export default function MiniHeatmap({
  holdings,
  count,
  lang,
}: {
  holdings: Holding[];
  count: number;
  lang: string;
}) {
  const isKo = lang === "ko";
  const top = holdings.slice(0, count);
  const maxPct = Math.max(...top.map((h) => h.pct_of_total));

  return (
    <div className="space-y-0.5">
      {top.map((h) => {
        const width = Math.max(15, (h.pct_of_total / maxPct) * 100);
        const isKR = h.country === "KR";
        return (
          <Link
            key={h.ticker}
            href={`/${lang}/company/${isKR ? h.ticker : h.ticker}`}
            className="flex items-center gap-1 group"
          >
            <span className="text-[9px] text-slate-500 w-10 shrink-0 text-right font-mono">
              {h.ticker}
            </span>
            <div className="flex-1 h-4 relative">
              <div
                className="absolute inset-y-0 left-0 bg-accent/30 group-hover:bg-accent/50 rounded-sm transition-colors flex items-center px-1"
                style={{ width: `${width}%` }}
              >
                <span className="text-[8px] text-slate-400 truncate">
                  {isKo ? h.name_kr || h.name : h.name}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 w-10 shrink-0 text-right font-mono">
              {h.pct_of_total.toFixed(1)}%
            </span>
          </Link>
        );
      })}
    </div>
  );
}
