"use client";

import { useState, Fragment } from "react";
import type { Disclosure } from "@/lib/feed-data";

const typeBadge: Record<string, { label: string; cls: string }> = {
  신규: { label: "NEW", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  증가: { label: "UP", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  감소: { label: "DOWN", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  확인필요: { label: "?", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const sectorMap: Record<string, string> = {
  "전기·전자": "Electronics",
  "섬유·의류": "Textiles",
  "기계·장비": "Machinery",
  "일반서비스": "Services",
  "전기·가스": "Utilities",
  "비금속": "Non-Metals",
  "화학": "Chemicals",
  "보험": "Insurance",
  "금속": "Metals",
  "제약": "Pharma",
  "운송장비·부품": "Auto Parts",
  "IT 서비스": "IT Services",
  "의료·정밀기기": "Medical",
  "유통": "Retail",
  "오락·문화": "Entertainment",
  "건설": "Construction",
  "음식료": "Food & Bev",
  "은행": "Banking",
  "증권": "Securities",
  "통신": "Telecom",
  "종이·목재": "Paper",
  "철강": "Steel",
  "전자부품": "Components",
};

function fmt(n: number | undefined): string {
  if (!n || n === 0) return "-";
  return n.toLocaleString();
}

function fmtKrw(n: number, ko: boolean = false): string {
  if (!n) return "-";
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (ko) {
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`;
    if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(0)}억`;
    return `${sign}${(abs / 1e4).toFixed(0)}만`;
  }
  // English: show KRW with clean formatting
  if (abs >= 1e12) return `${sign}KRW ${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}KRW ${(abs / 1e9).toFixed(0)}B`;
  if (abs >= 1e6) return `${sign}KRW ${(abs / 1e6).toFixed(0)}M`;
  return `${sign}KRW ${abs.toLocaleString()}`;
}

function fmtPeriod(p: string): string {
  if (!p || p.length < 6) return p || "-";
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const y = p.slice(2, 4);
  const m = parseInt(p.slice(4, 6), 10);
  return (months[m] || p.slice(4, 6)) + " '" + y;
}

function HBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.max((Math.abs(value) / max) * 100, 2) : 0;
  return (
    <div className="w-full bg-navy-lighter rounded-full h-1.5 mt-0.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${w}%` }} />
    </div>
  );
}

function DetailPanel({ d, isKo }: { d: Disclosure; isKo: boolean }) {
  const ratios = d.financial_ratio_history || [];
  const ebitdas = d.ebitda_history || [];
  const trades = d.trades || [];

  const maxEps = Math.max(...ratios.map((r) => Math.abs(r.eps)), 1);
  const maxRoe = Math.max(...ratios.map((r) => Math.abs(r.roe)), 1);
  const maxEbitda = Math.max(...ebitdas.map((e) => Math.abs(e.ebitda)), 1);

  return (
    <div className="bg-navy border-t border-navy-lighter px-5 py-5">
      {/* Financial metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* EPS */}
        <div className="bg-navy-light rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 tracking-wide">
            EPS <span className="text-slate-600 font-normal">{isKo ? "(주당순이익)" : "(Earnings Per Share)"}</span>
          </h4>
          <div className="space-y-2">
            {[...ratios].reverse().map((r) => (
              <div key={r.period} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-14 shrink-0">{fmtPeriod(r.period)}</span>
                <div className="flex-1">
                  <HBar value={r.eps} max={maxEps} color={r.eps >= 0 ? "bg-emerald-500/70" : "bg-red-500/70"} />
                </div>
                <span className={`text-xs font-mono w-16 text-right ${r.eps >= 0 ? "text-slate-200" : "text-red-400"}`}>
                  {fmt(Math.round(r.eps))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROE */}
        <div className="bg-navy-light rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 tracking-wide">
            ROE <span className="text-slate-600 font-normal">{isKo ? "(자기자본이익률)" : "(Return on Equity)"}</span>
          </h4>
          <div className="space-y-2">
            {[...ratios].reverse().map((r) => (
              <div key={r.period} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-14 shrink-0">{fmtPeriod(r.period)}</span>
                <div className="flex-1">
                  <HBar value={r.roe} max={maxRoe} color={r.roe >= 10 ? "bg-emerald-500/70" : r.roe >= 0 ? "bg-blue-500/50" : "bg-red-500/70"} />
                </div>
                <span className={`text-xs font-mono w-14 text-right ${r.roe >= 10 ? "text-emerald-400" : r.roe >= 0 ? "text-slate-300" : "text-red-400"}`}>
                  {r.roe.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EBITDA */}
        <div className="bg-navy-light rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 tracking-wide">EBITDA</h4>
          <div className="space-y-2">
            {[...ebitdas].reverse().map((e) => (
              <div key={e.period} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-14 shrink-0">{fmtPeriod(e.period)}</span>
                <div className="flex-1">
                  <HBar value={e.ebitda} max={maxEbitda} color={e.ebitda >= 0 ? "bg-cyan-500/60" : "bg-red-500/70"} />
                </div>
                <span className="text-xs font-mono w-16 text-right text-slate-200">{fmt(Math.round(e.ebitda))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth + Trade row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Growth */}
        <div className="bg-navy-light rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 tracking-wide">{isKo ? "성장" : "Growth"}</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600">
                <th className="text-left pb-1 font-normal">{isKo ? "기간" : "Period"}</th>
                <th className="text-right pb-1 font-normal">{isKo ? "매출" : "Revenue"}</th>
                <th className="text-right pb-1 font-normal">{isKo ? "영업이익" : "Op. Profit"}</th>
              </tr>
            </thead>
            <tbody>
              {[...ratios].reverse().map((r) => (
                <tr key={r.period} className="border-t border-navy-lighter">
                  <td className="py-1 text-slate-500">{fmtPeriod(r.period)}</td>
                  <td className={`py-1 text-right font-mono ${r.revenue_growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {r.revenue_growth > 0 ? "+" : ""}{r.revenue_growth.toFixed(1)}%
                  </td>
                  <td className={`py-1 text-right font-mono ${r.op_profit_growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {r.op_profit_growth > 0 ? "+" : ""}{r.op_profit_growth.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trade Details */}
        <div className="bg-navy-light rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 tracking-wide">
            {isKo ? "거래 내역" : "Trade Details"}
            {d.obligation_date && (
              <span className="text-slate-600 font-normal ml-1">
                — {d.obligation_date.slice(0,4)}/{d.obligation_date.slice(4,6)}/{d.obligation_date.slice(6)}
              </span>
            )}
          </h4>
          {trades.filter((t) => t.unit_price > 0).length > 0 ? (
            <>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-600">
                    <th className="text-left pb-1 font-normal">{isKo ? "구분" : "Action"}</th>
                    <th className="text-right pb-1 font-normal">{isKo ? "수량" : "Shares"}</th>
                    <th className="text-right pb-1 font-normal">{isKo ? "가격" : "Price"}</th>
                    <th className="text-right pb-1 font-normal">{isKo ? "금액" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody>
                  {trades
                    .filter((t) => t.unit_price > 0)
                    .map((t, ti) => (
                      <tr key={ti} className="border-t border-navy-lighter">
                        <td className={`py-1.5 ${t.shares_change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {t.shares_change > 0 ? (isKo ? "매수" : "Buy") : (isKo ? "매도" : "Sell")}
                        </td>
                        <td className="py-1.5 text-right text-slate-300 font-mono">
                          {Math.abs(t.shares_change).toLocaleString()}
                        </td>
                        <td className="py-1.5 text-right text-slate-300 font-mono">
                          {t.unit_price.toLocaleString()}{t.estimated && <span className="text-yellow-500">*</span>}
                        </td>
                        <td className="py-1.5 text-right text-white font-mono">
                          {fmtKrw(t.shares_change * t.unit_price, isKo)}{t.estimated && <span className="text-yellow-500">*</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="mt-2 pt-2 border-t border-navy-lighter flex justify-between text-sm font-semibold">
                <span className="text-slate-400">{isKo ? "순매수" : "Net"}</span>
                <span className={d.net_amount >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {fmtKrw(d.net_amount, isKo)}
                  {d.net_amount_usd ? (
                    <span className="text-slate-500 font-normal text-xs ml-1">
                      (${(Math.abs(d.net_amount_usd) / 1000000).toFixed(1)}M)
                    </span>
                  ) : null}
                </span>
              </div>
            </>
          ) : (
            <p className="text-slate-600 text-xs">{isKo ? "가격 데이터 없음" : "No price data available"}</p>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-600 flex-wrap">
        <span>BPS {fmt(d.bps)}</span>
        <span>EV/EBITDA {d.ev_ebitda ? d.ev_ebitda.toFixed(1) : "-"}</span>
        {d.sector_detail && <span>{d.sector_detail}</span>}
        {d.established && <span>Est. {d.established.slice(0, 4)}</span>}
        <span>Fin. {d.fin_period || "-"}</span>
        {d.homepage && (
          <a href={`https://${d.homepage}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">
            {d.homepage}
          </a>
        )}
        <a href={d.dart_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-auto">
          DART Filing ↗
        </a>
      </div>
    </div>
  );
}

type SortKey = "type" | "stock" | "sector" | "chg" | "close" | "per" | "pbr" | "roe" | "ev" | "lev" | "net" | null;

function getSortValue(d: Disclosure, key: SortKey): number | string {
  switch (key) {
    case "type": return d.change_type;
    case "stock": return d.stock_name;
    case "sector": return d.sector || "";
    case "chg": return parseFloat(d.stake_change || "0");
    case "close": return d.ref_price || 0;
    case "per": return d.per || 9999;
    case "pbr": return d.pbr || 9999;
    case "roe": return d.roe || -9999;
    case "ev": return d.ev_ebitda || 9999;
    case "lev": return d.debt_ratio || 0;
    case "net": return d.net_amount || 0;
    default: return 0;
  }
}

export default function FeedTable({ disclosures, lang = "en" }: { disclosures: Disclosure[]; lang?: string }) {
  const isKo = lang === "ko";
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "per" || key === "pbr" || key === "ev" || key === "lev");
    }
    setExpanded(new Set());
  };

  const sorted = [...disclosures].sort((a, b) => {
    if (!sortKey) return 0;
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (typeof va === "string" && typeof vb === "string") {
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-navy-lighter text-slate-500 text-[10px] uppercase tracking-wider whitespace-nowrap">
            {([
              ["type", "left", isKo ? "구분" : "Type", isKo ? "공시 유형" : "Disclosure type: NEW/UP/DOWN", ""],
              ["stock", "left", isKo ? "종목" : "Stock", isKo ? "종목명 및 코드" : "Stock name and code", ""],
              ["sector", "left", isKo ? "업종" : "Sector", isKo ? "업종" : "Industry sector", "hidden md:table-cell"],
              [null, "right", isKo ? "이전" : "Prev", isKo ? "이전 지분율" : "Previous stake %", "hidden lg:table-cell"],
              [null, "right", isKo ? "현재" : "New", isKo ? "현재 지분율" : "New stake %", "hidden lg:table-cell"],
              ["chg", "right", isKo ? "변동" : "Chg", isKo ? "지분 변동 (%p)" : "Change in stake (percentage points)", ""],
              ["close", "right", "Close (₩)", "Closing price on basis date (KRW)", "hidden sm:table-cell"],
              ["per", "right", "PER", "Price-to-Earnings Ratio (trailing)", "hidden lg:table-cell"],
              ["pbr", "right", "PBR", "Price-to-Book Ratio (trailing)", "hidden lg:table-cell"],
              ["roe", "right", "ROE", "Return on Equity (%)", "hidden md:table-cell"],
              ["ev", "right", "EV/EB", "Enterprise Value / EBITDA", "hidden lg:table-cell"],
              ["lev", "right", "Lev.", "Debt-to-Equity Ratio (%)", "hidden lg:table-cell"],
            ] as [SortKey, string, string, string, string][]).map(([key, align, label, tip, hide]) => (
              <th
                key={label}
                className={`text-${align} py-2.5 px-2 font-medium ${hide} ${key ? "cursor-pointer hover:text-slate-300 select-none group" : ""}`}
                title={tip}
                onClick={key ? () => handleSort(key) : undefined}
              >
                {label}
                {key && sortKey === key ? (
                  <span className="ml-0.5 text-blue-400">{sortAsc ? "▲" : "▼"}</span>
                ) : key ? (
                  <span className="ml-0.5 text-slate-700 group-hover:text-slate-500">⇅</span>
                ) : null}
              </th>
            ))}
            <th
              className="text-right py-2.5 px-2 font-medium cursor-pointer hover:text-slate-300 select-none group"
              title="Net transaction amount (Buy - Sell) in KRW"
              onClick={() => handleSort("net")}
            >
              Net
              {sortKey === "net" ? (
                <span className="ml-0.5 text-blue-400">{sortAsc ? "▲" : "▼"}</span>
              ) : (
                <span className="ml-0.5 text-slate-700 group-hover:text-slate-500">⇅</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => {
            const badge = typeBadge[d.change_type] || {
              label: d.change_type,
              cls: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            };
            const isOpen = expanded.has(i);
            const stakePrev = d.stake_prev_pct != null ? `${d.stake_prev_pct}%` : "-";
            const stakeNow = `${d.stake_pct}%`;
            const stakeChg = d.stake_change
              ? `${parseFloat(d.stake_change) > 0 ? "+" : ""}${d.stake_change}%p`
              : "-";

            return (
              <Fragment key={`disc-${i}`}>
              <tr
                  className={`border-b border-navy-lighter/50 cursor-pointer transition-colors ${
                    isOpen ? "bg-navy-light" : "hover:bg-navy-light/50"
                  }`}
                  onClick={() => toggle(i)}
                >
                  <td className="py-3 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-white font-medium text-xs">
                      {isKo
                        ? d.stock_name
                        : d.name_eng
                          ? `${d.name_eng.slice(0, 30)}${d.name_eng.length > 30 ? "…" : ""}`
                          : d.stock_name}
                      {d.nxt_available && (
                        <span className="ml-1.5 px-1 py-0 rounded text-[7px] bg-purple-500/20 text-purple-400 border border-purple-500/30 align-middle">
                          NXT
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      {isKo ? (d.name_eng ? `${d.name_eng.slice(0,20)}` : "") : (d.name_eng ? d.stock_name : "")} {d.stock_code}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-400 whitespace-nowrap hidden md:table-cell">{sectorMap[d.sector] || d.sector || "-"}</td>
                  <td className="py-3 px-2 text-right whitespace-nowrap text-slate-500 font-mono hidden lg:table-cell">{stakePrev}</td>
                  <td className="py-3 px-2 text-right whitespace-nowrap text-white font-mono font-medium hidden lg:table-cell">{stakeNow}</td>
                  <td
                    className={`py-3 px-2 text-right font-mono font-medium ${
                      parseFloat(d.stake_change || "0") > 0
                        ? "text-emerald-400"
                        : parseFloat(d.stake_change || "0") < 0
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {stakeChg}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap font-mono hidden sm:table-cell">
                    {d.ref_price ? (
                      <div>
                        <div className="text-white">{fmt(d.ref_price)}</div>
                        <div className="text-[9px] text-slate-500">
                          {d.ref_price_usd ? `$${Math.round(d.ref_price_usd)}` : ""}
                          {d.obligation_date ? ` · ${d.obligation_date.slice(4,6)}/${d.obligation_date.slice(6)}` : ""}
                          {d.trading_halted && <span className="text-red-400 ml-1">halted</span>}
                        </div>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300 font-mono hidden lg:table-cell">
                    {d.per ? d.per.toFixed(1) : "-"}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300 font-mono hidden lg:table-cell">
                    {d.pbr ? d.pbr.toFixed(2) : "-"}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-mono hidden md:table-cell ${
                      d.roe > 10 ? "text-emerald-400" : d.roe > 0 ? "text-slate-300" : "text-red-400"
                    }`}
                  >
                    {d.roe ? `${d.roe.toFixed(1)}%` : "-"}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300 font-mono hidden lg:table-cell">
                    {d.ev_ebitda ? d.ev_ebitda.toFixed(1) : "-"}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-mono hidden lg:table-cell ${
                      d.debt_ratio > 200 ? "text-red-400" : d.debt_ratio > 100 ? "text-yellow-400" : "text-slate-300"
                    }`}
                  >
                    {d.debt_ratio ? `${d.debt_ratio.toFixed(0)}%` : "-"}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-mono font-medium ${
                      d.net_amount > 0 ? "text-emerald-400" : d.net_amount < 0 ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {d.net_amount
                      ? <div>
                          <div>
                            {fmtKrw(d.net_amount, isKo)}
                            {d.trades?.some((t: any) => t.estimated) && <span className="text-yellow-500">*</span>}
                          </div>
                          {d.net_amount_usd ? (
                            <div className="text-[9px] text-slate-500">
                              ${(Math.abs(d.net_amount_usd) / 1000000).toFixed(1)}M
                            </div>
                          ) : null}
                        </div>
                      : "-"}
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`detail-${i}`}>
                    <td colSpan={13} className="p-0">
                      <DetailPanel d={d} isKo={isKo} />
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
