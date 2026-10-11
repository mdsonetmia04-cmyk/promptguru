// ---------------------------------------------------------------------------
// Adobe Stock contributor compliance logic.
// Rules sourced from Adobe's official contributor docs (helpx.adobe.com):
// - Title: max 200 chars (portal), ~70 ideal (CSV spec: 70 or fewer, no commas)
// - Keywords: max 49 (portal hard cap), 15-35 ideal, first 10 carry most weight
// - No brand/trademark names, no people's names, no camera specs in metadata
// - CSV columns: Filename,Title,Keywords,Category,Releases (exact headers)
// - Generative AI: must tick "Created using generative AI tools" on upload
// ---------------------------------------------------------------------------

export const TITLE_MAX = 200;
export const TITLE_IDEAL = 70;
export const KEYWORD_MAX = 49;
export const KEYWORD_IDEAL_MIN = 15;
export const KEYWORD_IDEAL_MAX = 35;
export const FILENAME_MAX = 30;
export const CSV_MAX_ROWS = 5000;

export interface AdobeCategory {
  id: number;
  name: string;
}

// Adobe Stock's 21 contributor categories (Category column takes the number)
export const ADOBE_CATEGORIES: AdobeCategory[] = [
  { id: 1, name: "Animals" },
  { id: 2, name: "Buildings and Architecture" },
  { id: 3, name: "Business" },
  { id: 4, name: "Drinks" },
  { id: 5, name: "Environment" },
  { id: 6, name: "States of Mind" },
  { id: 7, name: "Food" },
  { id: 8, name: "Healthcare" },
  { id: 9, name: "Hobbies and Leisure" },
  { id: 10, name: "Industry" },
  { id: 11, name: "Landscape" },
  { id: 12, name: "Lifestyle" },
  { id: 13, name: "People" },
  { id: 14, name: "Plants and Flowers" },
  { id: 15, name: "Culture and Religion" },
  { id: 16, name: "Science" },
  { id: 17, name: "Social Issues" },
  { id: 18, name: "Sports" },
  { id: 19, name: "Technology" },
  { id: 20, name: "Transport" },
  { id: 21, name: "Travel" },
];

export const categoryName = (id: number): string =>
  ADOBE_CATEGORIES.find((c) => c.id === id)?.name || "Unknown";

export type CheckLevel = "pass" | "warn" | "fail";

export interface ComplianceCheck {
  level: CheckLevel;
  message: string;
}

const isAllCaps = (s: string): boolean => {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
};

// Common camera-spec / technical-data patterns Adobe rejects in metadata
const TECH_PATTERNS = [
  /\b\d+\s?(mp|megapixels?)\b/i,
  /\biso\s?\d+/i,
  /\bf\/\d+(\.\d+)?/i,
  /\b\d+\s?mm\b/i,
  /\b(raw|jpeg|jpg|png|tiff|eps)\b/i,
  /\b\d{3,4}\s?[x×]\s?\d{3,4}\b/,
];

export function validateTitle(title: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const t = title.trim();

  if (!t) {
    return [{ level: "fail", message: "Title is empty. Adobe requires a descriptive title." }];
  }
  if (t.length > TITLE_MAX) {
    checks.push({
      level: "fail",
      message: `Title is ${t.length} characters — over Adobe's ${TITLE_MAX}-character limit.`,
    });
  } else if (t.length > TITLE_IDEAL) {
    checks.push({
      level: "warn",
      message: `Title is ${t.length} characters. Adobe may auto-shorten titles over ~${TITLE_IDEAL} characters.`,
    });
  } else {
    checks.push({ level: "pass", message: `Title length ${t.length} is within the ideal range.` });
  }
  if (isAllCaps(t)) {
    checks.push({ level: "warn", message: "Avoid ALL CAPS — Adobe rejects shouty titles." });
  } else {
    checks.push({ level: "pass", message: "Title uses normal capitalization." });
  }
  if (t.includes(",")) {
    checks.push({
      level: "warn",
      message: "Title contains commas — remove them for Adobe's CSV uploader.",
    });
  }
  if (t.length < 15) {
    checks.push({
      level: "warn",
      message: "Title looks very short — describe what's actually visible in the asset.",
    });
  }
  if (/[,;]\s*\S+[,;]/g.test(t) && t.split(/[,;]/).length > 3) {
    checks.push({
      level: "fail",
      message: "Title reads like a keyword list. Write one natural descriptive sentence.",
    });
  }
  return checks;
}

