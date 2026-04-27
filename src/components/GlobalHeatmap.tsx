"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { treemap, hierarchy, treemapSquarify } from "d3-hierarchy";

// ── Types ──────────────────────────────────────────────────────────

interface HoldingData {
  name: string;
  name_kr?: string;
  ticker: string;
  country: "KR" | "US";
  value_usd: number;
  pct_of_total: number;
  sector: string;
}

interface YearData {
  date: string;
  exchange_rate: number;
  kr_total_usd: number;
  us_total_usd: number;
  total_usd: number;
  kr_count: number;
  us_count: number;
  holdings: HoldingData[];
}

interface Props {
  years: Record<string, YearData>;
  defaultYear: string;
  lang?: string;
}

type FilterMode = "all" | "KR" | "US";

// ── Sector colors (finviz style) ──────────────────────────────────

// Simple two-tone: KR = one red, US = one blue. No sector color variation.
function getSectorColor(_sector: string, country: string = "US"): string {
  return country === "KR" ? "#DC2626" : "#2563EB";
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function fmtB(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

// ── Legend entries (unique sectors shown) ──────────────────────────

const LEGEND_ITEMS: { label: string; color: string }[] = [];

const COUNTRY_LEGEND = [
  { label: "🇰🇷 Korea", color: "#DC2626" },
  { label: "🇺🇸 United States", color: "#2563EB" },
];

// ── Tile interface from d3 ────────────────────────────────────────

interface TileNode {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  data: { name: string; holding: HoldingData };
}

// ── Component ─────────────────────────────────────────────────────

export default function GlobalHeatmap({ years, defaultYear, lang = "en" }: Props) {
  const isKo = lang === "ko";
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    holding: HoldingData;
    pctFiltered: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 1200, height: 500 });

  // Responsive resize
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = w < 640 ? 400 : 500;
      setDims({ width: w, height: h });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const yearData = years[selectedYear];
  const allYears = Object.keys(years).sort();

  // Filter + top 200 + aggregate rest
  const { tiles, totalFiltered } = useMemo(() => {
    const filtered = yearData.holdings
      .filter((h) => filter === "all" || h.country === filter)
      .sort((a, b) => b.value_usd - a.value_usd);

    // totalFiltered should be the ACTUAL total for the filter, not sum of shown tiles.
    // holdings array may only contain top KR stocks; metadata has the true totals.
    const totalFiltered =
      filter === "all"
        ? (yearData.kr_total_usd + yearData.us_total_usd)
        : filter === "KR"
          ? yearData.kr_total_usd
          : yearData.us_total_usd;

    // Show top 50 holdings - big enough tiles for clear labels and colors
    const displayHoldings = filtered.slice(0, 50);

    // Build d3 hierarchy
    interface TreeNode {
      name: string;
      value?: number;
      holding?: HoldingData;
      children?: TreeNode[];
    }

    const rootData: TreeNode = {
      name: "root",
      children: displayHoldings.map((h) => ({
        name: h.ticker || h.name,
        value: h.value_usd,
        holding: h,
      })),
    };

    const root = hierarchy<TreeNode>(rootData)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap<TreeNode>()
      .size([dims.width, dims.height])
      .tile(treemapSquarify.ratio(1))
      .padding(0)
      .round(true);

    treemapLayout(root);

    const leaves = root.leaves() as unknown as TileNode[];

    return { tiles: leaves, totalFiltered };
  }, [yearData, filter, dims]);

  const filterButtons: { label: string; value: FilterMode }[] = [
    { label: isKo ? "전체" : "Combined", value: "all" },
    { label: isKo ? "한국" : "Korea", value: "KR" },
    { label: isKo ? "미국" : "US", value: "US" },
  ];

  // Summary stats — use authoritative totals from data, not holdings array sum
  const krTotal = yearData.kr_total_usd;
  const usTotal = yearData.us_total_usd;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2">
          {filterButtons.map((b) => (
            <button
              key={b.value}
              onClick={() => setFilter(b.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === b.value
                  ? "bg-accent text-white"
                  : "bg-navy-light border border-navy-lighter text-slate-300 hover:bg-navy-lighter"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-navy-light border border-navy-lighter text-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y}{y === Object.keys(years).sort().pop() ? " *" : ""}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-500">
          {tiles.length} {isKo ? "종목 표시" : "holdings shown"}
        </span>
      </div>
      {selectedYear === Object.keys(years).sort().pop() && (
        <div className="text-xs text-amber-400/80 mb-4 -mt-2">
          {isKo
            ? "* 최신 연도의 한국 데이터는 연간 공시 + DART 지분 변동 기반 추정치이며, 실제와 다를 수 있습니다."
            : "* KR data for latest year is estimated from annual disclosure + DART filings. Actual values may differ."}
        </div>
      )}

      {/* Treemap */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-navy-lighter"
        style={{ height: dims.height }}
        onMouseLeave={() => {
          setHoveredIdx(null);
          setTooltip(null);
        }}
      >
        <svg
          width={dims.width}
          height={dims.height}
          style={{ display: "block" }}
        >
          {tiles.map((tile, i) => {
            const h = tile.data.holding!;
            const w = tile.x1 - tile.x0;
            const ht = tile.y1 - tile.y0;
            const color = getSectorColor(h.sector, h.country);
            const borderColor = darken(color, 40);
            const isHovered = hoveredIdx === i;

            // Font sizing based on tile area
            const area = w * ht;
            const minDim = Math.min(w, ht);
            let tickerSize = 0;
            let valueSize = 0;
            let showTicker = false;
            let showValue = false;
            let showFlag = false;

            if (minDim > 25 && area > 1000) {
              tickerSize = Math.max(7, Math.min(16, minDim * 0.2));
              showTicker = true;
            }
            if (minDim > 24 && area > 1500) {
              valueSize = Math.max(6, Math.min(13, minDim * 0.15));
              showValue = true;
            }
            if (minDim > 35 && area > 3000) {
              showFlag = true;
            }

            const flag = h.country === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8";
            const pctFiltered = totalFiltered > 0 ? (h.value_usd / totalFiltered) * 100 : 0;

            const clipId = `clip-${i}`;

            return (
              <g
                key={`${h.ticker || h.name}-${i}`}
                clipPath={`url(#${clipId})`}
                onMouseEnter={(e) => {
                  setHoveredIdx(i);
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      holding: h,
                      pctFiltered,
                    });
                  }
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      holding: h,
                      pctFiltered,
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null);
                  setTooltip(null);
                }}
                className="cursor-pointer"
              >
                <defs>
                  <clipPath id={clipId}>
                    <rect x={tile.x0} y={tile.y0} width={w} height={ht} />
                  </clipPath>
                </defs>
                <rect
                  x={tile.x0 + 1}
                  y={tile.y0 + 1}
                  width={Math.max(0, w - 2)}
                  height={Math.max(0, ht - 2)}
                  fill={color}
                  opacity={isHovered ? 1 : 0.85}
                  stroke={isHovered ? "#FFFFFF" : "#0F172A"}
                  strokeWidth={isHovered ? 3 : 2}
                  rx={3}
                  style={{
                    transition: "opacity 0.15s, stroke-width 0.15s",
                    filter: isHovered ? "brightness(1.3)" : "none",
                    transform: isHovered ? `translate(${-w*0.02}px, ${-ht*0.02}px) scale(1.04)` : "none",
                    transformOrigin: `${tile.x0 + w/2}px ${tile.y0 + ht/2}px`,
                  }}
                />
                {showFlag && (
                  <text
                    x={tile.x0 + 4}
                    y={tile.y0 + 12}
                    fontSize={10}
                    fill="white"
                    opacity={0.7}
                  >
                    {flag}
                  </text>
                )}
                {showTicker && (() => {
                  const maxChars = Math.max(1, Math.floor((w - 8) / (tickerSize * 0.6)));
                  const rawLabel = h.country === "KR" ? (isKo && h.name_kr ? h.name_kr : h.name) : (h.ticker || h.name);
                  const label = rawLabel.length > maxChars
                    ? rawLabel.slice(0, Math.max(1, maxChars - 1)) + "…"
                    : rawLabel;
                  return (
                    <text
                      x={tile.x0 + w / 2}
                      y={tile.y0 + ht / 2 - (showValue ? valueSize * 0.5 : 0)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize={tickerSize}
                      fontWeight="bold"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                    >
                      {label}
                    </text>
                  );
                })()}
                {showValue && (
                  <text
                    x={tile.x0 + w / 2}
                    y={tile.y0 + ht / 2 + tickerSize * 0.6}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={valueSize}
                    opacity={0.85}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                  >
                    {fmtB(h.value_usd)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-50 bg-navy border border-slate-600 rounded-lg px-4 py-3 shadow-2xl text-xs"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: `translate(${tooltip.x > dims.width * 0.7 ? "-105%" : "5%"}, -110%)`,
            }}
          >
            <div className="font-bold text-white text-sm mb-1">
              {isKo && tooltip.holding.name_kr ? tooltip.holding.name_kr : tooltip.holding.name}
              {isKo ? (
                tooltip.holding.name !== tooltip.holding.name_kr && (
                  <span className="text-slate-400 font-normal text-xs ml-1">({tooltip.holding.name})</span>
                )
              ) : (
                tooltip.holding.name_kr && tooltip.holding.name_kr !== tooltip.holding.name && (
                  <span className="text-slate-400 font-normal text-xs ml-1">({tooltip.holding.name_kr})</span>
                )
              )}
            </div>
            <div className="space-y-0.5 text-slate-300">
              <div>
                <span className="text-slate-500">{isKo ? "종목코드:" : "Ticker:"}</span>{" "}
                {tooltip.holding.ticker}
              </div>
              <div>
                <span className="text-slate-500">{isKo ? "국가:" : "Country:"}</span>{" "}
                {tooltip.holding.country === "KR" ? (isKo ? "🇰🇷 한국" : "🇰🇷 Korea") : (isKo ? "🇺🇸 미국" : "🇺🇸 United States")}
              </div>
              <div>
                <span className="text-slate-500">{isKo ? "금액:" : "Value:"}</span>{" "}
                {fmtB(tooltip.holding.value_usd)}
              </div>
              <div>
                <span className="text-slate-500">% of Portfolio:</span>{" "}
                {tooltip.pctFiltered.toFixed(2)}%
              </div>
              <div>
                <span className="text-slate-500">Sector:</span>{" "}
                {tooltip.holding.sector || "Unknown"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
        {COUNTRY_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-sm bg-slate-700"
              style={{ border: `3px solid ${item.color}` }}
            />
            <span className="text-white font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Sector Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
        <span className="text-slate-500 ml-2">{isKo ? "크기 = 금액 기준" : "Size = USD value"}</span>
      </div>

      {/* Summary Stats Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">
          {isKo ? "요약" : "Summary"} - {selectedYear}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {fmtB(yearData.total_usd)}
            </div>
            <div className="text-xs text-slate-400 uppercase mt-1">
              {isKo ? "총 포트폴리오" : "Total Portfolio"}
            </div>
          </div>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-loss">
              {fmtB(krTotal)}
            </div>
            <div className="text-xs text-slate-400 uppercase mt-1">
              🇰🇷 {isKo ? "한국" : "Korea"} ({yearData.kr_count})
            </div>
          </div>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {fmtB(usTotal)}
            </div>
            <div className="text-xs text-slate-400 uppercase mt-1">
              🇺🇸 {isKo ? "미국" : "US"} ({yearData.us_count})
            </div>
          </div>
          <div className="bg-navy-light border border-navy-lighter rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-300">
              {yearData.exchange_rate.toFixed(0)}
            </div>
            <div className="text-xs text-slate-400 uppercase mt-1">
              {isKo ? "환율" : "KRW/USD Rate"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
