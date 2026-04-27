import Link from "next/link";
import {
  getConsecutiveBuyStreaks,
  getLatestQuarterKey,
} from "@/lib/data";
import StreakTable from "@/components/StreakTable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isKo = lang === "ko";
  return {
    title: isKo
      ? "NPS 연속 매수 종목 | NPS Tracker"
      : "NPS Consecutive Buys | NPS Tracker",
    description: isKo
      ? "국민연금이 분기 연속으로 주식수를 늘리고 있는 종목 (주식분할 보정)"
      : "Stocks where NPS has been increasing shares for consecutive quarters (split-adjusted)",
    robots: { index: false, follow: false },
  };
}

export default async function StreakPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ko = lang === "ko";
  const streaks = getConsecutiveBuyStreaks();
  const latestQ = getLatestQuarterKey();

  const maxStreak = streaks.length > 0 ? streaks[0].streak : 0;

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <Link
        href={`/${lang}`}
        className="text-slate-500 text-xs hover:text-white"
      >
        &larr; {ko ? "홈" : "Home"}
      </Link>

      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-bold text-white">
          {ko ? "NPS 연속 매수 종목" : "NPS Consecutive Buys"}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {ko
            ? `${latestQ} 기준 · 주식분할/병합 보정 · 2분기 이상 연속 주수 증가 종목`
            : `As of ${latestQ} · split-adjusted · stocks with 2+ consecutive quarters of share increases`}
        </p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mb-5 text-[11px] text-blue-200/80">
        ℹ️{" "}
        {ko
          ? "PREVIEW. 13F 분기 데이터 기반. 주식분할/병합은 yfinance 이력으로 보정. 주수 1% 이상 증가를 매수로 판정."
          : "PREVIEW. Based on quarterly 13F data. Stock splits/reverse splits adjusted via yfinance. Share increase > 1% counted as a buy."}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{streaks.length}</div>
          <div className="text-[10px] text-slate-500">
            {ko ? "연속 매수 종목" : "Stocks"}
          </div>
        </div>
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {maxStreak}
          </div>
          <div className="text-[10px] text-slate-500">
            {ko ? "최장 연속 (분기)" : "Longest Streak (Q)"}
          </div>
        </div>
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {streaks.filter((s) => s.streak >= 4).length}
          </div>
          <div className="text-[10px] text-slate-500">
            {ko ? "4분기+ 연속" : "4Q+ Streaks"}
          </div>
        </div>
      </div>

      <div className="bg-navy-light border border-navy-lighter rounded-lg p-4">
        <StreakTable data={streaks} lang={lang} />
      </div>

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? "데이터: SEC 13F (분기별) · 주식분할/병합: yfinance · 주수 증가 1% 이상 = 매수 판정 · 비중 변화 = 전 분기 대비 포트 비중 증감"
          : "Data: SEC 13F (quarterly) · Splits: yfinance · Share increase > 1% = buy · Wt Chg = quarter-over-quarter portfolio weight change"}
      </div>
    </main>
  );
}
