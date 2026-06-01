/**
 * Downloads and refreshes SMI, indemnity caps, and procedural deadlines
 * from official BOE open-data API, with a verified static baseline fallback.
 *
 * Usage: npm run update-legal-data
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { LegalData, SmiData } from "../lib/legal-data.types";

const ROOT = join(__dirname, "..");
const BASELINE_PATH = join(ROOT, "data", "legal-data.baseline.json");
const OUTPUT_PATH = join(ROOT, "data", "legal-data.json");

const BOE_SUMARIO_API = "https://www.boe.es/datosabiertos/api/boe/sumario";
const BOE_XML_API = "https://www.boe.es/diario_boe/xml.php";

type BoeItem = {
  identificador?: string;
  titulo?: string;
  url_html?: string;
};

type UpdateResult = {
  data: LegalData;
  log: string[];
};

/** Formats a Date as YYYYMMDD for the BOE sumario API. */
function formatBoeDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/** Loads the verified static baseline JSON. */
function loadBaseline(): LegalData {
  const raw = readFileSync(BASELINE_PATH, "utf8");
  return JSON.parse(raw) as LegalData;
}

/** Fetches BOE daily summary JSON for a given date. */
async function fetchBoeSumario(date: string): Promise<unknown | null> {
  const response = await fetch(`${BOE_SUMARIO_API}/${date}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    status?: { code?: string };
    data?: unknown;
  };

  if (payload.status?.code !== "200") {
    return null;
  }

  return payload.data ?? null;
}

/** Recursively walks BOE sumario JSON looking for SMI Real Decreto entries. */
function findSmiDocuments(node: unknown, results: BoeItem[] = []): BoeItem[] {
  if (!node || typeof node !== "object") {
    return results;
  }

  if (Array.isArray(node)) {
    for (const entry of node) {
      findSmiDocuments(entry, results);
    }
    return results;
  }

  const record = node as Record<string, unknown>;
  const title = typeof record.titulo === "string" ? record.titulo : "";

  if (
    /real decreto.*fija el salario m[ií]nimo interprofesional/i.test(title) &&
    typeof record.identificador === "string"
  ) {
    results.push({
      identificador: record.identificador,
      titulo: title,
      url_html:
        typeof record.url_html === "string" ? record.url_html : undefined,
    });
  }

  for (const value of Object.values(record)) {
    findSmiDocuments(value, results);
  }

  return results;
}

/** Generates candidate BOE sumario dates to scan for the SMI decree. */
function buildScanDates(): string[] {
  const today = new Date();
  const year = today.getFullYear();
  const dates = new Set<string>();

  const addRange = (from: Date, to: Date) => {
    const cursor = new Date(from);
    while (cursor <= to) {
      dates.add(formatBoeDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  };

  addRange(new Date(year, 0, 1), today);
  addRange(new Date(year - 1, 1, 1), new Date(year - 1, 1, 28));

  return [...dates].sort((a, b) => b.localeCompare(a));
}

/** Normalizes BOE numeric strings (handles thin spaces and Spanish decimals). */
function parseBoeAmount(raw: string): number {
  const normalized = raw
    .replace(/[\s\u00a0\u202f.]/g, "")
    .replace(",", ".");
  return Number.parseFloat(normalized);
}

/** Rejects implausible SMI values from mis-parsed BOE documents. */
function isPlausibleSmi(monthlyEuros: number, dailyEuros: number): boolean {
  return (
    monthlyEuros >= 900 &&
    monthlyEuros <= 2000 &&
    dailyEuros >= 25 &&
    dailyEuros <= 70 &&
    Math.abs(monthlyEuros / dailyEuros - 30) < 2
  );
}

/** Fetches and parses SMI amounts from a BOE Real Decreto XML. */
async function fetchSmiFromBoe(boeId: string): Promise<Partial<SmiData> | null> {
  const response = await fetch(`${BOE_XML_API}?id=${encodeURIComponent(boeId)}`);
  if (!response.ok) {
    return null;
  }

  const xml = await response.text();
  const smiMatch = xml.match(
    /queda fijado en\s+(\d[\d\s\u00a0\u202f.,]*)\s+euros\s*\/?\s*d[ií]a\s+o\s+(\d[\d\s\u00a0\u202f.,]*)\s+euros\s*\/?\s*mes/i,
  );
  const dailyMatch = smiMatch
    ? null
    : xml.match(
        /(\d{1,3}(?:[\s\u00a0\u202f.]?\d{3})*(?:,\d{1,2})?)\s+euros\s*\/?\s*d[ií]a/i,
      );
  const monthlyMatch = smiMatch
    ? null
    : xml.match(
        /(\d{1,2}(?:[\s\u00a0\u202f.]?\d{3})*(?:,\d{1,2})?|\d{3,4})\s+euros\s*\/?\s*mes/i,
      );
  const decreeMatch = xml.match(
    /<numero_oficial>([^<]+)<\/numero_oficial>/i,
  );
  const vigenciaMatch = xml.match(
    /<fecha_vigencia>(\d{8})<\/fecha_vigencia>/i,
  );
  const titleMatch = xml.match(/<titulo>([^<]+)<\/titulo>/i);

  if (!smiMatch && (!dailyMatch?.[1] || !monthlyMatch?.[1])) {
    return null;
  }

  const dailyEuros = smiMatch
    ? parseBoeAmount(smiMatch[1])
    : parseBoeAmount(dailyMatch![1]);
  const monthlyEuros = smiMatch
    ? parseBoeAmount(smiMatch[2])
    : parseBoeAmount(monthlyMatch![1]);

  if (!isPlausibleSmi(monthlyEuros, dailyEuros)) {
    return null;
  }
  const yearMatch = titleMatch?.[1]?.match(/para\s+(\d{4})/i);
  const year = yearMatch
    ? Number.parseInt(yearMatch[1], 10)
    : new Date().getFullYear();

  let effectiveFrom = `${year}-01-01`;
  if (vigenciaMatch?.[1]) {
    const raw = vigenciaMatch[1];
    effectiveFrom = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }

  return {
    year,
    monthlyEuros,
    dailyEuros,
    yearlyEuros14Payments: monthlyEuros * 14,
    effectiveFrom,
    boeId,
    decree: decreeMatch?.[1]
      ? `Real Decreto ${decreeMatch[1]}`
      : titleMatch?.[1] ?? "Real Decreto SMI",
    source: {
      name: "BOE",
      url: `https://www.boe.es/diario_boe/txt.php?id=${boeId}`,
      reference: "Artículo 1",
    },
    fetchedAt: new Date().toISOString().slice(0, 10),
    fetchMethod: "boe-api",
  };
}

