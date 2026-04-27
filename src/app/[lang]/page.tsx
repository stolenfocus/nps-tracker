import Link from "next/link";
import {
  getLatestQuarter,
  getLatestQuarterKey,
  getNewBuys,
  getSoldPositions,
  getMovers,
  getBacktestData,
  getGlobalYear,
  getLatestGlobalYear,
  fmtValue,
  fmtPct,
} from "@/lib/data";
import { getFeedIndex, getFeedDay } from "@/lib/feed-data";
import MiniHeatmap from "@/components/MiniHeatmap";
import ExpandableList from "@/components/ExpandableList";
import { getDictionary, type Locale } from "./dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: "NPS Tracker — Korea's National Pension Fund Dashboard",
    description:
      "Track Korea's National Pension Service global portfolio. Korean and US stock holdings, updated quarterly from SEC 13F filings and DART disclosures.",
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NPS Tracker",
  url: "https://stolenfocus.github.io/nps-tracker/",
  description:
    "Track Korea's National Pension Service stock holdings — US (13F) and Korean domestic portfolio.",
};

// Locale-aware formatters
function fmtUsd(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toFixed(0)}`;
}

function fmtKrw(val_usd: number, rate: number): string {
  const krw = val_usd * rate;
  if (krw >= 1e16) return `${(krw / 1e16).toFixed(0)}경원`;
  if (krw >= 1e12) return `${(krw / 1e12).toFixed(0)}조원`;
  if (krw >= 1e8) return `${(krw / 1e8).toFixed(0)}억원`;
  return `₩${krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isKo = lang === "ko";
  const latest = getLatestQuarter();

  const holdingsCount = latest.holdings.length;
  const fileDate = latest.file_date;
  const latestQKey = getLatestQuarterKey();

  // Global data
  const globalYear = getGlobalYear(getLatestGlobalYear());
  const globalTotal = globalYear.total_usd;
  const krTotal = globalYear.kr_total_usd;
  const usTotal = globalYear.us_total_usd;
  const fxRate = globalYear.exchange_rate;

  // Locale-aware value formatter
  const fmtTotal = (v: number) => isKo ? fmtKrw(v, fxRate) : fmtUsd(v);
  const krCount = globalYear.kr_count;
  const usCount = globalYear.us_count;
  const totalCount = krCount + usCount;
  const krPct = ((krTotal / globalTotal) * 100).toFixed(1);
  const usPct = ((usTotal / globalTotal) * 100).toFixed(1);

  // Top 15 global holdings (KR + US combined)
  const globalTop15 = globalYear.holdings
    .sort((a: { value_usd: number }, b: { value_usd: number }) => b.value_usd - a.value_usd)
    .slice(0, 15);

  // New buys & sold
  const newBuys = getNewBuys();
  const sold = getSoldPositions();

  // Movers
  const { increases, decreases } = getMovers();


  // Heatmap data — pass full global holdings
  const heatmapHoldings = globalYear.holdings;

  // Quarter label from key
  const qDate = new Date(latestQKey + "T00:00:00");
  const qLabel = `Q${Math.ceil((qDate.getMonth() + 1) / 3)} ${qDate.getFullYear()}`;

  // Filed date label
  const filedDate = new Date(fileDate + "T00:00:00");
  const filedLabel = filedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1600px] mx-auto px-2 py-1">
        {/* NPS Daily Feed Banner — TOP */}
        {(() => {
          const feedIndex = getFeedIndex();
          if (!feedIndex.dates[0]) return null;

          const mostRecent = feedIndex.dates[0];
          const latestWithData = feedIndex.dates.find((d: any) => d.count > 0);
          const hasData = mostRecent.count > 0;
          const displayEntry = latestWithData || mostRecent;

          const feedDay = getFeedDay(displayEntry.date);
          const items = feedDay?.disclosures || [];
          const upCount = (displayEntry.summary["증가"] || 0) + (displayEntry.summary["신규"] || 0);
          const downCount = displayEntry.summary["감소"] || 0;

          return (
            <Link
              href={`/${lang}/feed`}
              className="block mb-2 rounded-lg overflow-hidden hover:brightness-110 transition-all"
            >
              <div className="bg-navy-light border border-emerald-500/20 rounded-lg overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">{dict.home.nps}</span>
                    <span className="text-[11px] text-slate-400">🇰🇷 {dict.home.dartFiling} · {displayEntry.date}</span>
                    {hasData ? (
                      <span className="text-[11px] text-white font-semibold ml-1">
                        {displayEntry.count} {dict.home.stocks} ·{" "}
                        {upCount > 0 && <span className="text-emerald-400">{upCount}↑</span>}
                        {upCount > 0 && downCount > 0 && " "}
                        {downCount > 0 && <span className="text-red-400">{downCount}↓</span>}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 ml-1">
                        {dict.home.noDisclosures} {mostRecent.date} · {dict.home.viewPast} →
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{dict.home.daily} · {dict.home.detailsArrow} →</span>
                </div>
                {/* Scrolling ticker */}
                {hasData && items.length > 0 && (() => {
                  const renderItem = (d: any, i: number) => {
                    const isUp = d.change_type === "증가" || d.change_type === "신규";
                    const name = (!isKo && d.name_eng)
                      ? d.name_eng.replace(/Co\.,?Ltd\.?|Inc\.?|Corp\.?|Corporation/gi, "").trim().slice(0, 20)
                      : d.stock_name;
                    return (
                      <span key={i} className="flex items-center gap-1 text-[11px] shrink-0">
                        <span className={isUp ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                          {isUp ? "▲" : "▼"}
                        </span>
                        <span className="text-white font-medium">{name}</span>
                        <span className={`font-mono ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                          {parseFloat(d.stake_change || "0") > 0 ? "+" : ""}{d.stake_change}%p
                        </span>
                        <span className="text-slate-700 mx-1">|</span>
                      </span>
                    );
                  };
                  return (
                    <div className="relative overflow-hidden py-1.5 bg-navy marquee-container">
                      {/* Scrolling: repeated items */}
                      <div className="flex items-center gap-4 animate-marquee whitespace-nowrap marquee-scroll">
                        {Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat().map(renderItem)}
                      </div>
                      {/* Hover: unique items only */}
                      <div className="hidden marquee-static flex-wrap gap-2 py-1">
                        {items.map(renderItem)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Link>
          );
        })()}

        {/* Row 1: Key Stats Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-navy-light border border-navy-lighter rounded text-[12px]">
          <span className="text-slate-500">{dict.home.total}</span>
          <span className="font-mono font-bold text-white">
            {fmtTotal(globalTotal)}
          </span>
          <span className="text-navy-lighter">|</span>
          <span className="text-slate-500">{"\uD83C\uDDF0\uD83C\uDDF7"}</span>
          <span className="font-mono font-semibold text-loss">
            {fmtTotal(krTotal)}
          </span>
          <span className="text-slate-600">({krPct}%)</span>
          <span className="text-navy-lighter">|</span>
          <span className="text-slate-500">{"\uD83C\uDDFA\uD83C\uDDF8"}</span>
          <span className="font-mono font-semibold text-accent">
            {fmtTotal(usTotal)}
          </span>
          <span className="text-slate-600">({usPct}%)</span>
          <span className="text-navy-lighter">|</span>
          <span className="text-slate-500">{dict.home.holdings}</span>
          <span className="font-mono text-white">{totalCount.toLocaleString()}</span>
          <span className="text-navy-lighter">|</span>
          <span className="text-slate-500">{dict.home.latest}</span>
          <span className="text-slate-300">{filedLabel}</span>
        </div>

        {/* Data Info Bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 mt-1 text-[10px] text-slate-500 bg-navy border border-navy-lighter rounded">
          <span>📊 <strong className="text-slate-400">{dict.home.usData}</strong> SEC 13F, {latestQKey} (filed {filedLabel})</span>
          <span className="text-navy-lighter">|</span>
          <span>📊 <strong className="text-slate-400">{dict.home.krData}</strong> {globalYear.date} (annual + DART estimated)</span>
          <span className="text-navy-lighter">|</span>
          <span>💱 <strong className="text-slate-400">{dict.home.fxRate}</strong> ₩{globalYear.exchange_rate.toFixed(0)}/USD</span>
          <span className="text-navy-lighter">|</span>
          <span>⚠️ {dict.home.disclaimer}</span>
        </div>

        {/* Row 2: Main Content — Heatmap + Table */}
        <div className="flex flex-col lg:flex-row gap-2 mt-2">
          {/* Left: Mini Heatmap */}
          <div className="lg:w-[40%] bg-navy-light border border-navy-lighter rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-navy-lighter">
              <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {dict.home.top30}
              </h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-loss" />
                  <span className="text-slate-500">KR</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-accent" />
                  <span className="text-slate-500">US</span>
                </span>
              </div>
            </div>
            <MiniHeatmap holdings={heatmapHoldings} count={30} lang={lang} />
            <div className="px-3 py-1 border-t border-navy-lighter text-[10px] text-slate-600 text-right">
              <Link href={`/${lang}/global`} className="hover:text-slate-400 transition-colors">
                {dict.home.fullHeatmap} &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Top 15 Holdings Table */}
          <div className="lg:w-[60%] bg-navy-light border border-navy-lighter rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-navy-lighter">
              <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {dict.home.top15}
              </h2>
              <span className="text-[10px] text-slate-600">
                {globalYear.kr_count + globalYear.us_count} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-navy text-slate-500 text-[10px] uppercase tracking-wider">
                    <th className="px-2 py-1.5 text-left w-8">#</th>
                    <th className="px-2 py-1.5 text-left w-6"></th>
                    <th className="px-2 py-1.5 text-left">{dict.home.name}</th>
                    <th className="px-2 py-1.5 text-right">{dict.home.value}</th>
                    <th className="px-2 py-1.5 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {globalTop15.map((h: { name: string; name_kr?: string; ticker: string; country: string; value_usd: number; pct_of_total: number }, i: number) => (
                    <tr
                      key={`${h.ticker}-${i}`}
                      className={`border-t border-navy-lighter ${
                        i % 2 === 0 ? "bg-navy-light" : "bg-navy-light/50"
                      } hover:bg-navy-lighter`}
                      style={{ height: 28 }}
                    >
                      <td className="px-2 py-1 text-slate-600 font-mono text-[10px]">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1 text-[10px]">
                        {h.country === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"}
                      </td>
                      <td className="px-2 py-1 truncate max-w-[200px]">
                        <span className="font-semibold text-accent-light text-[11px]">{h.ticker || ""}</span>
                        <span className="text-slate-400 ml-1.5">{isKo && h.name_kr ? h.name_kr : h.name}</span>
                      </td>
                      <td className="px-2 py-1 text-right text-white font-mono">
                        {fmtTotal(h.value_usd)}
                      </td>
                      <td className="px-2 py-1 text-right text-slate-500 font-mono">
                        {h.pct_of_total.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 3: Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          {/* New Buys */}
          <div className="bg-navy-light border border-navy-lighter rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-navy-lighter">
              <h2 className="text-[11px] font-semibold text-gain uppercase tracking-wider">
                {dict.home.newBuys} ({newBuys.length})
              </h2>
            </div>
            <div className="px-2 py-1">
              <ExpandableList totalCount={newBuys.length} initialCount={8} showAllLabel={dict.home.showAll || dict.common?.showAll || "Show all"} showLessLabel={isKo ? "접기" : "Show less"}>
                {newBuys.map((h, i) => (
                  <div
                    key={h.cusip}
                    className={`flex items-center justify-between px-1 py-1 text-[11px] ${
                      i % 2 === 0 ? "" : "bg-navy-light/50"
                    } rounded`}
                  >
                    <span className="text-accent-light font-medium w-16 shrink-0">
                      {h.ticker}
                    </span>
                    <span className="text-slate-500 truncate flex-1 px-1 text-[10px]">
                      {h.name}
                    </span>
                    <span className="text-white font-mono shrink-0">
                      {fmtValue(h.value)}
                    </span>
                  </div>
                ))}
              </ExpandableList>
            </div>
          </div>

          {/* Sold */}
          <div className="bg-navy-light border border-navy-lighter rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-navy-lighter">
              <h2 className="text-[11px] font-semibold text-loss uppercase tracking-wider">
                {dict.home.sold} ({sold.length})
              </h2>
            </div>
            <div className="px-2 py-1">
              <ExpandableList totalCount={sold.length} initialCount={8} showAllLabel={dict.home.showAll || "Show all"} showLessLabel={isKo ? "접기" : "Show less"}>
                {sold.map((h, i) => (
                  <div
                    key={h.cusip}
                    className={`flex items-center justify-between px-1 py-1 text-[11px] ${
                      i % 2 === 0 ? "" : "bg-navy-light/50"
                    } rounded`}
                  >
                    <span className="text-accent-light font-medium w-16 shrink-0">
                      {h.ticker}
                    </span>
                    <span className="text-slate-500 truncate flex-1 px-1 text-[10px]">
                      {h.name}
                    </span>
                    <span className="text-slate-400 font-mono shrink-0">
                      {fmtValue(h.value)}
                    </span>
                  </div>
                ))}
              </ExpandableList>
            </div>
          </div>

          {/* Top Movers */}
          <div className="bg-navy-light border border-navy-lighter rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-navy-lighter">
              <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {dict.home.topMovers}
              </h2>
            </div>
            <div className="px-2 py-1">
              <ExpandableList totalCount={increases.length + decreases.length} initialCount={8} showAllLabel={dict.home.showAll || "Show all"} showLessLabel={isKo ? "접기" : "Show less"}>
                {[
                  ...increases.map((h, i) => (
                    <div
                      key={`inc-${h.cusip}`}
                      className={`flex items-center justify-between px-1 py-0.5 text-[11px] ${
                        i % 2 === 0 ? "" : "bg-navy-light/50"
                      } rounded`}
                    >
                      <span className="text-accent-light font-medium w-16 shrink-0">
                        {h.ticker}
                      </span>
                      <span className="text-gain font-mono font-medium text-right shrink-0">
                        {fmtPct(h.qoqChangePct)}
                      </span>
                    </div>
                  )),
                  <div key="divider" className="border-t border-navy-lighter my-0.5" />,
                  ...decreases.map((h, i) => (
                    <div
                      key={`dec-${h.cusip}`}
                      className={`flex items-center justify-between px-1 py-0.5 text-[11px] ${
                        i % 2 === 0 ? "" : "bg-navy-light/50"
                      } rounded`}
                    >
                      <span className="text-accent-light font-medium w-16 shrink-0">
                        {h.ticker}
                      </span>
                      <span className="text-loss font-mono font-medium text-right shrink-0">
                        {fmtPct(h.qoqChangePct)}
                      </span>
                    </div>
                  )),
                ]}
              </ExpandableList>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
