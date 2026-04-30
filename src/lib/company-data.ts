import "server-only";
import fs from "fs";
import path from "path";
import type { CompanyData, CompanyIndex } from "./company-types";

const COMPANY_DIR = path.join(process.cwd(), "data", "company");

export function getCompanyIndex(): CompanyIndex {
  const file = path.join(COMPANY_DIR, "_index.json");
  if (!fs.existsSync(file)) {
    return { generated_at: "", count: 0, companies: {} };
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function getCompany(code: string): CompanyData | null {
  const file = path.join(COMPANY_DIR, `${code}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function getAllCompanyCodes(): string[] {
  return Object.keys(getCompanyIndex().companies);
}

export type { CompanyData, CompanyIndex, CompanyFiling, CompanyTrade, CompanyIndexEntry } from "./company-types";
export { formatDate } from "./company-types";
