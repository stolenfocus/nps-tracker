import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyIndex, getAllCompanyCodes } from "@/lib/company-data";
import CompanyFilingsTable from "@/components/CompanyFilingsTable";
import { getDictionary, type Locale } from "../../dictionaries";

export async function generateStaticParams() {
  const langs = ["en", "ko"];
  return langs.flatMap((lang) =>
    getAllCompanyCodes().map((code) => ({ lang, code }))
  );
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
    ? `${displayName} (${code}) — NPS 지분율`
    : `${displayName} (${code}) — NPS Stake`;
  const desc = isKo
    ? `국민연금의 ${displayName} 최근 지분 변동. 현재 ${c.latest_stake_pct?.toFixed(2) ?? "?"}%.`
    : `NPS latest stake change for ${displayName}. Current ${c.latest_stake_pct?.toFixed(2) ?? "?"}%.`;
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

  const latestFiling = c.filings.length > 0 ? c.filings[c.filings.length - 1] : null;

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
              {ko ? "최근 공시" : "Latest Filing"}
            </div>
            <div className="text-white text-xl font-bold">
              {latestFiling ? formatDate(latestFiling.feed_date) : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Financials */}
      {(c.latest_per || c.latest_pbr || c.latest_roe) && (
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-4 mb-5">
          <div className="text-slate-400 text-xs mb-3 font-medium">
            {ko ? "재무 지표" : "Financials"}
            {c.fin_period && (
              <span className="text-slate-600 ml-2">
                ({c.fin_period.slice(0, 4)}.{c.fin_period.slice(4)})
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {!!c.latest_ref_price && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">
                  {ko ? "주가" : "Price"}
                </div>
                <div className="text-white font-bold">₩{c.latest_ref_price.toLocaleString()}</div>
              </div>
            )}
            {!!c.latest_per && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">PER</div>
                <div className="text-white font-bold">{c.latest_per.toFixed(1)}</div>
              </div>
            )}
            {!!c.latest_pbr && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">PBR</div>
                <div className="text-white font-bold">{c.latest_pbr.toFixed(2)}</div>
              </div>
            )}
            {!!c.latest_per && !!c.latest_ref_price && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">EPS</div>
                <div className="text-white font-bold">
                  ₩{Math.round(c.latest_ref_price / c.latest_per).toLocaleString()}
                </div>
              </div>
            )}
            {!!c.latest_roe && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">ROE</div>
                <div className="text-white font-bold">{c.latest_roe.toFixed(1)}%</div>
              </div>
            )}
            {!!c.latest_debt_ratio && (
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">
                  {ko ? "부채비율" : "Debt Ratio"}
                </div>
                <div className="text-white font-bold">{c.latest_debt_ratio.toFixed(1)}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Latest filing only */}
      {latestFiling && (
        <div className="bg-navy-light border border-navy-lighter rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-3 font-medium">
            {ko ? "최근 공시" : "Latest Filing"}
            <span className="text-slate-600 ml-2">
              {ko ? "· 행 클릭 시 상세 매매 펼침" : "· click row to expand trades"}
            </span>
          </div>
          <CompanyFilingsTable filings={[latestFiling]} lang={lang} />
        </div>
      )}

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? `데이터: DART OpenAPI · ${latestFiling ? formatDate(latestFiling.feed_date) : "-"}`
          : `Source: DART OpenAPI · ${latestFiling ? formatDate(latestFiling.feed_date) : "-"}`}
      </div>
    </main>
  );
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length < 8) return yyyymmdd || "";
  if (yyyymmdd.includes("-")) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
