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
    alternates: {
      canonical: `/${lang}/company/${code}/`,
      languages: {
        ko: `/ko/company/${code}/`,
        en: `/en/company/${code}/`,
      },
    },
    openGraph: {
      title,
      description: desc,
      type: "article",
    },
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
  const displayName = ko ? c.stock_name : (c.name_eng || c.stock_name);
  const stakePct = c.latest_stake_pct?.toFixed(2) ?? "-";
  const filingCount = c.filings.length;
  const firstFilingDate = c.filings[0]
    ? formatDate(c.filings[0].feed_date)
    : null;
  const latestFilingDate = latestFiling ? formatDate(latestFiling.feed_date) : null;

  // FAQ for AEO (LLM citation)
  const faq = ko
    ? [
        {
          q: `국민연금은 ${displayName}을(를) 얼마나 보유하고 있나요?`,
          a: `국민연금공단은 ${displayName} (종목코드 ${code})의 지분 ${stakePct}%를 보유하고 있습니다. 가장 최근 공시는 ${latestFilingDate ?? "확인되지 않음"}입니다.`,
        },
        {
          q: `${displayName} NPS 지분 변동을 어떻게 확인하나요?`,
          a: `${displayName}의 NPS 지분 변동은 DART (전자공시시스템)에 등록되는 5% 이상 대량보유 신고와 임원·주요주주 특정증권등 소유상황 보고를 통해 확인할 수 있습니다. 현재 총 ${filingCount}건의 관련 공시가 기록되어 있으며, 첫 공시일은 ${firstFilingDate ?? "확인되지 않음"}입니다.`,
        },
        {
          q: `${displayName}의 섹터는 무엇인가요?`,
          a: c.sector
            ? `${displayName}의 업종은 ${c.sector}입니다.`
            : `${displayName}의 업종 정보는 현재 확인되지 않습니다.`,
        },
      ]
    : [
        {
          q: `How much of ${displayName} does the National Pension Service (NPS) own?`,
          a: `The National Pension Service holds ${stakePct}% of ${displayName} (ticker ${code}). The most recent filing date is ${latestFilingDate ?? "not available"}.`,
        },
        {
          q: `How can I track NPS stake changes in ${displayName}?`,
          a: `NPS stake changes in ${displayName} are disclosed through Korea's DART system via 5%+ large shareholding reports and executive/major-shareholder securities ownership reports. There are currently ${filingCount} filings on record, with the earliest dated ${firstFilingDate ?? "unknown"}.`,
        },
        {
          q: `What sector does ${displayName} belong to?`,
          a: c.sector
            ? `${displayName} belongs to the ${c.sector} sector.`
            : `Sector information for ${displayName} is currently unavailable.`,
        },
      ];

  // JSON-LD structured data for LLM/SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Corporation",
        "@id": `https://stolenfocus.github.io/nps-tracker/${lang}/company/${code}/#corp`,
        name: displayName,
        identifier: code,
        ...(c.name_eng && c.stock_name !== c.name_eng && {
          alternateName: ko ? c.name_eng : c.stock_name,
        }),
        ...(c.sector && { industry: c.sector }),
        ...(c.homepage && { url: c.homepage }),
        ...(c.ceo && {
          founder: { "@type": "Person", name: c.ceo },
        }),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ko ? "홈" : "Home", item: `https://stolenfocus.github.io/nps-tracker/${lang}/` },
          { "@type": "ListItem", position: 2, name: ko ? "피드" : "Feed", item: `https://stolenfocus.github.io/nps-tracker/${lang}/feed/` },
          { "@type": "ListItem", position: 3, name: displayName },
        ],
      },
    ],
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${lang}/feed`} className="text-slate-500 text-xs hover:text-white">
        &larr; {dict.feed.back}
      </Link>

      <div className="mt-3 mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">
            {displayName}
          </h1>
          <span className="text-slate-500 font-mono text-sm">{code}</span>
          {c.sector && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-navy-lighter text-slate-400">
              {c.sector}
            </span>
          )}
        </div>

        {/* TL;DR summary for AEO/LLM citation */}
        <div className="mt-3 bg-navy-lighter/40 border-l-2 border-sky-500 px-3 py-2 text-sm text-slate-200">
          {ko ? (
            <>
              <span className="font-semibold">요약:</span> 국민연금공단(NPS)은{" "}
              <strong>{displayName}</strong> (종목코드 {code})의 지분{" "}
              <strong>{stakePct}%</strong>를 보유 중입니다.
              {latestFilingDate && ` 최근 공시일은 ${latestFilingDate}이며, 총 ${filingCount}건의 DART 공시 기록이 있습니다.`}
            </>
          ) : (
            <>
              <span className="font-semibold">Summary:</span> The National Pension
              Service (NPS) holds <strong>{stakePct}%</strong> of{" "}
              <strong>{displayName}</strong> (ticker {code}).
              {latestFilingDate && ` Most recent filing: ${latestFilingDate}. Total ${filingCount} DART filings on record.`}
            </>
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

      {/* FAQ section for AEO/LLM citation */}
      <div className="mt-6 bg-navy-light border border-navy-lighter rounded-lg p-4">
        <h2 className="text-slate-300 text-sm font-semibold mb-3">
          {ko ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
        </h2>
        <dl className="space-y-3 text-sm">
          {faq.map((item, i) => (
            <div key={i}>
              <dt className="text-slate-200 font-medium">{item.q}</dt>
              <dd className="text-slate-400 mt-1 text-[13px] leading-relaxed">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 text-[10px] text-slate-600">
        {ko
          ? `데이터: DART OpenAPI · ${latestFilingDate ?? "-"}`
          : `Source: DART OpenAPI · ${latestFilingDate ?? "-"}`}
      </div>
    </main>
  );
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length < 8) return yyyymmdd || "";
  if (yyyymmdd.includes("-")) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