/** Attempts to locate the latest SMI decree via BOE open-data API. */
async function resolveSmiFromBoe(log: string[]): Promise<Partial<SmiData> | null> {
  const scanDates = buildScanDates();
  log.push(`Scanning ${scanDates.length} BOE sumario dates for SMI decree…`);

  for (const date of scanDates) {
    const sumario = await fetchBoeSumario(date);
    if (!sumario) {
      continue;
    }

    const matches = findSmiDocuments(sumario);
    if (matches.length === 0) {
      continue;
    }

    const latest = matches[0];
    if (!latest.identificador) {
      continue;
    }

    log.push(`Found SMI candidate on ${date}: ${latest.identificador}`);
    const parsed = await fetchSmiFromBoe(latest.identificador);

    if (parsed?.dailyEuros && parsed.monthlyEuros) {
      log.push(
        `Parsed SMI from BOE: ${parsed.dailyEuros} €/day, ${parsed.monthlyEuros} €/month`,
      );
      return parsed;
    }

    log.push(`Could not parse amounts from ${latest.identificador}`);
  }

  log.push("No SMI decree found via BOE API; using baseline.");
  return null;
}

/** Builds the final legal data payload, merging live SMI with static rules. */
async function buildLegalData(): Promise<UpdateResult> {
  const baseline = loadBaseline();
  const log: string[] = [];
  const now = new Date().toISOString().slice(0, 10);

  const liveSmi = await resolveSmiFromBoe(log);
  const smi: SmiData = liveSmi?.dailyEuros
    ? ({ ...baseline.smi, ...liveSmi } as SmiData)
    : { ...baseline.smi, fetchMethod: "baseline", fetchedAt: now };

  const dailyCap = Math.round(smi.dailyEuros * 2 * 100) / 100;

  const data: LegalData = {
    ...baseline,
    version: `${smi.year}.${now.slice(5, 7)}`,
    updatedAt: now,
    smi,
    indemnitySalaryCap: {
      ...baseline.indemnitySalaryCap,
      dailyEurosMax: dailyCap,
    },
    indemnityRules: baseline.indemnityRules,
    deadlines: baseline.deadlines,
    officialSources: baseline.officialSources,
    updateLog: [...(baseline.updateLog ?? []), ...log],
  };

  return { data, log };
}

/** Persists legal data JSON and prints a summary to stdout. */
function writeLegalData(data: LegalData, log: string[]): void {
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log("\n✅ Legal data updated → data/legal-data.json\n");
  console.log(`   SMI ${data.smi.year}: ${data.smi.monthlyEuros} €/mes (${data.smi.dailyEuros} €/día)`);
  console.log(`   Source: ${data.smi.fetchMethod} — ${data.smi.boeId}`);
  console.log(
    `   Indemnity salary cap: ${data.indemnitySalaryCap.dailyEurosMax} €/día (${data.indemnitySalaryCap.formula})`,
  );
  console.log(`   Deadlines: ${data.deadlines.length} entries from ET/LRJS baseline`);
  console.log("\n   Update log:");
  for (const entry of log) {
    console.log(`   • ${entry}`);
  }
  console.log("");
}

async function main(): Promise<void> {
  try {
    const { data, log } = await buildLegalData();
    writeLegalData(data, log);
  } catch (error) {
    console.error("\n❌ Failed to update legal data:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
