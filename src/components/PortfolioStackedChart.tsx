"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CompanyMeta {
  code: string;
  stock_name: string;
  name_eng: string;
  latest_stake_pct: number;
}

interface Month {
  date: string;
  total_value_krw: number;
  weights: Record<string, number>;
}

interface Props {
  companies: CompanyMeta[];
  months: Month[];
  lang: string;
}

// 30 distinct colors (tailwind palette, high contrast)
const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#eab308", "#a855f7", "#22c55e", "#0ea5e9",
  "#d946ef", "#f43f5e", "#64748b", "#78716c", "#71717a",
  "#ca8a04", "#b45309", "#9f1239", "#6d28d9", "#047857",
  "#0e7490", "#7c2d12", "#365314", "#1e3a8a", "#831843",
];

function fmtKrw(n: number, ko: boolean): string {
  if (n >= 1e12) return ko ? `${(n / 1e12).toFixed(1)}조` : `₩${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e8) return ko ? `${(n / 1e8).toFixed(0)}억` : `₩${(n / 1e8).toFixed(0)}B`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}만`;
  return n.toLocaleString();
}

export default function PortfolioStackedChart({ companies, months, lang }: Props) {
  const ko = lang === "ko";
  const [hiddenSet, setHiddenSet] = useState<Set<string>>(new Set());

  // Transform to wide format for recharts
  const chartData = useMemo(() => {
    return months.map((m) => {
      const row: Record<string, number | string> = { date: m.date };
      for (const c of companies) {
        row[c.code] = hiddenSet.has(c.code) ? 0 : m.weights[c.code] || 0;
      }
      row["_total_krw"] = m.total_value_krw;
      return row;
    });
  }, [months, companies, hiddenSet]);

  const colorByCode = useMemo(() => {
    const map: Record<string, string> = {};
    companies.forEach((c, i) => {
      map[c.code] = COLORS[i % COLORS.length];
    });
    return map;
  }, [companies]);

  const toggle = (code: string) => {
    const next = new Set(hiddenSet);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setHiddenSet(next);
  };

  return (
    <div className="w-full">
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} interval="preserveStartEnd" minTickGap={40} />
            <YAxis
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              stroke="#64748b"
              fontSize={11}
              width={50}
              domain={[0, 100]}
            />
            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload || !props.payload.length) return null;
                const date = props.label as string;
                const row = props.payload[0].payload as Record<string, number | string>;
                const total = row["_total_krw"] as number;
                const entries = companies
                  .filter((c) => !hiddenSet.has(c.code))
                  .map((c) => ({ code: c.code, name: c.stock_name, pct: (row[c.code] as number) || 0 }))
                  .filter((e) => e.pct > 0)
                  .sort((a, b) => b.pct - a.pct)
                  .slice(0, 10);
                return (
                  <div className="bg-navy border border-navy-lighter rounded px-3 py-2 text-[11px] shadow-lg max-w-xs">
                    <div className="text-slate-300 font-medium mb-1">{date}</div>
                    <div className="text-slate-500 mb-2">
                      {ko ? "추적 총액" : "Tracked total"}: {fmtKrw(total, ko)}
                    </div>
                    <div className="space-y-0.5">
                      {entries.map((e) => (
                        <div key={e.code} className="flex justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-300 truncate">
                            <span
                              className="inline-block w-2 h-2 rounded-sm shrink-0"
                              style={{ backgroundColor: colorByCode[e.code] }}
                            />
                            {e.name}
                          </span>
                          <span className="text-white font-mono">{e.pct.toFixed(1)}%</span>
                        </div>
                      ))}
                      {entries.length === 10 && (
                        <div className="text-slate-600 text-right">
                          {ko ? "외 더 있음…" : "more…"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            {companies.map((c) => (
              <Area
                key={c.code}
                type="monotone"
                dataKey={c.code}
                stackId="1"
                stroke={colorByCode[c.code]}
                fill={colorByCode[c.code]}
                fillOpacity={0.75}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with toggle */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-1 text-[11px]">
        {companies.map((c) => {
          const hidden = hiddenSet.has(c.code);
          return (
            <button
              key={c.code}
              onClick={() => toggle(c.code)}
              className={`flex items-center gap-1.5 text-left hover:bg-navy-lighter/40 rounded px-1 py-0.5 ${
                hidden ? "opacity-40" : ""
              }`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: colorByCode[c.code] }}
              />
              <span className="text-slate-300 truncate">
                {ko ? c.stock_name : c.name_eng || c.stock_name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-slate-600">
        {ko
          ? "범례 클릭 시 해당 회사 숨김/표시. 호버하면 해당 월 상위 10개 노출."
          : "Click a legend to toggle. Hover shows the top 10 that month."}
      </div>
    </div>
  );
}
