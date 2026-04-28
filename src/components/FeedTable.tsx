"use client";

import { useState } from "react";
import Link from "next/link";

interface Disclosure {
  stock_name: string;
  stock_code: string;
  change_type: string;
  stake_pct: number | string;
  stake_change: number | string | null;
  stake_prev_pct: number | string | null;
  fin_period?: string;
  name_eng?: string;
  sector?: string;
  ref_price?: number;
  ref_price_usd?: number;
  per?: number;
  pbr?: number;
  roe?: number;
  ev_ebitda?: number;
  debt_ratio?: number;
  net_amount?: number;
  net_amount_usd?: number;
  obligation_date?: string;
  dart_link?: string;
  trades?: Array<{
    date: string;
    reason: string;
    shares_before: number;
    shares_change: number;
    shares_after: number;
    unit_price: number;
    estimated: boolean;
  }>;
}

const changeColors: Record<string, string> = {
  "신규": "text-accent-light",
  "증가": "text-gain",
  "감소": "text-loss",
  "전량처분": "text-red-500",
  "확인필요": "text-yellow-400",
};

const changeLabel: Record<string, string> = {
  "신규": "NEW", "증가": "UP", "감소": "DOWN", "전량처분": "EXIT", "확인필요": "?",
};

type SortKey = "change_type" | "stock_name" | "sector" | "stake_change" | "ref_price" | "per" | "pbr" | "roe" | "ev_ebitda" | "debt_ratio" | "net_amount";

function fmtPrice(n: number | undefined): string {
  if (!n) return "-";
  return n.toLocaleString();
}

function fmtNet(n: number | undefined, ko: boolean): string {
  if (!n || n === 0) return "-";
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (ko) {
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`;
    if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(1)}억`;
    return `${sign}${(abs / 1e4).toFixed(0)}만`;
  }
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  return `${sign}$${(abs / 1e3).toFixed(0)}K`;
}

function fmtDate(d: string | undefined): string {
  if (!d || d.length < 8) return "";
  const clean = d.replace(/-/g, "");
  return `${clean.slice(4, 6)}/${clean.slice(6, 8)}`;
}

