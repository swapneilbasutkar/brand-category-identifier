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

  // Remove common suffixes
  const suffixes = [
    " inc",
    " inc.",
    " incorporated",
    " ltd",
    " ltd.",
    " limited",
    " llc",
    " llc.",
    " corp",
    " corp.",
    " corporation",
    " co",
    " co.",
    " company",
    " plc",
    " plc.",
    " gmbh",
    " sa",
    " s.a.",
    " pvt",
    " pvt.",
    " nv",
    " n.v.",
    " ag",
  ];

  // We want to verify it ends with one of these, so we use a regex
  // Create a regex like: /\s+(inc|ltd|llc)\.?$/
  const suffixPattern = new RegExp(
    `\\s+(${suffixes.map((s) => s.trim().replace(".", "\\.")).join("|")})\\.?$`,
    "i"
  );

  normalized = normalized.replace(suffixPattern, "");

  // Remove punctuation (keep alphanumeric and spaces)
  normalized = normalized.replace(/[^\w\s]/g, "");

  return normalized.trim();
}
