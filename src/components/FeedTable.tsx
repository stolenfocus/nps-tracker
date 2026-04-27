"use client";

import Link from "next/link";

interface Disclosure {
  stock_name: string;
  stock_code: string;
  change_type: string;
  stake_pct: string;
  stake_change: string;
  fin_period?: string;
  name_eng?: string;
}

const changeColors: Record<string, string> = {
  "신규": "text-accent-light",
  "증가": "text-gain",
  "감소": "text-loss",
  "전량매도": "text-red-500",
  New: "text-accent-light",
  Increase: "text-gain",
  Decrease: "text-loss",
  "Full Sale": "text-red-500",
};

export default function FeedTable({
  disclosures,
  lang,
}: {
  disclosures: Disclosure[];
  lang: string;
}) {
  const isKo = lang === "ko";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-slate-500 border-b border-navy-lighter">
            <th className="text-left py-1.5 px-2 font-medium">{isKo ? "종목" : "Stock"}</th>
            <th className="text-left py-1.5 px-2 font-medium">{isKo ? "코드" : "Code"}</th>
            <th className="text-left py-1.5 px-2 font-medium">{isKo ? "변동" : "Change"}</th>
            <th className="text-right py-1.5 px-2 font-medium">{isKo ? "지분율" : "Stake"}</th>
            <th className="text-right py-1.5 px-2 font-medium">{isKo ? "변동폭" : "Change %"}</th>
          </tr>
        </thead>
        <tbody>
          {disclosures.map((d, i) => (
            <tr key={i} className="border-b border-navy-lighter/50 hover:bg-white/5">
              <td className="py-1.5 px-2">
                <Link
                  href={`/${lang}/company/${d.stock_code}`}
                  className="text-white hover:text-accent-light transition-colors"
                >
                  {isKo ? d.stock_name : d.name_eng || d.stock_name}
                </Link>
              </td>
              <td className="py-1.5 px-2 text-slate-500 font-mono">{d.stock_code}</td>
              <td className={`py-1.5 px-2 font-medium ${changeColors[d.change_type] || "text-slate-400"}`}>
                {d.change_type}
              </td>
              <td className="py-1.5 px-2 text-right text-white font-mono">{d.stake_pct}%</td>
              <td className="py-1.5 px-2 text-right text-slate-400 font-mono">{d.stake_change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
