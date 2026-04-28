import Link from "next/link";
import { getPortfolioTimeline } from "@/lib/portfolio-data";
import PortfolioStackedChart from "@/components/PortfolioStackedChart";
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
      ? "NPS Top 30 포트폴리오 비중 추이"
      : "NPS Top 30 Portfolio Weight Timeline",
    description: isKo
      ? "국민연금 상위 30 보유 종목의 상대 포트 비중 월별 추이 (2020~2026)"
      : "NPS top 30 KR holdings — monthly relative portfolio weights (2020~2026)",
    robots: { index: false, follow: false },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = getPortfolioTimeline();
  const dict = await getDictionary(lang as Locale);
  const ko = lang === "ko";

  if (!data || data.months.length === 0) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <p className="text-slate-400">
          {ko ? "포트폴리오 데이터가 아직 없습니다." : "No portfolio data yet."}
        </p>
      </main>
    );
  }

  const latest = data.months[data.months.length - 1];
  const latestRanked = Object.entries(latest.weights)
    .sort((a, b) => b[1] - a[1])
    .map(([code, pct]) => ({
      code,
      pct,
      company: data.companies.find((c) => c.code === code),
    }));

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <Link href={`/${lang}`} className="text-slate-500 text-xs hover:text-white">
        &larr; {ko ? "홈" : "Home"}
      </Link>

      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-bold text-white">
          {ko
            ? "NPS Top 30 포트폴리오 비중 추이"
            : "NPS Top 30 Portfolio Weight Timeline"}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {ko
            ? `공시 기준 상위 30 보유 종목(현재 지분율 기준)의 월별 상대 비중 · ${data.period.start} ~ ${data.period.end}`
            : `Top 30 NPS holdings (by current stake %) — monthly relative weights · ${data.period.start} ~ ${data.period.end}`}
        </p>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 mb-5 text-[11px] text-yellow-200/80">
        ⚠️{" "}
        {ko
          ? "'상대 비중'은 Top 30 합계 내에서의 점유율. NPS 전체 한국주식 포트폴리오(500조+)의 절대 비중 아님. 5% 미만 소액 보유는 DART 공시 의무가 없어 데이터에 없음."
          : "'Relative weight' = share within Top 30 total, not absolute weight in NPS's full KR equity portfolio (500T+ KRW). Positions under 5% aren't disclosed to DART and are not tracked."}
      </div>

      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4 mb-5">
        <PortfolioStackedChart
          companies={data.companies}
          months={data.months}
          lang={lang}
        />
      </div>

      {/* Latest month snapshot */}
      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4">
        <div className="text-slate-400 text-xs mb-3 font-medium">
          {ko ? `최근 스냅샷 (${latest.date})` : `Latest snapshot (${latest.date})`}
          <span className="text-slate-600 ml-2">
            {ko ? "· 회사명 클릭 시 상세로" : "· click a name for detail"}
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-navy-lighter">
              <th className="text-left py-2 pr-2 font-medium w-8">#</th>
              <th className="text-left py-2 pr-2 font-medium">
                {ko ? "회사" : "Company"}
              </th>
              <th className="text-left py-2 pr-2 font-medium">
                {ko ? "섹터" : "Sector"}
              </th>
              <th className="text-right py-2 pr-2 font-medium">
                {ko ? "지분율" : "Stake"}
              </th>
              <th className="text-right py-2 pr-2 font-medium">
                {ko ? "상대비중" : "Rel. weight"}
              </th>
            </tr>
          </thead>
          <tbody>
            {latestRanked.map((row, i) => (
              <tr
                key={row.code}
                className="border-b border-navy-lighter/50 hover:bg-navy-lighter/40"
              >
                <td className="py-1.5 pr-2 text-slate-500 font-mono">{i + 1}</td>
                <td className="py-1.5 pr-2">
                  <Link
                    href={`/${lang}/company/${row.code}`}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    {ko
                      ? row.company?.stock_name
                      : row.company?.name_eng || row.company?.stock_name}
                  </Link>
                  <span className="text-slate-600 font-mono ml-2 text-[10px]">
                    {row.code}
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-slate-500 text-[10px]">
                  {row.company?.sector || "-"}
                </td>
                <td className="py-1.5 pr-2 text-right text-slate-300 font-mono">
                  {row.company?.latest_stake_pct.toFixed(2)}%
                </td>
                <td className="py-1.5 pr-2 text-right text-white font-mono font-medium">
                  {row.pct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? `추적 종목 총 평가액 (${latest.date}): ₩${(latest.total_value_krw / 1e12).toFixed(1)}조 · 데이터: DART OpenAPI + pykrx 과거 종가`
          : `Tracked holdings total value (${latest.date}): ₩${(latest.total_value_krw / 1e12).toFixed(1)}T · Source: DART OpenAPI + pykrx historical closes`}
      </div>
    </main>
  );
}
