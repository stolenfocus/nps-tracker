import { getPensionComparisonData, fmtValue } from "@/lib/data";
import { getDictionary, type Locale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.compare.title,
    description: dict.compare.description,
  };
}

const FLAG: Record<string, string> = {
  kr: "\uD83C\uDDF0\uD83C\uDDF7",
  us: "\uD83C\uDDFA\uD83C\uDDF8",
  ca: "\uD83C\uDDE8\uD83C\uDDE6",
  nl: "\uD83C\uDDF3\uD83C\uDDF1",
  no: "\uD83C\uDDF3\uD83C\uDDF4",
};

const FUND_ORDER = ["NPS", "CalPERS", "CPPIB", "ABP", "Norges Bank"];

export default async function ComparePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const data = getPensionComparisonData();
  const { funds, consensus_holdings, nps_unique_picks, top10_per_fund, overlap_stats } = data;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {dict.compare.title}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          {dict.compare.description}{" "}
          {dict.compare.allData} (period ending {data.period}).
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {dict.compare.gpifNote}
        </p>
      </div>

      {/* Fund Overview Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {FUND_ORDER.map((name) => {
            const f = funds[name];
            return (
              <div
                key={name}
                className={`rounded-lg p-3 sm:p-4 border-2 ${
                  name === "NPS" ? "bg-[#1a0a0a] border-red-800" :
                  name === "CalPERS" ? "bg-[#0a0f1a] border-blue-800" :
                  name === "CPPIB" ? "bg-[#0f0a0a] border-red-900" :
                  name === "ABP" ? "bg-[#0a0f14] border-orange-800" :
                  "bg-[#0a1014] border-sky-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{FLAG[f.flag]}</span>
                  <span className="text-sm font-bold text-white truncate">
                    {name}
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400">
                  {fmtValue(f.total_value)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {f.holdings_count.toLocaleString()} {dict.compare.holdings}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                  {f.full_name}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overlap Stats */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
          {dict.compare.overlap}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: dict.compare.heldByAll5, value: overlap_stats.held_by_all_5, color: "text-emerald-400" },
            { label: dict.compare.heldBy4, value: overlap_stats.held_by_4_plus, color: "text-blue-400" },
            { label: dict.compare.heldBy3, value: overlap_stats.held_by_3_plus, color: "text-cyan-400" },
            { label: dict.compare.heldBy2, value: overlap_stats.held_by_2_plus, color: "text-slate-300" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-navy-light border border-navy-lighter rounded-lg p-3 text-center"
            >
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          {dict.compare.outOf} {overlap_stats.total_unique.toLocaleString()} {dict.compare.uniqueStocks}.
        </p>
      </section>

      {/* Consensus Holdings */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
          {dict.compare.consensus}
        </h2>
        <p className="text-[10px] text-slate-500 mb-3">
          {dict.compare.consensusDesc} ({consensus_holdings.length} {dict.compare.holdings})
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy-lighter text-slate-500">
                <th className="text-left py-1.5 px-2 font-medium">#</th>
                <th className="text-left py-1.5 px-2 font-medium">Ticker</th>
                <th className="text-left py-1.5 px-2 font-medium">Name</th>
                <th className="text-center py-1.5 px-2 font-medium">Funds</th>
                {FUND_ORDER.map((name) => (
                  <th key={name} className="text-center py-1.5 px-2 font-medium whitespace-nowrap">
                    {FLAG[funds[name].flag]} {name === "Norges Bank" ? "Norges" : name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consensus_holdings.map((h, i) => (
                <tr
                  key={h.cusip}
                  className="border-b border-navy-lighter/50 hover:bg-white/[0.02]"
                >
                  <td className="py-1.5 px-2 text-slate-600">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold text-white">
                    {h.ticker || h.name.slice(0, 6)}
                  </td>
                  <td className="py-1.5 px-2 text-slate-400 truncate max-w-[120px]">
                    {h.name}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        h.fund_count === 5
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {h.fund_count}/5
                    </span>
                  </td>
                  {FUND_ORDER.map((fn) => {
                    const fd = h.funds[fn];
                    return (
                      <td key={fn} className="py-1.5 px-2 text-center text-slate-400">
                        {fd ? (
                          <span className="text-[10px]">
                            #{fd.rank}
                          </span>
                        ) : (
                          <span className="text-slate-700">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* NPS Unique Picks */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
          {dict.compare.uniquePicks}
        </h2>
        <p className="text-[10px] text-slate-500 mb-3">
          {dict.compare.uniqueDesc} ({nps_unique_picks.length} {dict.compare.holdings})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {nps_unique_picks.map((h) => (
            <div
              key={h.cusip}
              className="bg-navy-light border border-amber-500/20 rounded-lg p-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-semibold text-sm text-white">
                  {h.ticker || h.name.slice(0, 8)}
                </span>
                <span className="text-[10px] text-slate-500">#{h.rank}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{h.name}</div>
              <div className="text-xs text-amber-400 font-medium mt-1">
                {fmtValue(h.value)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Side-by-side Top 10 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
          {dict.compare.sideBySide}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-navy-lighter">
                <th className="py-1.5 px-1 text-slate-600 font-medium text-center w-6">#</th>
                {FUND_ORDER.map((name) => (
                  <th
                    key={name}
                    className="py-1.5 px-2 text-slate-400 font-medium text-left"
                  >
                    {FLAG[funds[name].flag]} {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => (
                <tr
                  key={i}
                  className="border-b border-navy-lighter/50 hover:bg-white/[0.02]"
                >
                  <td className="py-1.5 px-1 text-center text-slate-600">{i + 1}</td>
                  {FUND_ORDER.map((name) => {
                    const item = top10_per_fund[name]?.[i];
                    if (!item) return <td key={name} className="py-1.5 px-2 text-slate-700">-</td>;
                    return (
                      <td key={name} className="py-1.5 px-2">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-mono font-semibold text-white truncate">
                            {item.ticker}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {item.pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-600">{fmtValue(item.value)}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-navy-light border border-navy-lighter rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">{dict.compare.dataSource}</strong> SEC EDGAR 13F
        (period ending {data.period}). {dict.compare.disclaimer}
      </div>
    </div>
  );
}
