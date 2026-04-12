import { ChatOpenAI } from "@langchain/openai";
import { tavily, TavilyClient } from "@tavily/core";
import { z } from "zod";
import { normalizeBrandName } from "./utils/normalizer";
import { BrandClassifier } from "./classifier";

// Define the valid categories based on our taxonomy
// We can extend this list as needed.
export const VALID_CATEGORIES = [
  "Technology",
  "Automotive",
  "Fashion",
  "Food & Beverage",
  "Retail",
  "Healthcare",
  "Finance",
  "Entertainment",
  "Other",
] as const;

// Define the schema for the LLM output
const ClassificationSchema = z.object({
  category: z
    .enum(VALID_CATEGORIES)
    .describe("The primary industry category of the brand"),
  subcategory: z
    .string()
    .nullable()
    .describe(
      "A more specific sub-industry (e.g., 'Smartphone', 'Luxury Cars') or null if not applicable"
    ),
  confidence: z
    .enum(["High", "Medium", "Low"])
    .describe("Confidence level of the classification based on evidence"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this category was chosen"),
});

export type BrandClassificationResult = z.infer<typeof ClassificationSchema> & {
  evidence_sources: string[];
};

export interface BrandIdentifierConfig {
  openAIApiKey: string;
  tavilyApiKey: string;
}

export class AIBrandClassifier {
  private llm: ChatOpenAI;
  private tavilyClient: TavilyClient;
  private cache: Map<string, BrandClassificationResult>;
  private fallbackClassifier: BrandClassifier;

  constructor(config: BrandIdentifierConfig) {
    if (!config.openAIApiKey || !config.tavilyApiKey) {
      throw new Error("Both openAIApiKey and tavilyApiKey are required.");
    }

    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      apiKey: config.openAIApiKey,
    });

    this.tavilyClient = tavily({
      apiKey: config.tavilyApiKey,
    });

    this.cache = new Map();
    this.fallbackClassifier = new BrandClassifier();
    this.fallbackClassifier.train();
  }

  /**
   * Identifies the category of a brand and returns just the category name.
   * This is the main method for most users.
   */
  async identify(brandName: string): Promise<string> {
    const result = await this.classify(brandName);
    return result.category;
  }

  /**
   * Main method to classify a brand. Falls back to the deterministic classifier
   * if the LLM call fails.
   */
  async classify(inputName: string): Promise<BrandClassificationResult> {
    // Step 1: Normalize
    const normalizedName = normalizeBrandName(inputName);

    // Check Cache
    if (this.cache.has(normalizedName)) {
      console.log(
        `[Cache Hit] Returning cached result for "${normalizedName}"`
      );
      return this.cache.get(normalizedName)!;
    }

    console.log(
      `[Processing] Classifying brand: "${inputName}" (normalized: "${normalizedName}")`
    );

    // Step 2 & 3: Web Search & Extract Evidence
    let searchContext = "";
    let sources: string[] = [];

    try {
      const searchResult = await this.tavilyClient.search(
        normalizedName + " brand company profile industry",
        {
          search_depth: "basic",
          max_results: 5,
          include_domains: [
            "wikipedia.org",
            "linkedin.com",
            "bloomberg.com",
            "crunchbase.com",
            "official-site",
          ],
        }
      );

      sources = searchResult.results.map((r) => r.url);
      searchContext = searchResult.results
        .map(
          (r) => `Title: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`
        )
        .join("\n\n");
    } catch (error) {
      console.error("Search failed:", error);
      searchContext =
        "No external search context available. Rely on internal knowledge.";
    }

    // Step 4: Classify with LLM, fall back to deterministic classifier on failure
    try {
      const structuredLlm = this.llm.withStructuredOutput(ClassificationSchema);

      const prompt = `
    You are an expert industry analyst.
    Your task is to identify the brand category for the brand: "${inputName}".

    Use the following search context as evidence:
    ---
    ${searchContext}
    ---

    Allowed Categories: ${VALID_CATEGORIES.join(", ")}

    If the brand is ambiguous or unknown, set confidence to "Low" and category to "Other".
    `;

      const result = await structuredLlm.invoke(prompt);

      const finalResult: BrandClassificationResult = {
        ...result,
        evidence_sources: sources,
      };

      this.cache.set(normalizedName, finalResult);
      return finalResult;
    } catch (llmError) {
      console.error(
        "[LLM Fallback] LLM classification failed, falling back to deterministic classifier:",
        llmError
      );

      const fallbackCategory = this.fallbackClassifier.classify(normalizedName);
      const fallbackResult: BrandClassificationResult = {
        category: (VALID_CATEGORIES.includes(fallbackCategory as typeof VALID_CATEGORIES[number])
          ? fallbackCategory
          : "Other") as typeof VALID_CATEGORIES[number],
        subcategory: null,
        confidence: "Low",
        reasoning: "LLM unavailable; result from deterministic fallback classifier.",
        evidence_sources: [],
      };

      this.cache.set(normalizedName, fallbackResult);
      return fallbackResult;
    }
  }
}
