"use client";

import { useState, Fragment } from "react";
import type { CompanyFiling } from "@/lib/company-types";
import { formatDate } from "@/lib/company-types";

interface Props {
  filings: CompanyFiling[];
  lang: string;
}

const typeBadge: Record<string, { label: string; cls: string }> = {
  신규:   { label: "NEW",       cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  재진입: { label: "RE-ENTRY",  cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  증가:   { label: "UP",        cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  감소:   { label: "DOWN",      cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  전량처분:{ label: "EXIT",      cls: "bg-red-700/40 text-red-200 border-red-500/50 font-bold" },
  확인필요:{ label: "?",         cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const typeBadgeKo: Record<string, string> = {
  신규: "신규",
  재진입: "재진입",
  증가: "증가",
  감소: "감소",
  전량처분: "전량처분",
  확인필요: "확인필요",
};

function fmtKrw(n: number | null | undefined, ko: boolean): string {
  if (n === null || n === undefined || n === 0) return "-";
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (ko) {
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`;
    if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(0)}억`;
    return `${sign}${(abs / 1e4).toFixed(0)}만`;
  }
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  return `${sign}${abs.toLocaleString()}`;
}

export default function CompanyFilingsTable({ filings, lang }: Props) {
  const ko = lang === "ko";
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const sorted = [...filings].sort((a, b) => {
    const ka = a.obligation_date || a.ref_date;
    const kb = b.obligation_date || b.ref_date;
    return kb.localeCompare(ka); // newest first
  });

  const toggle = (i: number) => {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setExpanded(next);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 border-b border-navy-lighter">
            <th className="text-left py-2 pr-2 font-medium">
              {ko ? "기준일" : "Date"}
            </th>
            <th className="text-left py-2 pr-2 font-medium">
              {ko ? "유형" : "Type"}
            </th>
            <th className="text-right py-2 pr-2 font-medium">
              {ko ? "지분율" : "Stake"}
            </th>
            <th className="text-right py-2 pr-2 font-medium">
              {ko ? "변동" : "Change"}
            </th>
            <th className="text-right py-2 pr-2 font-medium">
              {ko ? "순매수" : "Net"}
            </th>
            <th className="text-right py-2 pr-2 font-medium">
              {ko ? "거래" : "Trades"}
            </th>
            <th className="text-left py-2 pl-2 font-medium">DART</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => {
            const badge = typeBadge[f.change_type] || typeBadge["확인필요"];
            const label = ko ? typeBadgeKo[f.change_type] || f.change_type : badge.label;
            const isExp = expanded.has(i);
            return (
              <Fragment key={`${f.obligation_date}-${i}`}>
                <tr
                  className="border-b border-navy-lighter/50 hover:bg-navy-light/40 cursor-pointer"
                  onClick={() => toggle(i)}
                >
                  <td className="py-2 pr-2 text-slate-300 font-mono">
                    {formatDate(f.obligation_date || f.ref_date)}
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded border text-[10px] ${badge.cls}`}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right text-white font-medium">
                    {f.stake_pct !== null ? `${f.stake_pct.toFixed(2)}%` : "-"}
                  </td>
                  <td
                    className={`py-2 pr-2 text-right ${
                      f.stake_change !== null && f.stake_change > 0
                        ? "text-emerald-400"
                        : f.stake_change !== null && f.stake_change < 0
                        ? "text-red-400"
                        : "text-slate-500"
                    }`}
                  >
                    {f.stake_change !== null
                      ? `${f.stake_change >= 0 ? "+" : ""}${f.stake_change.toFixed(2)}%p`
                      : "-"}
                  </td>
                  <td
                    className={`py-2 pr-2 text-right ${
                      f.net_amount > 0
                        ? "text-emerald-400"
                        : f.net_amount < 0
                        ? "text-red-400"
                        : "text-slate-500"
                    }`}
                  >
                    {fmtKrw(f.net_amount, ko)}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-400">
                    {f.trade_count}
                  </td>
                  <td className="py-2 pl-2">
                    <a
                      href={f.dart_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 text-[10px]"
                    >
                      ↗
                    </a>
                  </td>
                </tr>
                {isExp && f.trades.length > 0 && (
                  <tr className="bg-navy-light/20">
                    <td colSpan={7} className="py-2 px-2">
                      <div className="border-l-2 border-blue-500/40 pl-3 text-[10px]">
                        <div className="text-slate-500 mb-1">
                          {ko ? "상세 매매" : "Trade details"} ({f.trades.length})
                        </div>
                        <div className="space-y-0.5 font-mono">
                          {f.trades.map((t, ti) => (
                            <div
                              key={ti}
                              className="grid grid-cols-[90px_110px_1fr_1fr_1fr_100px] gap-2 text-slate-300"
                            >
                              <span>{formatDate(t.date)}</span>
                              <span
                                className={
                                  t.shares_change >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }
                              >
                                {t.reason}
                              </span>
                              <span className="text-right text-slate-500">
                                {t.shares_before.toLocaleString()}
                              </span>
                              <span
                                className={`text-right ${
                                  t.shares_change >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {t.shares_change >= 0 ? "+" : ""}
                                {t.shares_change.toLocaleString()}
                              </span>
                              <span className="text-right text-white">
                                {t.shares_after.toLocaleString()}
                              </span>
                              <span className="text-right text-slate-400">
                                {t.unit_price > 0
                                  ? `₩${t.unit_price.toLocaleString()}`
                                  : "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
