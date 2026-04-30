import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────

export interface Holding {
  name: string;
  cusip: string;
  shares: number;
  value: number;
  ticker?: string;
}

export interface Quarter {
  file_date: string;
  form: string;
  holdings: Holding[];
}

export interface NpsData {
  filer: string;
  cik: string;
  quarters_count: number;
  quarters: Record<string, Quarter>;
}

export interface BacktestStock {
  ticker: string;
  cusip: string;
  name: string;
  buy_price: number;
  sell_price: number;
  return_pct: number;
  share_increase_pct: number;
}

export interface BacktestQuarter {
  quarter: string;
  file_date: string;
  buy_date: string;
  sell_date: string;
  top20_selected: number;
  mapped_count: number;
  traded_count: number;
  portfolio_return_pct: number;
  spy_return_pct: number;
  cumulative_return: number;
  spy_cumulative: number;
  stocks: BacktestStock[];
}

export interface BacktestData {
  strategy: string;
  description: string;
  summary: {
    quarters_traded: number;
    win_quarters: number;
    lose_quarters: number;
    avg_quarterly_return_pct: number;
    avg_spy_quarterly_pct: number;
    cumulative_return_pct: number;
    spy_cumulative_pct: number;
    alpha_pp: number;
  };
  quarters: BacktestQuarter[];
}

export interface EnrichedHolding extends Holding {
  ticker: string;
  portfolioPct: number;
  qoqChangePct: number | null;
}

export interface Mover extends EnrichedHolding {
  prevShares: number;
}

// ── Global Portfolio Types ──────────────────────────────────────────

export interface GlobalHolding {
  name: string;
  name_kr?: string;
  ticker: string;
  cusip?: string;
  country: "KR" | "US";
  value_usd: number;
  value_local?: number;
  shares?: number;
  weight_in_kr_pct?: number;
  shareholding_pct?: number;
  pct_of_total: number;
  sector: string;
}

export interface GlobalYear {
  date: string;
  exchange_rate: number;
  kr_total_usd: number;
  us_total_usd: number;
  total_usd: number;
  kr_count: number;
  us_count: number;
  holdings: GlobalHolding[];
}

export interface AllocationEntry {
  year: string;
  kr_usd: number;
  us_usd: number;
  total_usd: number;
  rate: number;
  kr_count: number;
  us_count: number;
  kr_pct: number;
  us_pct: number;
}

export interface GlobalData {
  years: Record<string, GlobalYear>;
  allocation_history: AllocationEntry[];
}

// ── Pension Comparison Types ────────────────────────────────────────

export interface PensionFundTop20Item {
  ticker: string;
  name: string;
  cusip: string;
  value: number;
  shares: number;
  pct: number;
}

export interface PensionFundInfo {
  full_name: string;
  country: string;
  flag: string;
  total_value: number;
  holdings_count: number;
  period: string;
  top20: PensionFundTop20Item[];
}

export interface ConsensusHolding {
  cusip: string;
  ticker: string;
  name: string;
  funds: Record<string, { rank: number; value: number }>;
  fund_count: number;
  avg_rank: number;
}

export interface NpsUniquePick {
  cusip: string;
  ticker: string;
  name: string;
  rank: number;
  value: number;
}

export interface Top10Item {
  rank: number;
  ticker: string;
  name: string;
  value: number;
  pct: number;
}

export interface OverlapStats {
  held_by_all_5: number;
  held_by_4_plus: number;
  held_by_3_plus: number;
  held_by_2_plus: number;
  total_unique: number;
  in_top50_of_4_plus: number;
}

export interface PensionComparisonData {
  generated: string;
  period: string;
  funds: Record<string, PensionFundInfo>;
  consensus_holdings: ConsensusHolding[];
  nps_unique_picks: NpsUniquePick[];
  top10_per_fund: Record<string, Top10Item[]>;
  overlap_stats: OverlapStats;
}

// ── Loaders ────────────────────────────────────────────────────────

function dataPath(filename: string): string {
  return path.join(process.cwd(), "data", filename);
}

let _nps: NpsData | null = null;
let _cusipMap: Record<string, string> | null = null;
let _backtest: BacktestData | null = null;
let _global: GlobalData | null = null;
let _pensionComparison: PensionComparisonData | null = null;

