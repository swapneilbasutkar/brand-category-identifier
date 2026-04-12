/**
 * Normalizes a brand name for consistent processing.
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes common corporate suffixes (inc, ltd, llc, etc.)
 * - Removes punctuation
 */
export function normalizeBrandName(name: string): string {
  let normalized = name.trim().toLowerCase();

  // Remove content in parentheses (often ticker symbols or extra info)
  normalized = normalized.replace(/\s*\(.*?\)\s*/g, "");

  // Remove common corporate suffixes (without trailing dots — the regex handles optional dots)
  const suffixes = [
    "incorporated",
    "corporation",
    "company",
    "limited",
    "gmbh",
    "pvt",
    "corp",
    "inc",
    "ltd",
    "llc",
    "plc",
    "co",
    "sa",
    "nv",
    "ag",
  ];

  // Match a whitespace-separated suffix at the end, with an optional trailing dot
  const suffixPattern = new RegExp(
    `\\s+(${suffixes.join("|")})\\.?$`,
    "i"
  );

  normalized = normalized.replace(suffixPattern, "");

  // Remove punctuation (keep alphanumeric and spaces)
  normalized = normalized.replace(/[^\w\s]/g, "");

  return normalized.trim();
}
