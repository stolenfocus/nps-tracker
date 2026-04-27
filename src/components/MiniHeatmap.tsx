"use client";

import { useMemo } from "react";
import Link from "next/link";
import { treemap, hierarchy, treemapSquarify } from "d3-hierarchy";

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

  const nodes = useMemo(() => {
    const root = hierarchy({
      children: top.map((h) => ({ ...h, value: h.value_usd })),
    }).sum((d: any) => d.value || 0);

    const layout = treemap<any>()
      .size([100, 55])
      .padding(0.5)
      .tile(treemapSquarify.ratio(1.2));

    layout(root);
    return root.leaves();
  }, [top]);

  return (
    <div className="relative w-full" style={{ paddingBottom: "55%" }}>
      <div className="absolute inset-0">
        {nodes.map((node: any) => {
          const d = node.data;
          const x = node.x0;
          const y = node.y0;
          const w = node.x1 - node.x0;
          const h = node.y1 - node.y0;
          const isKR = d.country === "KR";
          const bg = isKR ? "rgba(220, 38, 38, 0.6)" : "rgba(37, 99, 235, 0.6)";
          const showTicker = w > 8 && h > 6;
          const showPct = w > 12 && h > 10;

          return (
            <Link
              key={d.ticker}
              href={`/${lang}/company/${isKR ? d.ticker : d.ticker}`}
              className="absolute overflow-hidden hover:brightness-125 transition-all cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${w}%`,
                height: `${h}%`,
                backgroundColor: bg,
                borderRadius: "2px",
              }}
              title={`${d.ticker} ${isKo ? d.name_kr || d.name : d.name} (${d.pct_of_total.toFixed(1)}%)`}
            >
              <div className="p-0.5 flex flex-col items-center justify-center h-full">
                {showTicker && (
                  <span className="text-white font-bold text-[8px] leading-tight truncate">
                    {d.ticker}
                  </span>
                )}
                {showPct && (
                  <span className="text-white/70 text-[7px] leading-tight">
                    {d.pct_of_total.toFixed(1)}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
