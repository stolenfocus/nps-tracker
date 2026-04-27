"use client";

import { useState } from "react";

interface StreakEntry {
  cusip: string;
  ticker: string;
  name: string;
  streak: number;
  latestShares: number;
  latestValue: number;
  portfolioPct: number;
  prevPortfolioPct: number;
  portfolioPctChange: number;
  latestChangePct: number;
}

type SortKey =
  | "streak"
  | "latestChangePct"
  | "latestValue"
  | "portfolioPct"
  | "portfolioPctChange";

function fmtValue(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export default function StreakTable({
  data,
  lang,
}: {
  data: StreakEntry[];
  lang: string;
}) {
  const ko = lang === "ko";
  const [sortKey, setSortKey] = useState<SortKey>("streak");
  const [sortDesc, setSortDesc] = useState(true);
  const [limit, setLimit] = useState(30);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sorted = [...data].sort((a, b) => {
    const mul = sortDesc ? -1 : 1;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === bv) return b.latestValue - a.latestValue;
    return (av - bv) * mul;
  });

  const shown = sorted.slice(0, limit);
  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDesc ? " ↓" : " ↑") : "";

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-slate-500 text-[10px]">
          {ko ? "표시:" : "Show:"}
        </span>
        {[30, 50, 0].map((n) => (
          <button
            key={n}
            onClick={() => setLimit(n || data.length)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              limit === (n || data.length)
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "text-slate-500 border border-navy-lighter hover:text-slate-300"
            }`}
          >
            {n === 0 ? (ko ? "전체" : "All") : `Top ${n}`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-navy-lighter">
              <th className="text-left py-2 pr-2 font-medium w-8">#</th>
              <th className="text-left py-2 pr-2 font-medium">
                {ko ? "종목" : "Stock"}
              </th>
              <th
                className="text-center py-2 pr-2 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("streak")}
              >
                {ko ? "연속" : "Streak"}
                {arrow("streak")}
              </th>
              <th
                className="text-right py-2 pr-2 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("latestChangePct")}
              >
                {ko ? "이번 분기" : "Latest Q"}
                {arrow("latestChangePct")}
              </th>
              <th
                className="text-right py-2 pr-2 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("latestValue")}
              >
                {ko ? "평가액" : "Value"}
                {arrow("latestValue")}
              </th>
              <th
                className="text-right py-2 pr-2 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("portfolioPct")}
              >
                {ko ? "비중" : "Weight"}
                {arrow("portfolioPct")}
              </th>
              <th
                className="text-right py-2 pr-2 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("portfolioPctChange")}
              >
                {ko ? "비중 변화" : "Wt Chg"}
                {arrow("portfolioPctChange")}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s, i) => (
              <tr
                key={s.cusip}
                className="border-b border-navy-lighter/50 hover:bg-navy-lighter/40"
              >
                <td className="py-2 pr-2 text-slate-500 font-mono">
                  {i + 1}
                </td>
                <td className="py-2 pr-2">
                  <span className="text-slate-200">
                    {s.name.length > 25 ? s.name.slice(0, 23) + "…" : s.name}
                  </span>
                  <span className="text-slate-600 font-mono ml-2 text-[10px]">
                    {s.ticker}
                  </span>
                </td>
                <td className="py-2 pr-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      s.streak >= 10
                        ? "bg-emerald-500/20 text-emerald-300"
                        : s.streak >= 6
                        ? "bg-blue-500/20 text-blue-300"
                        : s.streak >= 4
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {s.streak}Q
                  </span>
                </td>
                <td
                  className={`py-2 pr-2 text-right font-mono ${
                    s.latestChangePct >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {s.latestChangePct >= 0 ? "+" : ""}
                  {s.latestChangePct.toFixed(1)}%
                </td>
                <td className="py-2 pr-2 text-right text-slate-300 font-mono">
                  {fmtValue(s.latestValue)}
                </td>
                <td className="py-2 pr-2 text-right text-white font-mono font-medium">
                  {s.portfolioPct.toFixed(2)}%
                </td>
                <td
                  className={`py-2 pr-2 text-right font-mono ${
                    s.portfolioPctChange >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {s.portfolioPctChange >= 0 ? "+" : ""}
                  {s.portfolioPctChange.toFixed(3)}%p
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-[10px] text-slate-600">
        {ko
          ? `총 ${data.length}개 연속 매수 종목 · 컬럼 클릭으로 정렬`
          : `${data.length} stocks with consecutive buys · click columns to sort`}
      </div>
    </div>
  );
}
