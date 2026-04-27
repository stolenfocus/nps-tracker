import AdSlot from "@/components/AdSlot";
import { getLatestQuarter, getTotalValue, getQuarterKeys, fmtValue } from "@/lib/data";
import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.about.title,
    description: dict.about.npsDesc1,
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "About Korea's National Pension Service (NPS)",
  description:
    "Overview of NPS, the world's 3rd largest pension fund, and how we track their US stock holdings.",
  author: { "@type": "Organization", name: "NPS Tracker" },
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isKo = lang === "ko";
  const usTotal = getTotalValue();
  const usTotalFmt = fmtValue(usTotal);
  const quarterKeys = getQuarterKeys();
  const firstYear = quarterKeys[0]?.slice(0, 4) || "2014";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-8">
          {dict.about.title}
        </h1>

        {/* What is NPS */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              1
            </span>
            {dict.about.whatIsNps}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>{dict.about.npsDesc1}</p>
            <p>{dict.about.npsDesc2}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: dict.about.founded, value: "1988" },
                { label: dict.about.totalAum, value: "$1T+" },
                { label: dict.about.usEquities, value: usTotalFmt },
                { label: dict.about.globalRank, value: "#3" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-navy border border-navy-lighter rounded-lg p-3 text-center"
                >
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
            <p>{dict.about.npsDesc3}</p>
          </div>
        </section>

        <AdSlot label="Advertisement" />

        {/* 13F Filings */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              2
            </span>
            {dict.about.what13f}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>{dict.about.f13Desc}</p>
            <ul className="space-y-2 ml-4">
              {(dict.about.f13Points as string[])?.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-light">&#8226;</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Data Sources & Methodology */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              3
            </span>
            {dict.about.dataSources}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="text-white font-semibold mb-2">{dict.about.usHoldings}</h3>
              <p>{dict.about.usHoldingsDesc}</p>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">{dict.about.coverageGap}</h3>
              <p className="mb-3">{dict.about.coverageGapDesc}</p>
              <p className="text-slate-400 text-xs mb-2">{dict.about.coverageGapReasons}</p>
              <ul className="space-y-1 ml-4 mb-3">
                {(dict.about.coverageGapPoints as string[])?.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-yellow-500">&#8226;</span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 italic">{dict.about.coverageGapNote}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{dict.about.krHoldings}</h3>
              <p>{dict.about.krHoldingsDesc}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{isKo ? "환율" : "Exchange Rate"}</h3>
              <p>{dict.about.fxDesc}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{isKo ? "통합 포트폴리오" : "Combined Portfolio"}</h3>
              <p>{dict.about.portfolioDesc}</p>
            </div>
          </div>
        </section>

        <AdSlot label="Advertisement" />

        {/* Why Track NPS */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              4
            </span>
            {dict.about.whyTrack}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>{dict.about.whyDesc}</p>
            <ul className="space-y-2 ml-4">
              {[dict.about.whyLongTerm, dict.about.whyResearch, dict.about.whyImpact, dict.about.whyAngle].map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-light">&#8226;</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Limitations & Disclaimer */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              5
            </span>
            {dict.about.limitations}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
            <ul className="space-y-2 ml-4">
              {(dict.about.limPoints as string[])?.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-light">&#8226;</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-slate-500 border-t border-navy-lighter pt-4 mt-4">
              {dict.about.limDesc}
            </p>
          </div>
        </section>

        {/* About This Site */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              6
            </span>
            {isKo ? "이 사이트에 대하여" : "About This Site"}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              {isKo
                ? "NPS Tracker는 SEC 13F 및 DART 공시를 통해 법적으로 공개된 국민연금의 글로벌 투자 데이터를 수집·시각화하는 오픈소스 프로젝트입니다. 자체 데이터를 생성하거나 투자 조언을 제공하지 않으며, 공공 데이터의 투명한 접근을 목적으로 합니다."
                : "NPS Tracker is an open-source project that collects and visualizes Korea's National Pension Service global investment data from legally mandated public disclosures (SEC 13F and DART filings). We do not generate proprietary data or provide investment advice — our goal is transparent access to public information."}
            </p>
            <p>
              {isKo
                ? "데이터는 매일 자동으로 업데이트되며, 모든 소스 코드는 GitHub에서 확인할 수 있습니다."
                : "Data is automatically updated daily, and all source code is available on GitHub."}
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-lg text-accent-light text-sm font-bold">
              7
            </span>
            {isKo ? "문의" : "Contact"}
          </h2>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-6 sm:p-8 text-sm text-slate-300 leading-relaxed">
            <p>
              {isKo
                ? "버그 리포트, 데이터 관련 문의, 제안 사항은 GitHub Issues를 통해 연락해 주세요:"
                : "For bug reports, data inquiries, or suggestions, please reach out via GitHub Issues:"}
            </p>
            <p className="mt-3">
              <a
                href="https://github.com/stolenfocus/nps-tracker/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light hover:underline"
              >
                github.com/stolenfocus/nps-tracker/issues
              </a>
            </p>
          </div>
        </section>

        {/* Data Sources Links */}
        <div className="bg-navy-lighter/50 border border-navy-lighter rounded-xl p-6 text-center space-y-2">
          <p className="text-sm text-slate-400">
            {isKo ? "데이터 출처:" : "Data sources:"}{" "}
            <a
              href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001608046&type=13F&dateb=&owner=include&count=40"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              SEC EDGAR (13F)
            </a>
            {" | "}
            <a
              href="https://www.data.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              data.go.kr
            </a>
            {" | "}
            <a
              href="https://fund.nps.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              fund.nps.or.kr
            </a>
            {" | "}
            <span className="text-slate-500">yfinance (KRW=X)</span>
          </p>
        </div>
      </div>
    </>
  );
}
