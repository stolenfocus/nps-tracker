import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const BASE = "https://stolenfocus.github.io/nps-tracker";

const mainPages = [
  { path: "", changeFrequency: "daily" as const, priority: 1.0 },
  { path: "/feed", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/global", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/compare", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
];

function getFeedDates(): string[] {
  const feedDir = path.join(process.cwd(), "public", "data", "feed");
  try {
    return fs
      .readdirSync(feedDir)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace(".json", ""))
      .sort();
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of mainPages) {
    entries.push({
      url: `${BASE}/en${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${BASE}/en${page.path}`,
          ko: `${BASE}/ko${page.path}`,
        },
      },
    });
  }

  for (const date of getFeedDates()) {
    entries.push({
      url: `${BASE}/en/feed/${date}`,
      lastModified: new Date(date),
      changeFrequency: "never" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE}/en/feed/${date}`,
          ko: `${BASE}/ko/feed/${date}`,
        },
      },
    });
  }

  return entries;
}
