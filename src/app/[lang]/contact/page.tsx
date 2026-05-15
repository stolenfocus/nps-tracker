import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "ko" ? "문의하기 | NPS Tracker" : "Contact | NPS Tracker",
    description:
      lang === "ko"
        ? "NPS Tracker 운영자에게 문의하기 — GitHub Issues 또는 이메일."
        : "Contact NPS Tracker — reach us via GitHub Issues or email.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  await getDictionary(lang as Locale);
  const isKo = lang === "ko";

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">
        {isKo ? "문의하기" : "Contact"}
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        {isKo
          ? "버그 신고, 기능 제안, 데이터 오류, 일반 문의 환영"
          : "Bug reports, feature requests, data corrections, and general inquiries welcome."}
      </p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="bg-navy-light border border-navy-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            {isKo ? "🐛 GitHub Issues (권장)" : "🐛 GitHub Issues (preferred)"}
          </h2>
          <p className="mb-3">
            {isKo
              ? "버그, 기능 제안, 데이터 정정 등은 GitHub Issues로 부탁드립니다. 공개적으로 추적되어 다른 사용자도 참고할 수 있습니다."
              : "Bug reports, feature requests, and data corrections are best filed on GitHub Issues. Public tracking helps other users."}
          </p>
          <a
            href="https://github.com/stolenfocus/nps-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent/20 hover:bg-accent/30 border border-accent-light/30 text-accent-light px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            github.com/stolenfocus/nps-tracker/issues →
          </a>
        </section>

        <section className="bg-navy-light border border-navy-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            {isKo ? "💬 비공개 문의" : "💬 Private Inquiries"}
          </h2>
          <p className="mb-3">
            {isKo
              ? "공개적으로 논의하기 어려운 사안은 GitHub에서 직접 메시지를 보내거나, GitHub Issue를 비공개 모드로 등록하실 수 있습니다."
              : "For inquiries that cannot be discussed publicly, you can reach out via GitHub messaging or open a private Issue."}
          </p>
          <a
            href="https://github.com/stolenfocus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent/20 hover:bg-accent/30 border border-accent-light/30 text-accent-light px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            github.com/stolenfocus →
          </a>
        </section>

        <section className="bg-navy-light border border-navy-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            {isKo ? "ℹ️ 자주 묻는 질문" : "ℹ️ Common Questions"}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-white mb-1">
                {isKo
                  ? "Q. 종목 데이터가 잘못된 것 같아요"
                  : "Q. The stock data seems wrong"}
              </p>
              <p className="text-slate-400">
                {isKo
                  ? "원본 13F 공시 또는 DART 공시 링크를 함께 보내주시면 확인 후 수정합니다."
                  : "Please send the original 13F filing or DART disclosure link, and we'll verify and correct it."}
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">
                {isKo
                  ? "Q. 사이트에서 투자 추천을 받을 수 있나요?"
                  : "Q. Does the site offer investment recommendations?"}
              </p>
              <p className="text-slate-400">
                {isKo
                  ? "아니요. 본 사이트는 공공 데이터 시각화 사이트로, 투자 자문이나 매매 권유를 하지 않습니다."
                  : "No. This site visualizes public data only. It does not provide investment advice or solicitation."}
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">
                {isKo
                  ? "Q. 데이터를 다운로드할 수 있나요?"
                  : "Q. Can I download the data?"}
              </p>
              <p className="text-slate-400">
                {isKo
                  ? "원본 13F/DART는 모두 공개 데이터입니다. SEC EDGAR 또는 DART 사이트에서 직접 다운로드 가능합니다."
                  : "All 13F and DART data is publicly available. You can download directly from SEC EDGAR or DART."}
              </p>
            </div>
          </div>
        </section>

        <p className="text-xs text-slate-500 text-center pt-4">
          {isKo
            ? "답변은 영업일 기준 3-5일 정도 소요될 수 있습니다 (1인 운영)."
            : "Response times: 3–5 business days (single-person operation)."}
        </p>
      </div>
    </div>
  );
}
