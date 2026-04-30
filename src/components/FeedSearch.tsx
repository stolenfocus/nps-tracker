"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface FeedSearchItem {
  date: string;
  stock_name: string;
  name_eng: string;
  stock_code: string;
  change_type: string;
  stake_pct: string;
  stake_change: string;
}

interface FeedEntry {
  date: string;
  count: number;
  summary: Record<string, number>;
  highlights: string[];
}

const typeBadge: Record<string, { label: string; color: string; order: number }> = {
  신규: { label: "NEW", color: "bg-blue-500/20 text-blue-400", order: 0 },
  증가: { label: "UP", color: "bg-emerald-500/20 text-emerald-400", order: 1 },
  감소: { label: "DOWN", color: "bg-red-500/20 text-red-400", order: 2 },
  전량처분: { label: "EXIT", color: "bg-red-700/30 text-red-300", order: 3 },
};

export default function FeedList({
  entries,
  searchItems,
  highlightsMap,
  lang,
  placeholder,
  disclosuresLabel,
}: {
  entries: FeedEntry[];
  searchItems: FeedSearchItem[];
  highlightsMap: Record<string, string[]>;
  lang: string;
  placeholder: string;
  disclosuresLabel: string;
}) {
  const [query, setQuery] = useState("");
  const isKo = lang === "ko";

  const { filteredEntries, matchedItems, stockGroups } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        filteredEntries: entries.filter((e) => e.count > 0),
        matchedItems: [],
        stockGroups: [],
      };
    }

    const matched = searchItems.filter(
      (item) =>
        item.stock_name.toLowerCase().includes(q) ||
        item.name_eng.toLowerCase().includes(q) ||
        item.stock_code.includes(q)
    );

    const matchingDates = new Set(matched.map((item) => item.date));

    // Group matched items by stock for summary card
    const grouped: Record<string, { name: string; name_eng: string; code: string; entries: FeedSearchItem[] }> = {};
    for (const m of matched) {
      const key = m.stock_code;
      if (!grouped[key]) {
        grouped[key] = { name: m.stock_name, name_eng: m.name_eng, code: m.stock_code, entries: [] };
      }
      grouped[key].entries.push(m);
    }

    return {
      filteredEntries: entries.filter((e) => matchingDates.has(e.date)),
      matchedItems: matched,
      stockGroups: Object.values(grouped),
    };
  }, [query, entries, searchItems]);

  return (
    <>
      <div className="mb-4 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-navy-light border border-navy-lighter rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
        />
        {query.trim() && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {filteredEntries.length}{isKo ? "일" : "d"} · {matchedItems.length}{isKo ? "건" : " hits"}
            </span>
            <button
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Stock summary cards when searching */}
      {query.trim() && stockGroups.length > 0 && (
        <div className="mb-4 space-y-2">
          {stockGroups.map((group) => (
            <div key={group.code} className="bg-navy-light border border-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-white font-semibold text-sm">
                  {isKo ? group.name : (group.name_eng || group.name)}
                </span>
                <span className="text-slate-500 text-xs font-mono">{group.code}</span>
                {!isKo && group.name && (
                  <span className="text-slate-600 text-xs">{group.name}</span>
                )}
              </div>
              <div className="space-y-1">
                {group.entries.map((entry, i) => {
                  const badge = typeBadge[entry.change_type] || {
                    label: entry.change_type,
                    color: "bg-gray-500/20 text-gray-400",
                    order: 99,
                  };
                  return (
                    <Link
                      key={i}
                      href={`/${lang}/feed/${entry.date}`}
                      className="flex items-center gap-3 text-xs hover:bg-navy-lighter/50 rounded px-2 py-1.5 transition-colors"
                    >
                      <span className="text-slate-400 font-mono w-[85px] shrink-0">{entry.date}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-slate-300">{entry.stake_pct}%</span>
                      <span className={`font-mono ${parseFloat(entry.stake_change || "0") >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {parseFloat(entry.stake_change || "0") > 0 ? "+" : ""}{entry.stake_change}%p
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date list */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <Link
            key={entry.date}
            href={`/${lang}/feed/${entry.date}`}
            className="block bg-navy-light border border-navy-lighter rounded-lg p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold text-sm">
                  {entry.date}
                </span>
                <span className="ml-3 text-slate-400 text-xs">
                  {entry.count} {disclosuresLabel}
                </span>
              </div>
              <div className="flex gap-2">
                {Object.entries(entry.summary)
                  .sort(([a], [b]) => (typeBadge[a]?.order ?? 99) - (typeBadge[b]?.order ?? 99))
                  .map(([type, count]) => {
                    const badge = typeBadge[type] || {
                      label: type,
                      color: "bg-gray-500/20 text-gray-400",
                      order: 99,
                    };
                    return (
                      <span
                        key={type}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}
                      >
                        {badge.label} {count}
                      </span>
                    );
                  })}
              </div>
            </div>
            {(highlightsMap[entry.date] || []).length > 0 && (
              <div className="mt-1.5 text-xs text-slate-500">
                {(highlightsMap[entry.date] || []).join(", ")}
              </div>
            )}
          </Link>
        ))}
        {query.trim() && filteredEntries.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            {isKo ? "검색 결과 없음" : "No results found"}
          </div>
        )}
      </div>
    </>
  );
}
