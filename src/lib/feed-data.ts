import fs from "fs";
import path from "path";

export interface RatioHistory {
  period: string;
  eps: number;
  bps: number;
  roe: number;
  debt_ratio: number;
  revenue_growth: number;
  op_profit_growth: number;
}

export interface EbitdaHistory {
  period: string;
  ebitda: number;
  ev_ebitda: number;
  eva: number;
}

export interface Disclosure {
  stock_name: string;
  stock_code: string;
  change_type: string;
  stake_pct: string;
  stake_change: string;
  stake_prev_pct: number | null;
  ref_price: number;
  ref_date: string;
  per: number;
  pbr: number;
  eps: number;
  bps: number;
  roe: number;
  debt_ratio: number;
  revenue_growth: number;
  op_profit_growth: number;
  fin_period: string;
  ev_ebitda: number;
  ebitda: number;
  sector: string;
  sector_detail: string;
  nxt_available: boolean;
  name_eng: string;
  ceo: string;
  homepage: string;
  established: string;
  financial_ratio_history: RatioHistory[];
  ebitda_history: EbitdaHistory[];
  trades: {
    reason_text: string;
    trade_date: string;
    shares_change: number;
    unit_price: number;
    shares_after: number;
    estimated?: boolean;
  }[];
  total_buy_amount: number;
  total_sell_amount: number;
  net_amount: number;
  obligation_date: string;
  trading_halted?: boolean;
  fx_rate?: number;
  ref_price_usd?: number;
  net_amount_usd?: number;
  dart_link: string;
}

export interface FeedDay {
  date: string;
  generated_at: string;
  count: number;
  summary: Record<string, number>;
  highlights: string[];
  disclosures: Disclosure[];
  message?: string;
}

export interface FeedIndexEntry {
  date: string;
  count: number;
  summary: Record<string, number>;
  highlights: string[];
}

export interface FeedIndex {
  last_updated: string;
  dates: FeedIndexEntry[];
}

const FEED_DIR = path.join(process.cwd(), "public", "data", "feed");

export function getFeedIndex(): FeedIndex {
  const filePath = path.join(FEED_DIR, "index.json");
  if (!fs.existsSync(filePath)) {
    return { last_updated: "", dates: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getFeedDay(date: string): FeedDay | null {
  const filePath = path.join(FEED_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getAllFeedDates(): string[] {
  const index = getFeedIndex();
  return index.dates.map((d) => d.date);
}
