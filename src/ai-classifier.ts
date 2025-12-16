import { ChatOpenAI } from "@langchain/openai";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { normalizeBrandName } from "./utils/normalizer";

// Define the valid categories based on our taxonomy
// We can extend this list as needed.
export const VALID_CATEGORIES = [
  "Technology",
  "Automotive",
  "Fashion",
  "Food & Beverage",
  "Retail",
  "Healthcare", // Added for breadth
  "Finance", // Added for breadth
  "Entertainment", // Added for breadth
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
  private tavilyClient: any;
  private cache: Map<string, BrandClassificationResult>;

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
   * Main method to classify a brand
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

      sources = searchResult.results.map((r: any) => r.url);
      searchContext = searchResult.results
        .map(
          (r: any) => `Title: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`
        )
        .join("\n\n");
    } catch (error) {
      console.error("Search failed:", error);
      // Fallback or handle error. For now, continue with empty context (LLM might know major brands without search)
      searchContext =
        "No external search context available. Rely on internal knowledge.";
    }

    // Step 4: Classify with LLM
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

    // Step 5: Validate and Cache
    // We only cache if confidence is Medium or High to avoid poisoning cache with bad data?
    // Or cache everything to save costs. Let's cache everything for now.
    this.cache.set(normalizedName, finalResult);

    return finalResult;
  }
}