function loadJson<T>(filename: string): T {
  const filePath = dataPath(filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file missing: ${filename}. Run data pipeline first.`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getNpsData(): NpsData {
  if (!_nps) _nps = loadJson<NpsData>("nps_13f_all.json");
  return _nps!;
}

export function getCusipMap(): Record<string, string> {
  if (!_cusipMap) _cusipMap = loadJson<Record<string, string>>("cusip_ticker_map.json");
  return _cusipMap!;
}

export function getBacktestData(): BacktestData {
  if (!_backtest) _backtest = loadJson<BacktestData>("backtest_top20_increase_results.json");
  return _backtest!;
}

export function getPensionComparisonData(): PensionComparisonData {
  if (!_pensionComparison) _pensionComparison = loadJson<PensionComparisonData>("global_pension_funds.json");
  return _pensionComparison!;
}

export function getGlobalData(): GlobalData {
  if (!_global) _global = loadJson<GlobalData>("nps_global_combined.json");
  return _global!;
}

export function getGlobalYear(year: string): GlobalYear {
  return getGlobalData().years[year];
}

export function getGlobalYears(): string[] {
  return Object.keys(getGlobalData().years);
}

export function getLatestGlobalYear(): string {
  const years = getGlobalYears();
  return years[years.length - 1];
}

export function getAllocationHistory(): AllocationEntry[] {
  return getGlobalData().allocation_history;
}

export function fmtValueKRW(val: number): string {
  // val is in 억원 (100M KRW)
  if (val >= 10000) return `₩${(val / 10000).toFixed(1)}T`;
  return `₩${val.toLocaleString("en-US")}B`;
}

// ── Derived data ───────────────────────────────────────────────────

export function getQuarterKeys(): string[] {
  return Object.keys(getNpsData().quarters);
}

export function getLatestQuarterKey(): string {
  const keys = getQuarterKeys();
  return keys[keys.length - 1];
}

export function getPrevQuarterKey(): string {
  const keys = getQuarterKeys();
  return keys[keys.length - 2];
}

export function getLatestQuarter(): Quarter {
  return getNpsData().quarters[getLatestQuarterKey()];
}

export function getPrevQuarter(): Quarter {
  return getNpsData().quarters[getPrevQuarterKey()];
}

export function getTotalValue(): number {
  return getLatestQuarter().holdings.reduce((s, h) => s + h.value, 0);
}

export function enrichHolding(
  h: Holding,
  totalValue: number,
  prevMap: Map<string, Holding>
): EnrichedHolding {
  const cusipMap = getCusipMap();
  const ticker = cusipMap[h.cusip] || h.cusip.slice(0, 6);
  const prev = prevMap.get(h.cusip);
  const qoqChangePct =
    prev && prev.shares > 0
      ? ((h.shares - prev.shares) / prev.shares) * 100
      : null;
  return {
    ...h,
    ticker,
    portfolioPct: (h.value / totalValue) * 100,
    qoqChangePct,
  };
}

export function getTop20Holdings(): EnrichedHolding[] {
  const latest = getLatestQuarter();
  const prev = getPrevQuarter();
  const totalValue = getTotalValue();
  const prevMap = new Map(prev.holdings.map((h) => [h.cusip, h]));

  return latest.holdings
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)
    .map((h) => enrichHolding(h, totalValue, prevMap));
}

export function getNewBuys(): EnrichedHolding[] {
  const latest = getLatestQuarter();
  const prev = getPrevQuarter();
  const prevCusips = new Set(prev.holdings.map((h) => h.cusip));
  const totalValue = getTotalValue();
  const prevMap = new Map<string, Holding>();

  return latest.holdings
    .filter((h) => !prevCusips.has(h.cusip))
    .sort((a, b) => b.value - a.value)
    .map((h) => enrichHolding(h, totalValue, prevMap));
}

export function getSoldPositions(): EnrichedHolding[] {
  const latest = getLatestQuarter();
  const prev = getPrevQuarter();
  const latestCusips = new Set(latest.holdings.map((h) => h.cusip));
  const cusipMap = getCusipMap();
  const prevTotal = prev.holdings.reduce((s, h) => s + h.value, 0);

  return prev.holdings
    .filter((h) => !latestCusips.has(h.cusip))
    .sort((a, b) => b.value - a.value)
    .map((h) => ({
      ...h,
      ticker: cusipMap[h.cusip] || h.cusip.slice(0, 6),
      portfolioPct: (h.value / prevTotal) * 100,
      qoqChangePct: -100,
    }));
}

export function getMovers(): { increases: Mover[]; decreases: Mover[] } {
  const latest = getLatestQuarter();
  const prev = getPrevQuarter();
  const totalValue = getTotalValue();
  const prevMap = new Map(prev.holdings.map((h) => [h.cusip, h]));
  const cusipMap = getCusipMap();

  const movers: Mover[] = [];
  for (const h of latest.holdings) {
    const p = prevMap.get(h.cusip);
    if (p && p.shares > 0) {
      const changePct = ((h.shares - p.shares) / p.shares) * 100;
      movers.push({
        ...h,
        ticker: cusipMap[h.cusip] || h.cusip.slice(0, 6),
        portfolioPct: (h.value / totalValue) * 100,
        qoqChangePct: changePct,
        prevShares: p.shares,
      });
    }
  }

  const increases = movers
    .sort((a, b) => (b.qoqChangePct ?? 0) - (a.qoqChangePct ?? 0))
    .slice(0, 10);
  const decreases = movers
    .sort((a, b) => (a.qoqChangePct ?? 0) - (b.qoqChangePct ?? 0))
    .slice(0, 10);

  return { increases, decreases };
}

// ── Consecutive Buying Streaks ─────────────────────────────────────

export interface StreakEntry {
  cusip: string;
  ticker: string;
  name: string;
  streak: number;
  latestShares: number;
  latestValue: number;
  portfolioPct: number;
  prevPortfolioPct: number;
  portfolioPctChange: number;
  latestChangePct: number;
}

interface SplitEvent {
  date: string;
  ratio: number;
}

let _splits: Record<string, SplitEvent[]> | null = null;

function getSplitData(): Record<string, SplitEvent[]> {
  if (!_splits) {
    try {
      _splits = loadJson<Record<string, SplitEvent[]>>("stock_splits.json");
    } catch {
      _splits = {};
    }
  }
  return _splits!;
}

function getSplitAdjustment(ticker: string, qStart: string, qEnd: string): number {
  const splits = getSplitData()[ticker];
  if (!splits) return 1;
  let adj = 1;
  for (const s of splits) {
    if (s.date > qStart && s.date <= qEnd) {
      adj *= s.ratio;
    }
  }
  return adj;
}

export function getConsecutiveBuyStreaks(): StreakEntry[] {
  const nps = getNpsData();
  const cusipMap = getCusipMap();
  const quarters = Object.keys(nps.quarters).sort();
  const latestQ = quarters[quarters.length - 1];
  const latestHoldings = nps.quarters[latestQ].holdings;
  const totalValue = latestHoldings.reduce((s, h) => s + h.value, 0);

  const results: StreakEntry[] = [];

  for (const h of latestHoldings) {
    const ticker = cusipMap[h.cusip] || h.cusip.slice(0, 6);
    let streak = 0;

    for (let i = quarters.length - 1; i > 0; i--) {
      const qCurr = quarters[i];
      const qPrev = quarters[i - 1];
      const currH = nps.quarters[qCurr].holdings.find((x) => x.cusip === h.cusip);
      const prevH = nps.quarters[qPrev].holdings.find((x) => x.cusip === h.cusip);

      if (!currH || !prevH || prevH.shares <= 0) break;

      const adj = getSplitAdjustment(ticker, qPrev, qCurr);
      const adjustedPrev = prevH.shares * adj;

      if (currH.shares > adjustedPrev * 1.01) {
        streak++;
      } else {
        break;
      }
    }

    if (streak >= 2) {
      const prevQ = quarters[quarters.length - 2];
      const prevH = nps.quarters[prevQ].holdings.find((x) => x.cusip === h.cusip);
      const adj = getSplitAdjustment(ticker, prevQ, latestQ);
      const adjustedPrev = prevH ? prevH.shares * adj : 0;
      const latestChangePct =
        adjustedPrev > 0 ? ((h.shares - adjustedPrev) / adjustedPrev) * 100 : 0;

      const prevTotalValue = nps.quarters[prevQ].holdings.reduce((s, x) => s + x.value, 0);
      const prevPct = prevH && prevTotalValue > 0 ? (prevH.value / prevTotalValue) * 100 : 0;
      const currPct = (h.value / totalValue) * 100;

      results.push({
        cusip: h.cusip,
        ticker,
        name: h.name,
        streak,
        latestShares: h.shares,
        latestValue: h.value,
        portfolioPct: currPct,
        prevPortfolioPct: prevPct,
        portfolioPctChange: currPct - prevPct,
        latestChangePct,
      });
    }
  }

  return results.sort((a, b) => b.streak - a.streak || b.latestValue - a.latestValue);
}

// ── Formatters ─────────────────────────────────────────────────────

export function fmtValue(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export function fmtShares(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function fmtPct(n: number | null): string {
  if (n === null) return "New";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
