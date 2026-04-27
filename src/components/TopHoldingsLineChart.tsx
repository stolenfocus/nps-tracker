"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Company {
  rank: number;
  name: string;
  name_kr?: string;
  ticker: string;
  country: "KR" | "US";
  sector: string;
}

type Point = Record<string, number | string>;

interface Props {
  companies: Company[];
  data: Point[];
  lang: string;
  topN?: number;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export default function TopHoldingsChart({
  companies,
  data,
  lang,
  topN = 10,
}: Props) {
  const ko = lang === "ko";
  const drawn = companies.slice(0, topN);

  const [mode, setMode] = useState<"bar" | "line">("bar");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggle = (ticker: string) => {
    const next = new Set(hidden);
    if (next.has(ticker)) next.delete(ticker);
    else next.add(ticker);
    setHidden(next);
  };

  const colorByTicker = useMemo(() => {
    const map: Record<string, string> = {};
    drawn.forEach((c, i) => {
      map[c.ticker] = COLORS[i % COLORS.length];
    });
    return map;
  }, [drawn]);

  // For line chart Y-axis
  const maxPct = useMemo(() => {
    let m = 0;
    for (const row of data) {
      for (const c of drawn) {
        const v = Number(row[c.ticker]) || 0;
        if (v > m) m = v;
      }
    }
    return Math.ceil(m * 1.1);
  }, [data, drawn]);

  // For bar chart Y-axis (stacked sum)
  const maxStack = useMemo(() => {
    let m = 0;
    for (const row of data) {
      let s = 0;
      for (const c of drawn) {
        if (hidden.has(c.ticker)) continue;
        s += Number(row[c.ticker]) || 0;
      }
      if (s > m) m = s;
    }
    return Math.ceil(m * 1.15);
  }, [data, drawn, hidden]);

  const renderTooltip = (props: unknown) => {
    const p = props as {
      active?: boolean;
      payload?: Array<{ payload: Point }>;
      label?: string;
    };
    if (!p.active || !p.payload || !p.payload.length) return null;
    const year = p.label as string;
    const rows = drawn
      .map((c) => {
        const row = p.payload![0].payload;
        const v = Number(row[c.ticker]) || 0;
        return { company: c, pct: v };
      })
      .filter((r) => r.pct > 0 && !hidden.has(r.company.ticker))
      .sort((a, b) => b.pct - a.pct);
    const total = rows.reduce((s, r) => s + r.pct, 0);
    return (
      <div className="bg-navy border border-navy-lighter rounded px-3 py-2 text-[11px] shadow-lg max-w-xs">
        <div className="text-slate-300 font-medium mb-1">{year}</div>
        <div className="text-slate-500 mb-2">
          {ko ? "표시 합계" : "visible sum"}: {total.toFixed(2)}%
        </div>
        <div className="space-y-0.5">
          {rows.map((r) => (
            <div key={r.company.ticker} className="flex justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300 truncate">
                <span
                  className="inline-block w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: colorByTicker[r.company.ticker] }}
                />
                {r.company.country === "KR" ? "🇰🇷" : "🇺🇸"}{" "}
                {ko && r.company.name_kr ? r.company.name_kr : r.company.name}
              </span>
              <span className="text-white font-mono">{r.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode("bar")}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            mode === "bar"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "text-slate-500 border border-navy-lighter hover:text-slate-300"
          }`}
        >
          {ko ? "누적 막대" : "Stacked Bar"}
        </button>
        <button
          onClick={() => setMode("line")}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            mode === "line"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "text-slate-500 border border-navy-lighter hover:text-slate-300"
          }`}
        >
          {ko ? "라인" : "Line"}
        </button>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                domain={[0, maxStack]}
                width={50}
              />
              <Tooltip content={renderTooltip} cursor={{ fill: "#1e293b55" }} />
              {drawn.map((c) => (
                <Bar
                  key={c.ticker}
                  dataKey={c.ticker}
                  stackId="top"
                  fill={colorByTicker[c.ticker]}
                  hide={hidden.has(c.ticker)}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={[0, maxPct]}
                width={50}
              />
              <Tooltip content={renderTooltip} />
              {drawn.map((c) => (
                <Line
                  key={c.ticker}
                  type="monotone"
                  dataKey={c.ticker}
                  stroke={colorByTicker[c.ticker]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={hidden.has(c.ticker)}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {drawn.map((c) => {
          const isHidden = hidden.has(c.ticker);
          return (
            <button
              key={c.ticker}
              onClick={() => toggle(c.ticker)}
              className={`flex items-center gap-1.5 text-left hover:bg-navy-lighter/40 rounded px-1 py-0.5 ${
                isHidden ? "opacity-40" : ""
              }`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: colorByTicker[c.ticker] }}
              />
              <span className="text-slate-300 truncate">
                {c.country === "KR" ? "🇰🇷" : "🇺🇸"}{" "}
                {ko && c.name_kr ? c.name_kr : c.name}
              </span>
              <span className="text-slate-600 ml-auto font-mono text-[10px]">
                {c.ticker}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-slate-600">
        {ko
          ? "누적 막대 = Top 10 각 해 포트 비중 쌓기 · 라인 = 각 종목 추이 · 범례 클릭으로 토글"
          : "Stacked bar = Top 10 annual weights stacked · Line = per-stock trend · click legend to toggle"}
      </div>
    </div>
  );
}
