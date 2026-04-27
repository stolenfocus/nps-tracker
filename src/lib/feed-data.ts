import fs from "fs";
import path from "path";

const FEED_DIR = path.join(process.cwd(), "public", "data", "feed");

interface FeedDisclosure {
  stock_name: string;
  stock_code: string;
  change_type: string;
  stake_pct: string;
  stake_change: string;
  fin_period?: string;
  name_eng?: string;
}

interface FeedDay {
  date: string;
  count: number;
  summary: Record<string, number>;
  disclosures: FeedDisclosure[];
  generated_at?: string;
}

interface FeedIndexEntry {
  date: string;
  count: number;
  summary: Record<string, number>;
  highlights: string[];
}

interface FeedIndex {
  dates: FeedIndexEntry[];
}

let _index: FeedIndex | null = null;

export function getFeedIndex(): FeedIndex {
  if (!_index) {
    const p = path.join(FEED_DIR, "index.json");
    if (fs.existsSync(p)) {
      _index = JSON.parse(fs.readFileSync(p, "utf-8"));
    } else {
      _index = { dates: [] };
    }
  }
  return _index!;
}

export function getFeedDay(date: string): FeedDay | null {
  const p = path.join(FEED_DIR, `${date}.json`);
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  }
  return null;
}

export function getAllFeedDates(): string[] {
  const index = getFeedIndex();
  return index.dates.map((d) => d.date);
}
