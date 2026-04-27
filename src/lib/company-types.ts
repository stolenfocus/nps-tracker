export interface CompanyTrade {
  date: string;
  reason: string;
  shares_before: number;
  shares_change: number;
  shares_after: number;
  unit_price: number;
  note: string;
  estimated: boolean;
}

export interface CompanyFiling {
  ref_date: string;
  obligation_date: string;
  feed_date: string;
  change_type: string;
  stake_pct: number | null;
  stake_prev_pct: number | null;
  stake_change: number | null;
  ref_price: number | null;
  total_buy_amount: number;
  total_sell_amount: number;
  net_amount: number;
  trade_count: number;
  dart_link: string;
  trades: CompanyTrade[];
  _original_change_type?: string;
}

export interface CompanyData {
  stock_code: string;
  stock_name: string;
  name_eng: string;
  sector: string;
  ceo: string;
  homepage: string;
  established: string;
  latest_per: number | null;
  latest_pbr: number | null;
  latest_roe: number | null;
  latest_debt_ratio: number | null;
  latest_ref_price: number | null;
  fin_period: string;
  filing_count: number;
  first_seen: string;
  last_seen: string;
  latest_stake_pct: number | null;
  filings: CompanyFiling[];
}

export interface CompanyIndexEntry {
  stock_name: string;
  name_eng: string;
  sector: string;
  filing_count: number;
  latest_stake_pct: number | null;
  first_seen: string;
  last_seen: string;
}

export interface CompanyIndex {
  generated_at: string;
  count: number;
  companies: Record<string, CompanyIndexEntry>;
}

/** Convert YYYYMMDD → YYYY-MM-DD for display/parsing. Pure, client-safe. */
export function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd || "";
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
