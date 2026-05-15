import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "ko" ? "개인정보 처리방침 | NPS Tracker" : "Privacy Policy | NPS Tracker",
    description:
      lang === "ko"
        ? "NPS Tracker의 개인정보 수집 및 사용 정책"
        : "How NPS Tracker collects, uses, and protects personal information.",
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  await getDictionary(lang as Locale);
  const isKo = lang === "ko";
  const lastUpdated = "2026-05-15";

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">
        {isKo ? "개인정보 처리방침" : "Privacy Policy"}
      </h1>
      <p className="text-xs text-slate-400 mb-8">
        {isKo ? "최종 업데이트" : "Last updated"}: {lastUpdated}
      </p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        {isKo ? (
          <>
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. 개요</h2>
              <p>
                NPS Tracker (이하 "본 사이트")는 대한민국 국민연금공단(NPS)의 공개 13F 공시 및 DART 공시 데이터를 시각화하는 공공 정보 사이트입니다.
                본 사이트는 개인 식별 정보를 직접 수집하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. 수집되는 정보</h2>
              <p className="mb-2">본 사이트는 다음 정보를 자동으로 수집할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>방문 시각 및 페이지 (Google Analytics)</li>
                <li>브라우저 및 OS 정보 (집계 통계 목적)</li>
                <li>IP 주소의 일반적 지역 정보 (국가/도시 수준)</li>
                <li>리퍼러 URL (어디서 왔는지)</li>
              </ul>
              <p className="mt-2 text-slate-400">
                위 정보는 사이트 운영 분석 외 다른 용도로 사용되지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. 쿠키 및 광고</h2>
              <p>
                본 사이트는 Google AdSense 광고를 표시할 수 있으며, Google 및 서드파티 광고 파트너가
                쿠키를 사용하여 방문자에게 관련성 있는 광고를 제공할 수 있습니다.
              </p>
              <p className="mt-2">
                광고 쿠키 사용 거부는{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-light hover:underline"
                >
                  Google 광고 설정
                </a>
                에서 가능합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. 데이터 출처</h2>
              <p>본 사이트가 표시하는 모든 투자 데이터는 다음 공개 출처에서 가져옵니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>미국 증권거래위원회 (SEC) EDGAR — 13F 공시</li>
                <li>대한민국 금융감독원 DART — 대량보유보고서</li>
                <li>국민연금공단 (NPS) 공시 — fund.nps.or.kr</li>
                <li>주가 데이터: yfinance (Yahoo Finance)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. 면책 조항</h2>
              <p>
                본 사이트의 모든 정보는 교육 및 정보 제공 목적으로만 제공됩니다.
                투자 자문, 매매 권유, 자산 운용 서비스가 아닙니다.
                모든 투자 결정 및 그에 따른 손익은 사용자 본인의 책임입니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. 정책 변경</h2>
              <p>
                본 정책은 필요 시 사전 고지 없이 변경될 수 있습니다.
                변경 시 본 페이지의 "최종 업데이트" 날짜가 갱신됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. 문의</h2>
              <p>
                개인정보 처리방침 관련 문의는{" "}
                <a
                  href={`/${lang}/contact`}
                  className="text-accent-light hover:underline"
                >
                  Contact 페이지
                </a>{" "}
                또는 GitHub Issues로 부탁드립니다.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Overview</h2>
              <p>
                NPS Tracker (the "Site") is a public-data visualization website that aggregates and displays publicly
                available 13F filings and DART disclosures of Korea's National Pension Service (NPS).
                The Site does not directly collect personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
              <p className="mb-2">The Site may automatically collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Visit time and pages viewed (via Google Analytics)</li>
                <li>Browser and OS type (aggregated statistics)</li>
                <li>General location of IP address (country/city level)</li>
                <li>Referrer URL</li>
              </ul>
              <p className="mt-2 text-slate-400">
                Such data is used only for operating analytics and not for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Cookies and Advertising</h2>
              <p>
                The Site may display Google AdSense advertisements. Google and third-party ad partners may use cookies
                to serve relevant advertising to visitors.
              </p>
              <p className="mt-2">
                You can opt out of personalized ads via{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-light hover:underline"
                >
                  Google Ads Settings
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Data Sources</h2>
              <p>All investment data displayed on this site is sourced from public sources:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>U.S. Securities and Exchange Commission (SEC) EDGAR — 13F filings</li>
                <li>Korea Financial Supervisory Service DART — major shareholding disclosures</li>
                <li>National Pension Service (NPS) — fund.nps.or.kr</li>
                <li>Stock price data: yfinance (Yahoo Finance)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Disclaimer</h2>
              <p>
                All information on this site is for educational and informational purposes only.
                It does not constitute investment advice, a solicitation to trade, or asset management services.
                Users are solely responsible for any investment decisions and outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Policy Changes</h2>
              <p>
                This policy may be updated without prior notice.
                The "Last updated" date at the top of this page will reflect any changes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
              <p>
                For inquiries related to this Privacy Policy, please reach out via{" "}
                <a
                  href={`/${lang}/contact`}
                  className="text-accent-light hover:underline"
                >
                  the Contact page
                </a>{" "}
                or GitHub Issues.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
