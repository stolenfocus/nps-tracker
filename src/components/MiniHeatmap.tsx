"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { treemap, hierarchy, treemapSquarify } from "d3-hierarchy";

interface Holding {
  ticker: string;
  name: string;
  name_kr?: string;
  country: "KR" | "US";
  value_usd: number;
  pct_of_total: number;
}

function fmtValue(v: number) {
  return v >= 1e9
    ? `$${(v / 1e9).toFixed(1)}B`
    : v >= 1e6
      ? `$${(v / 1e6).toFixed(0)}M`
      : `$${v.toFixed(0)}`;
}

export default function MiniHeatmap({
  holdings,
  count = 30,
  lang = "en",
}: {
  holdings: Holding[];
  count: number;
  lang: string;
}) {
  const isKo = lang === "ko";
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 500, height: 340 });
  const [hovered, setHovered] = useState<number | null>(null);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setSize({ width: containerRef.current.clientWidth, height: 340 });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const top = [...holdings].sort((a, b) => b.value_usd - a.value_usd).slice(0, count);

  const nodes = useMemo(() => {
    const data: any = {
      name: "root",
      children: top.map((h) => ({ name: h.ticker || h.name, value: h.value_usd, holding: h })),
    };
    const root = hierarchy(data)
      .sum((d: any) => d.value || 0)
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

    treemap<any>()
      .size([size.width, size.height])
      .tile(treemapSquarify.ratio(1))
      .padding(1)
      .round(true)(root);

    return root.leaves();
  }, [top, size]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 340 }}>
      <svg width={size.width} height={size.height} style={{ display: "block" }}>
        {nodes.map((node: any, idx: number) => {
          const h = node.data.holding;
          const w = node.x1 - node.x0;
          const ht = node.y1 - node.y0;
          const fill = h.country === "KR" ? "#DC2626" : "#2563EB";
          const isHovered = hovered === idx;
          const minDim = Math.min(w, ht);
          const area = w * ht;
          const showValue = minDim > 40 && area > 3000;
          const fontSize = Math.max(6, Math.min(11, 0.18 * minDim));
          const subFontSize = Math.max(5, Math.min(8, 0.12 * minDim));

          let label: string;
          if (h.country === "KR") {
            const name = isKo && h.name_kr ? h.name_kr : h.name;
            label = w < 60 ? name.slice(0, 3) : name.length > 8 ? name.slice(0, 6) + ".." : name;
          } else {
            label = h.ticker || h.name.slice(0, 5);
          }

          return (
            <g
              key={`${h.ticker}-${idx}`}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
              clipPath="inset(0)"
              style={{ clipPath: `rect(${node.y0}px, ${node.x1}px, ${node.y1}px, ${node.x0}px)` }}
            >
              <rect
                x={node.x0}
                y={node.y0}
                width={Math.max(0, w)}
                height={Math.max(0, ht)}
                fill={fill}
                opacity={isHovered ? 1 : 0.8}
                stroke="#0B1120"
                strokeWidth={1}
                rx={1}
              />
              {minDim > 20 && area > 800 && (
                <text
                  x={node.x0 + w / 2}
                  y={node.y0 + ht / 2 - (showValue ? 0.5 * subFontSize : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="bold"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {label}
                </text>
              )}
              {showValue && (
                <text
                  x={node.x0 + w / 2}
                  y={node.y0 + ht / 2 + 0.55 * fontSize}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={subFontSize}
                  opacity={0.75}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {fmtValue(h.value_usd)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hovered !== null && nodes[hovered] && (
        <div className="absolute bottom-1 left-1 bg-navy/90 border border-navy-lighter rounded px-2 py-1 text-[10px] text-slate-300 pointer-events-none">
          <span className="text-white font-bold">
            {nodes[hovered].data.holding.country === "KR" ? "🇰🇷" : "🇺🇸"}{" "}
            {nodes[hovered].data.holding.ticker ||
              (isKo && nodes[hovered].data.holding.name_kr
                ? nodes[hovered].data.holding.name_kr
                : nodes[hovered].data.holding.name)}
          </span>
          {" — "}
          {fmtValue(nodes[hovered].data.holding.value_usd)} (
          {nodes[hovered].data.holding.pct_of_total.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}
