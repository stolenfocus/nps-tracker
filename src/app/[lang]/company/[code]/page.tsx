import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyIndex, getAllCompanyCodes } from "@/lib/company-data";
import StakeTimelineChart from "@/components/StakeTimelineChart";
import CompanyFilingsTable from "@/components/CompanyFilingsTable";
import { getDictionary, type Locale } from "../../dictionaries";

export function generateStaticParams() {
  return getAllCompanyCodes().map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}) {
  const { lang, code } = await params;
  const c = getCompany(code);
  if (!c) return { title: "Company" };
  const isKo = lang === "ko";
  const displayName = isKo ? c.stock_name : (c.name_eng || c.stock_name);
  const title = isKo
    ? `${displayName} (${code}) — NPS 지분율 이력`
    : `${displayName} (${code}) — NPS Stake History`;
  const desc = isKo
    ? `국민연금의 ${displayName} 지분 변동 이력. 현재 ${c.latest_stake_pct?.toFixed(2) ?? "?"}%, 총 ${c.filing_count}건 공시.`
    : `NPS stake history for ${displayName}. Latest ${c.latest_stake_pct?.toFixed(2) ?? "?"}%, ${c.filing_count} filings total.`;
  return {
    title,
    description: desc,
    robots: { index: false, follow: false },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}) {
  const { lang, code } = await params;
  const c = getCompany(code);
  if (!c) notFound();

  const dict = await getDictionary(lang as Locale);
  const ko = lang === "ko";

  // Precompute summary stats
  const ups = c.filings.filter((f) => f.stake_change !== null && f.stake_change > 0).length;
  const downs = c.filings.filter((f) => f.stake_change !== null && f.stake_change < 0).length;
  const reentries = c.filings.filter((f) => f.change_type === "재진입").length;
  const netAll = c.filings.reduce((s, f) => s + (f.net_amount || 0), 0);

  // Check if stake has touched 10% (up or down) more than once — soft cap signal
  const crosses10 = c.filings.reduce((acc, f, i, arr) => {
    if (i === 0) return 0;
    const prev = arr[i - 1].stake_pct;
    const cur = f.stake_pct;
    if (prev === null || cur === null) return acc;
    if ((prev < 10 && cur >= 10) || (prev >= 10 && cur < 10)) return acc + 1;
    return acc;
  }, 0);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <Link href={`/${lang}/feed`} className="text-slate-500 text-xs hover:text-white">
        &larr; {dict.feed.back}
      </Link>

      <div className="mt-3 mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">
            {ko ? c.stock_name : (c.name_eng || c.stock_name)}
          </h1>
          <span className="text-slate-500 font-mono text-sm">{code}</span>
          {c.sector && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-navy-lighter text-slate-400">
              {c.sector}
            </span>
          )}
        </div>
        {ko
          ? c.name_eng && (
              <div className="text-slate-500 text-xs mt-1">{c.name_eng}</div>
            )
          : c.stock_name && (
              <div className="text-slate-500 text-xs mt-1">{c.stock_name}</div>
            )}
        <div className="mt-3 flex gap-6 flex-wrap text-sm">
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wide">
              {ko ? "현재 지분율" : "Current Stake"}
            </div>
            <div className="text-white text-xl font-bold">
              {c.latest_stake_pct !== null ? `${c.latest_stake_pct.toFixed(2)}%` : "-"}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wide">
              {ko ? "총 공시" : "Total Filings"}
            </div>
            <div className="text-white text-xl font-bold">{c.filing_count}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wide">
              {ko ? "증가/감소" : "Up/Down"}
            </div>
            <div className="text-white text-xl font-bold">
              <span className="text-emerald-400">{ups}</span>
              <span className="text-slate-500 text-sm">/</span>
              <span className="text-red-400">{downs}</span>
            </div>
          </div>
          {reentries > 0 && (
            <div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wide">
                {ko ? "재진입" : "Re-entries"}
              </div>
              <div className="text-yellow-400 text-xl font-bold">{reentries}</div>
            </div>
          )}
          {crosses10 >= 2 && (
            <div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wide">
                {ko ? "10% 경계 교차" : "10% Crosses"}
              </div>
              <div className="text-orange-400 text-xl font-bold">{crosses10}</div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4 mb-5">
        <div className="text-slate-400 text-xs mb-2 font-medium">
          {ko ? "지분율 타임라인" : "Stake Timeline"}
        </div>
        <StakeTimelineChart filings={c.filings} lang={lang} />
      </div>

      {/* 10% threshold pattern note */}
      {crosses10 >= 2 && (
        <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-3 mb-5 text-xs text-slate-300">
          <div className="font-medium mb-1 text-slate-200">
            {ko ? "10% 경계 부근 움직임" : "Activity near 10% threshold"}
          </div>
          <div className="text-slate-400">
            {ko
              ? `10% 경계를 ${crosses10}회 오갔음. 10% 보고 규정 특성상 경계 이탈·재진입마다 별도 공시가 찍히므로, 실제 변동폭보다 활발해 보이는 착시가 생길 수 있음.`
              : `The stake crossed 10% ${crosses10} times. Since the 10% disclosure rule requires separate filings for each exit and re-entry, the visual activity can look more dramatic than the underlying position change.`}
          </div>
        </div>
      )}

      {/* Filings table */}
      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4">
        <div className="text-slate-400 text-xs mb-3 font-medium">
          {ko ? "공시 이력" : "Filing History"} ({c.filing_count})
          <span className="text-slate-600 ml-2">
            {ko ? "· 행 클릭 시 상세 매매 펼침" : "· click row to expand trades"}
          </span>
        </div>
        <CompanyFilingsTable filings={c.filings} lang={lang} />
      </div>

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? `데이터: DART OpenAPI · 기간 ${formatKo(c.first_seen)} ~ ${formatKo(c.last_seen)} · 순매수 합계 ${netAll >= 0 ? "+" : ""}${(netAll / 1e8).toFixed(1)}억`
          : `Source: DART OpenAPI · ${formatKo(c.first_seen)} ~ ${formatKo(c.last_seen)} · Net flow ${netAll >= 0 ? "+" : ""}${(netAll / 1e8).toFixed(1)}B KRW`}
      </div>
    </main>
  );
}

function formatKo(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd || "";
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