export function validateKeywords(keywords: string[]): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const kws = keywords.map((k) => k.trim()).filter((k) => k.length > 0);

  if (kws.length === 0) {
    return [{ level: "fail", message: "No keywords. Add descriptive keywords buyers search for." }];
  }
  if (kws.length > KEYWORD_MAX) {
    checks.push({
      level: "fail",
      message: `${kws.length} keywords — over Adobe's limit of ${KEYWORD_MAX}.`,
    });
  } else if (kws.length < KEYWORD_IDEAL_MIN || kws.length > KEYWORD_IDEAL_MAX) {
    checks.push({
      level: "warn",
      message: `${kws.length} keywords. Adobe's sweet spot is ${KEYWORD_IDEAL_MIN}-${KEYWORD_IDEAL_MAX}; the first 10 carry the most weight.`,
    });
  } else {
    checks.push({
      level: "pass",
      message: `${kws.length} keywords — inside Adobe's ideal ${KEYWORD_IDEAL_MIN}-${KEYWORD_IDEAL_MAX} range.`,
    });
  }

  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const k of kws) {
    const low = k.toLowerCase();
    if (seen.has(low)) dupes.add(k);
    seen.add(low);
  }
  if (dupes.size > 0) {
    checks.push({
      level: "fail",
      message: `Duplicate keywords found: ${[...dupes].slice(0, 5).join(", ")}.`,
    });
  } else {
    checks.push({ level: "pass", message: "No duplicate keywords." });
  }

  const withCommas = kws.filter((k) => k.includes(","));
  if (withCommas.length > 0) {
    checks.push({
      level: "fail",
      message: "Keywords must not contain commas — split them into separate keywords.",
    });
  }

  const caps = kws.filter(isAllCaps);
  if (caps.length > 0) {
    checks.push({
      level: "warn",
      message: `${caps.length} ALL-CAPS keyword(s) — use normal capitalization.`,
    });
  }

  const tech = kws.filter((k) => TECH_PATTERNS.some((re) => re.test(k)));
  if (tech.length > 0) {
    checks.push({
      level: "warn",
      message: `Technical data in keywords (${tech.slice(0, 3).join(", ")}) — Adobe rejects camera specs.`,
    });
  }

  const numericOnly = kws.filter((k) => /^\d+$/.test(k));
  if (numericOnly.length > 0) {
    checks.push({
      level: "warn",
      message: "Numbers alone aren't keywords — remove standalone numbers.",
    });
  }

  return checks;
}

export function validateFilename(name: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const n = name.trim();
  if (!n) return [{ level: "fail", message: "Filename is empty." }];
  if (n.length > FILENAME_MAX) {
    checks.push({
      level: "fail",
      message: `Filename is ${n.length} characters — Adobe's CSV limit is ${FILENAME_MAX}.`,
    });
  } else {
    checks.push({ level: "pass", message: "Filename length is fine." });
  }
  if (/\s/.test(n)) {
    checks.push({ level: "warn", message: "Avoid spaces in filenames for the CSV uploader." });
  }
  return checks;
}

export interface MetadataScore {
  score: number; // 0-100
  checks: ComplianceCheck[];
}

export function scoreMetadata(title: string, keywords: string[]): MetadataScore {
  const checks = [...validateTitle(title), ...validateKeywords(keywords)];
  let score = 100;
  for (const c of checks) {
    if (c.level === "fail") score -= 15;
    else if (c.level === "warn") score -= 5;
  }
  return { score: Math.max(0, score), checks };
}

export interface AdobeMetadataRow {
  filename: string;
  title: string;
  keywords: string[]; // ordered by importance
  categoryId: number;
}

const csvCell = (value: string): string => `"${value.replace(/"/g, '""')}"`;

/** Adobe Stock bulk-upload CSV: exact headers Filename,Title,Keywords,Category,Releases */
export function buildAdobeCsv(rows: AdobeMetadataRow[]): string {
  const header = "Filename,Title,Keywords,Category,Releases";
  const lines = rows.map((r) =>
    [
      csvCell(r.filename),
      csvCell(r.title.replace(/,/g, " ")),
      csvCell(r.keywords.join(", ")),
      String(r.categoryId || ""),
      "",
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function downloadAdobeCsv(filename: string, rows: AdobeMetadataRow[]) {
  const blob = new Blob([buildAdobeCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Split pasted keywords on commas or new lines */
export function parseKeywordInput(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}
