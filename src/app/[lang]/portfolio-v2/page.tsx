import Link from "next/link";
import { getGlobalData, type GlobalHolding } from "@/lib/data";
import TopHoldingsLineChart from "@/components/TopHoldingsLineChart";
import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isKo = lang === "ko";
  return {
    title: isKo
      ? "NPS Top 20 포트폴리오 비중 추이 (연별)"
      : "NPS Top 20 Portfolio Weight Trend (Annual)",
    description: isKo
      ? "국민연금 글로벌 Top 20 보유 종목의 2017~2025 연별 포트 비중"
      : "NPS global top 20 holdings — annual portfolio weights 2017~2025",
    robots: { index: false, follow: false },
  };
}

type CompanyRow = {
  rank: number;
  name: string;
  name_kr?: string;
  ticker: string;
  country: "KR" | "US";
  sector: string;
  latest_pct: number;
  latest_value_usd: number;
};

/**
 * Pick top 20 cross-border by latest year value. Dedupe by (ticker, country)
 * since some ADRs appear twice.
 */
function pickTopN(data: ReturnType<typeof getGlobalData>, year: string, n: number) {
  const holdings = data.years[year].holdings;
  // Dedupe by (ticker, country), summing values if duplicates
  const map = new Map<string, GlobalHolding>();
  for (const h of holdings) {
    const key = `${h.country}:${h.ticker}`;
    const existing = map.get(key);
    if (existing) {
      existing.value_usd += h.value_usd;
      existing.pct_of_total += h.pct_of_total;
    } else {
      map.set(key, { ...h });
    }
  }
  const sorted = Array.from(map.values()).sort(
    (a, b) => b.value_usd - a.value_usd
  );
  return sorted.slice(0, n);
}

