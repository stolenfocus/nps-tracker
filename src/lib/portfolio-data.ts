import "server-only";
import fs from "fs";
import path from "path";

export interface PortfolioCompany {
  code: string;
  stock_name: string;
  name_eng: string;
  sector: string;
  latest_stake_pct: number;
}

export interface PortfolioMonth {
  date: string; // "YYYY-MM"
  total_value_krw: number;
  weights: Record<string, number>; // code → pct
}

export interface PortfolioTimeline {
  generated_at: string;
  top_n: number;
  period: { start: string; end: string };
  companies: PortfolioCompany[];
  months: PortfolioMonth[];
}

const FILE = path.join(
  process.cwd(),
  "public",
  "data",
  "portfolio",
  "top30_timeline.json"
);

export function getPortfolioTimeline(): PortfolioTimeline | null {
  if (!fs.existsSync(FILE)) return null;
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}
