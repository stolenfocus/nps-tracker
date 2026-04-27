"use client";

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { CompanyFiling } from "@/lib/company-types";
import { formatDate } from "@/lib/company-types";

interface Props {
  filings: CompanyFiling[];
  lang: string;
}

const eventColor: Record<string, string> = {
  신규: "#3b82f6",      // blue
  재진입: "#eab308",     // yellow
  증가: "#10b981",      // emerald
  감소: "#ef4444",      // red
  전량처분: "#991b1b",   // dark red
  확인필요: "#9ca3af",   // gray
};

const eventLabel = (ko: boolean, type: string): string => {
  if (ko) {
    return type === "확인필요" ? "확인 필요" : type;
  }
  const map: Record<string, string> = {
    신규: "NEW",
    재진입: "RE-ENTRY",
    증가: "UP",
    감소: "DOWN",
    전량처분: "EXIT",
    확인필요: "Unclear",
  };
  return map[type] || type;
};

interface ChartPoint {
  ts: number;
  date: string;
  stake: number;
  change_type: string;
  stake_change: number | null;
  dart_link: string;
  trade_count: number;
}

function toTs(yyyymmdd: string): number {
  if (!yyyymmdd || yyyymmdd.length !== 8) return 0;
  return new Date(
    Number(yyyymmdd.slice(0, 4)),
    Number(yyyymmdd.slice(4, 6)) - 1,
    Number(yyyymmdd.slice(6, 8))
  ).getTime();
}

function tickFormatter(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ChartTooltip({ active, payload, lang }: { active?: boolean; payload?: { payload: ChartPoint }[]; lang: string }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const ko = lang === "ko";
  const color = eventColor[p.change_type] || "#9ca3af";
  return (
    <div className="bg-navy border border-navy-lighter rounded px-3 py-2 text-xs shadow-lg">
      <div className="text-slate-300 font-medium">{formatDate(p.date)}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-white font-bold">{p.stake.toFixed(2)}%</span>
        <span style={{ color }}>{eventLabel(ko, p.change_type)}</span>
      </div>
      {p.stake_change !== null && (
        <div className="text-slate-400 mt-0.5">
          {ko ? "변동" : "change"}:{" "}
          <span className={p.stake_change >= 0 ? "text-emerald-400" : "text-red-400"}>
            {p.stake_change >= 0 ? "+" : ""}
            {p.stake_change.toFixed(2)}%p
          </span>
        </div>
      )}
      <div className="text-slate-500 mt-0.5">
        {ko ? "거래 건수" : "trades"}: {p.trade_count}
      </div>
    </div>
  );
}

export default function StakeTimelineChart({ filings, lang }: Props) {
  const ko = lang === "ko";

  const data: ChartPoint[] = filings
    .filter((f) => f.stake_pct !== null)
    .map((f) => ({
      ts: toTs(f.obligation_date || f.ref_date),
      date: f.obligation_date || f.ref_date,
      stake: f.stake_pct as number,
      change_type: f.change_type,
      stake_change: f.stake_change,
      dart_link: f.dart_link,
      trade_count: f.trade_count,
    }))
    .filter((p) => p.ts > 0)
    .sort((a, b) => a.ts - b.ts);

  if (data.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-8 text-center">
        {ko ? "차트에 표시할 데이터가 없습니다." : "No data available for chart."}
      </div>
    );
  }

  const stakeMin = Math.min(...data.map((d) => d.stake));
  const stakeMax = Math.max(...data.map((d) => d.stake));
  const pad = Math.max(0.3, (stakeMax - stakeMin) * 0.15);
  const yMin = Math.max(0, stakeMin - pad);
  const yMax = stakeMax + pad;

  const tsMin = data[0].ts;
  const tsMax = data[data.length - 1].ts;

  const show5 = yMin <= 5 && yMax >= 5;
  const show10 = yMin <= 10 && yMax >= 10;

  // Scatter data per event type so colors work
  const groupedScatter: Record<string, ChartPoint[]> = {};
  for (const p of data) {
    (groupedScatter[p.change_type] ||= []).push(p);
  }

  return (
    <div className="w-full">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={[tsMin, tsMax]}
              scale="time"
              tickFormatter={tickFormatter}
              stroke="#64748b"
              fontSize={11}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              stroke="#64748b"
              fontSize={11}
              width={50}
            />
            <Tooltip content={<ChartTooltip lang={lang} />} />
            {show5 && (
              <ReferenceLine
                y={5}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: "5%", fill: "#64748b", fontSize: 10, position: "left" }}
              />
            )}
            {show10 && (
              <ReferenceLine
                y={10}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: "10%", fill: "#64748b", fontSize: 10, position: "left" }}
              />
            )}
            <Line
              type="stepAfter"
              dataKey="stake"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {Object.entries(groupedScatter).map(([type, points]) => (
              <Scatter
                key={type}
                data={points}
                dataKey="stake"
                fill={eventColor[type] || "#9ca3af"}
                shape="circle"
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
        {Object.keys(groupedScatter).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: eventColor[type] || "#9ca3af" }}
            />
            <span>{eventLabel(ko, type)}</span>
            <span className="text-slate-600">({groupedScatter[type].length})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