export default async function PortfolioV2Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = getGlobalData();
  const years = Object.keys(data.years).sort();
  const latest = years[years.length - 1];
  const topN = pickTopN(data, latest, 20);
  const dict = await getDictionary(lang as Locale);
  const ko = lang === "ko";

  // Build per-year points for top 20 tickers (time-series for line chart)
  const topKeys = topN.map((h) => `${h.country}:${h.ticker}`);

  const yearPoints = years.map((y) => {
    const row: Record<string, number | string> = { year: y };
    const holdings = data.years[y].holdings;
    const map = new Map<string, number>();
    for (const h of holdings) {
      const key = `${h.country}:${h.ticker}`;
      map.set(key, (map.get(key) || 0) + h.pct_of_total);
    }
    for (const key of topKeys) {
      const ticker = key.split(":")[1];
      row[ticker] = map.get(key) || 0;
    }
    return row;
  });

  const companies = topN.map((h, i) => ({
    rank: i + 1,
    name: h.name,
    name_kr: h.name_kr,
    ticker: h.ticker,
    country: h.country,
    sector: h.sector,
  }));

  // Table rows for latest year
  const tableRows: CompanyRow[] = topN.map((h, i) => {
    const yoyKey = years[years.length - 2];
    const prevHoldings = data.years[yoyKey]?.holdings || [];
    const prevMap = new Map<string, number>();
    for (const p of prevHoldings) {
      const key = `${p.country}:${p.ticker}`;
      prevMap.set(key, (prevMap.get(key) || 0) + p.value_usd);
    }
    const prevValue = prevMap.get(`${h.country}:${h.ticker}`) || 0;
    const yoy = prevValue > 0 ? ((h.value_usd - prevValue) / prevValue) * 100 : null;
    return {
      rank: i + 1,
      name: h.name,
      name_kr: h.name_kr,
      ticker: h.ticker,
      country: h.country,
      sector: h.sector,
      latest_pct: h.pct_of_total,
      latest_value_usd: h.value_usd,
      yoy,
    } as CompanyRow & { yoy: number | null };
  });

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <Link href={`/${lang}`} className="text-slate-500 text-xs hover:text-white">
        &larr; {ko ? "홈" : "Home"}
      </Link>

      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-bold text-white">
          {ko
            ? "NPS Top 20 포트폴리오 비중 추이"
            : "NPS Top 20 Portfolio Weight Trend"}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {ko
            ? `글로벌 (KR+US) Top 20 보유 종목 · ${years[0]}~${years[years.length - 1]} 연별 · 데이터 소스: DART + SEC 13F`
            : `Global (KR+US) top 20 holdings · ${years[0]}~${years[years.length - 1]} annual · source: DART + SEC 13F`}
        </p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mb-5 text-[11px] text-blue-200/80">
        ℹ️{" "}
        {ko
          ? "이 페이지는 PREVIEW. 연별 스냅샷(2017~2025) 9개 데이터 포인트 기반. Top 20은 최근년(2025) 평가액 기준. y축은 NPS 글로벌 전체 포트에서 해당 종목이 차지하는 실제 비중(%), 합계 100%가 아님."
          : "PREVIEW page. Annual snapshots (2017~2025) — 9 data points. Top 20 selected by 2025 value. Y-axis = share of NPS global portfolio (not normalized to 100%)."}
      </div>

      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4 mb-5">
        <div className="text-slate-400 text-xs mb-2 font-medium">
          {ko ? "Top 10 종목 연별 포트 비중 (%)" : "Top 10 Holdings — Annual Weight (%)"}
        </div>
        <TopHoldingsLineChart
          companies={companies}
          data={yearPoints}
          lang={lang}
          topN={10}
        />
      </div>

      {/* Latest year ranking table */}
      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4">
        <div className="text-slate-400 text-xs mb-3 font-medium">
          {ko ? `최신 순위 (${latest})` : `Latest Ranking (${latest})`}
          <span className="text-slate-600 ml-2">
            {ko ? "· Top 20 전체 + YoY 변화" : "· full top 20 with YoY change"}
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-navy-lighter">
              <th className="text-left py-2 pr-2 font-medium w-8">#</th>
              <th className="text-left py-2 pr-2 font-medium">
                {ko ? "회사" : "Company"}
              </th>
              <th className="text-left py-2 pr-2 font-medium w-12"></th>
              <th className="text-left py-2 pr-2 font-medium">
                {ko ? "섹터" : "Sector"}
              </th>
              <th className="text-right py-2 pr-2 font-medium">
                {ko ? "평가액(USD)" : "Value (USD)"}
              </th>
              <th className="text-right py-2 pr-2 font-medium">
                {ko ? "포트 비중" : "Portfolio %"}
              </th>
              <th className="text-right py-2 pr-2 font-medium">YoY</th>
            </tr>
          </thead>
          <tbody>
            {(tableRows as (CompanyRow & { yoy: number | null })[]).map((row) => (
              <tr
                key={`${row.country}:${row.ticker}`}
                className="border-b border-navy-lighter/50 hover:bg-navy-lighter/40"
              >
                <td className="py-1.5 pr-2 text-slate-500 font-mono">{row.rank}</td>
                <td className="py-1.5 pr-2 text-slate-200 truncate max-w-[240px]">
                  {ko && row.name_kr ? row.name_kr : row.name}
                  <span className="text-slate-600 font-mono ml-2 text-[10px]">
                    {row.ticker}
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-[11px]">
                  {row.country === "KR" ? "🇰🇷" : "🇺🇸"}
                </td>
                <td className="py-1.5 pr-2 text-slate-500 text-[10px]">
                  {row.sector || "-"}
                </td>
                <td className="py-1.5 pr-2 text-right text-slate-300 font-mono">
                  ${(row.latest_value_usd / 1e9).toFixed(2)}B
                </td>
                <td className="py-1.5 pr-2 text-right text-white font-mono font-medium">
                  {row.latest_pct.toFixed(2)}%
                </td>
                <td
                  className={`py-1.5 pr-2 text-right font-mono ${
                    row.yoy === null
                      ? "text-slate-600"
                      : row.yoy >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {row.yoy === null
                    ? "—"
                    : `${row.yoy >= 0 ? "+" : ""}${row.yoy.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? `데이터: NPS 연간 공시(KR) + SEC 13F 분기(US, 연말 기준) · 총 ${data.years[latest].total_usd ? `$${(data.years[latest].total_usd / 1e9).toFixed(0)}B` : ""} (${latest})`
          : `Data: NPS annual (KR) + SEC 13F quarterly (US, year-end) · Total ${data.years[latest].total_usd ? `$${(data.years[latest].total_usd / 1e9).toFixed(0)}B` : ""} (${latest})`}
      </div>
    </main>
  );
}