export default function FeedTable({
  disclosures,
  lang,
}: {
  disclosures: Disclosure[];
  lang: string;
}) {
  const isKo = lang === "ko";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...disclosures].sort((a, b) => {
    if (!sortKey) return 0;
    let av: number | string = (a as unknown as Record<string, unknown>)[sortKey] as string ?? "";
    let bv: number | string = (b as unknown as Record<string, unknown>)[sortKey] as string ?? "";
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const toggleExpand = (i: number) => {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i); else next.add(i);
    setExpanded(next);
  };

  const SH = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="py-1.5 px-2 font-medium cursor-pointer hover:text-white select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : "⇅"}
    </th>
  );

  const hasEstimated = disclosures.some((d) => d.trades?.some((t) => t.estimated));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-slate-500 border-b border-navy-lighter">
            <SH k="change_type" label={isKo ? "유형" : "Type"} />
            <SH k="stock_name" label={isKo ? "종목" : "Stock"} />
            <SH k="sector" label={isKo ? "업종" : "Sector"} />
            <th className="text-right py-1.5 px-2 font-medium">{isKo ? "이전" : "Prev"}</th>
            <th className="text-right py-1.5 px-2 font-medium">{isKo ? "현재" : "New"}</th>
            <SH k="stake_change" label={isKo ? "변동" : "Chg"} />
            <SH k="ref_price" label={isKo ? "종가(₩)" : "Close (₩)"} />
            <SH k="per" label="PER" />
            <SH k="pbr" label="PBR" />
            <SH k="roe" label="ROE" />
            <SH k="ev_ebitda" label="EV/EB" />
            <SH k="debt_ratio" label={isKo ? "부채" : "Lev."} />
            <SH k="net_amount" label="Net" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <>
              <tr
                key={i}
                className="border-b border-navy-lighter/50 hover:bg-white/5 cursor-pointer"
                onClick={() => toggleExpand(i)}
              >
                <td className={`py-1.5 px-2 font-medium ${changeColors[d.change_type] || "text-slate-400"}`}>
                  {isKo ? d.change_type : (changeLabel[d.change_type] || d.change_type)}
                </td>
                <td className="py-1.5 px-2">
                  <Link
                    href={`/${lang}/company/${d.stock_code}`}
                    className="text-white hover:text-accent-light transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isKo ? d.stock_name : (d.name_eng || d.stock_name)}
                  </Link>
                  <div className="text-slate-600 text-[9px]">
                    {isKo ? d.name_eng : d.stock_name}
                  </div>
                  <div className="text-slate-600 text-[9px] font-mono">{d.stock_code}</div>
                </td>
                <td className="py-1.5 px-2 text-slate-400">{d.sector || "-"}</td>
                <td className="py-1.5 px-2 text-right text-slate-500 font-mono">
                  {d.stake_prev_pct != null ? `${d.stake_prev_pct}%` : "-"}
                </td>
                <td className="py-1.5 px-2 text-right text-white font-mono">{d.stake_pct}%</td>
                <td className={`py-1.5 px-2 text-right font-mono ${Number(d.stake_change) > 0 ? "text-gain" : Number(d.stake_change) < 0 ? "text-loss" : "text-slate-400"}`}>
                  {d.stake_change != null ? `${Number(d.stake_change) > 0 ? "+" : ""}${d.stake_change}%p` : "-"}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">
                  {d.ref_price ? (
                    <div>
                      <div>{fmtPrice(d.ref_price)}</div>
                      {d.ref_price_usd ? <div className="text-slate-600 text-[9px]">${d.ref_price_usd.toFixed(0)}</div> : null}
                      {d.obligation_date ? <div className="text-slate-600 text-[9px]">· {fmtDate(d.obligation_date)}</div> : null}
                    </div>
                  ) : "-"}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">{d.per ? d.per.toFixed(1) : "-"}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">{d.pbr ? d.pbr.toFixed(2) : "-"}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">{d.roe ? `${d.roe.toFixed(1)}%` : "-"}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">{d.ev_ebitda ? d.ev_ebitda.toFixed(1) : "-"}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-300">{d.debt_ratio ? `${d.debt_ratio.toFixed(0)}%` : "-"}</td>
                <td className="py-1.5 px-2 text-right font-mono">
                  {d.net_amount ? (
                    <div>
                      <div className={d.net_amount > 0 ? "text-gain" : "text-loss"}>
                        {isKo ? fmtNet(d.net_amount, true) : fmtNet(d.net_amount_usd, false)}
                      </div>
                      <div className="text-slate-600 text-[9px]">
                        {isKo ? fmtNet(d.net_amount_usd, false) : fmtNet(d.net_amount, true)}
                      </div>
                    </div>
                  ) : "-"}
                </td>
              </tr>
              {expanded.has(i) && d.trades && d.trades.length > 0 && (
                <tr key={`${i}-detail`}>
                  <td colSpan={13} className="bg-navy-lighter/30 px-4 py-2">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="text-left py-1 px-1">{isKo ? "일자" : "Date"}</th>
                          <th className="text-left py-1 px-1">{isKo ? "사유" : "Reason"}</th>
                          <th className="text-right py-1 px-1">{isKo ? "변동수" : "Shares Δ"}</th>
                          <th className="text-right py-1 px-1">{isKo ? "보유후" : "After"}</th>
                          <th className="text-right py-1 px-1">{isKo ? "단가" : "Price"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.trades.map((t, j) => (
                          <tr key={j} className="border-t border-navy-lighter/30">
                            <td className="py-1 px-1 font-mono text-slate-400">{fmtDate(t.date)}</td>
                            <td className="py-1 px-1 text-slate-300">{t.reason}{t.estimated ? " *" : ""}</td>
                            <td className={`py-1 px-1 text-right font-mono ${t.shares_change > 0 ? "text-gain" : "text-loss"}`}>
                              {t.shares_change > 0 ? "+" : ""}{t.shares_change.toLocaleString()}
                            </td>
                            <td className="py-1 px-1 text-right font-mono text-slate-400">{t.shares_after.toLocaleString()}</td>
                            <td className="py-1 px-1 text-right font-mono text-slate-400">
                              {t.unit_price ? `₩${t.unit_price.toLocaleString()}` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {d.dart_link && (
                      <a href={d.dart_link} target="_blank" rel="noopener noreferrer" className="text-accent-light text-[10px] hover:underline mt-1 inline-block">
                        DART ↗
                      </a>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
      {hasEstimated && (
        <div className="text-slate-600 text-[9px] mt-2">
          * {isKo ? "순매수금액은 공시 기준일 종가로 추정" : "Net amount is estimated using closing price on report basis date"}
        </div>
      )}
    </div>
  );
}
