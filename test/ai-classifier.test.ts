import { AIBrandClassifier, BrandClassificationResult, VALID_CATEGORIES } from "../src/ai-classifier";

// ---------------------------------------------------------------------------
// Mock external dependencies so tests run without real API keys
// ---------------------------------------------------------------------------
jest.mock("@langchain/openai", () => {
  return {
    ChatOpenAI: jest.fn().mockImplementation(() => ({
      withStructuredOutput: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          category: "Technology",
          subcategory: "Semiconductors",
          confidence: "High",
          reasoning: "Nvidia is a semiconductor company.",
        }),
      }),
    })),
  };
});

jest.mock("@tavily/core", () => {
  return {
    tavily: jest.fn().mockReturnValue({
      search: jest.fn().mockResolvedValue({
        results: [
          {
            url: "https://en.wikipedia.org/wiki/Nvidia",
            title: "Nvidia",
            content: "Nvidia is a technology company specializing in GPUs.",
          },
        ],
      }),
    }),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeClassifier() {
  return new AIBrandClassifier({
    openAIApiKey: "test-openai-key",
    tavilyApiKey: "test-tavily-key",
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("AIBrandClassifier", () => {
  describe("constructor", () => {
    test("throws when openAIApiKey is missing", () => {
      expect(
        () =>
          new AIBrandClassifier({ openAIApiKey: "", tavilyApiKey: "tvly-key" })
      ).toThrow("Both openAIApiKey and tavilyApiKey are required.");
    });

    test("throws when tavilyApiKey is missing", () => {
      expect(
        () =>
          new AIBrandClassifier({ openAIApiKey: "sk-key", tavilyApiKey: "" })
      ).toThrow("Both openAIApiKey and tavilyApiKey are required.");
    });

    test("constructs successfully with both keys", () => {
      expect(() => makeClassifier()).not.toThrow();
    });
  });

  describe("classify", () => {
    test("returns a valid BrandClassificationResult shape", async () => {
      const classifier = makeClassifier();
      const result = await classifier.classify("Nvidia");

      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("subcategory");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("reasoning");
      expect(result).toHaveProperty("evidence_sources");
      expect(Array.isArray(result.evidence_sources)).toBe(true);
    });

    test("category is always one of the VALID_CATEGORIES", async () => {
      const classifier = makeClassifier();
      const result = await classifier.classify("Nvidia");
      expect(VALID_CATEGORIES).toContain(result.category);
    });

    test("confidence is one of High / Medium / Low", async () => {
      const classifier = makeClassifier();
      const result = await classifier.classify("Nvidia");
      expect(["High", "Medium", "Low"]).toContain(result.confidence);
    });

    test("evidence_sources contains URLs from search results", async () => {
      const classifier = makeClassifier();
      const result = await classifier.classify("Nvidia");
      expect(result.evidence_sources).toContain(
        "https://en.wikipedia.org/wiki/Nvidia"
      );
    });
  });

  describe("identify", () => {
    test("returns just the category string", async () => {
      const classifier = makeClassifier();
      const category = await classifier.identify("Nvidia");
      expect(typeof category).toBe("string");
      expect(VALID_CATEGORIES).toContain(category);
    });
  });

  describe("caching", () => {
    test("returns the same result on a second call without invoking the LLM again", async () => {
      const { ChatOpenAI } = require("@langchain/openai");
      const mockInvoke = jest.fn().mockResolvedValue({
        category: "Technology",
        subcategory: null,
        confidence: "High",
        reasoning: "Cached test",
      });
      ChatOpenAI.mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvoke }),
      }));

      const classifier = makeClassifier();
      await classifier.classify("Nvidia");
      await classifier.classify("Nvidia"); // second call — should hit cache

      // LLM invoke should only have been called once
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    test("normalized names hit the same cache entry", async () => {
      const { ChatOpenAI } = require("@langchain/openai");
      const mockInvoke = jest.fn().mockResolvedValue({
        category: "Technology",
        subcategory: null,
        confidence: "High",
        reasoning: "Cached test",
      });
      ChatOpenAI.mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvoke }),
      }));

      const classifier = makeClassifier();
      await classifier.classify("Apple Inc.");
      await classifier.classify("Apple Inc"); // different suffix form, same normalized key

      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });
  });

  describe("LLM fallback", () => {
    test("falls back to deterministic classifier when LLM throws", async () => {
      const { ChatOpenAI } = require("@langchain/openai");
      ChatOpenAI.mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: jest.fn().mockRejectedValue(new Error("LLM timeout")),
        }),
      }));

      const classifier = makeClassifier();
      const result = await classifier.classify("Apple");

      // Should return a valid result, not throw
      expect(VALID_CATEGORIES).toContain(result.category);
      expect(result.confidence).toBe("Low");
      expect(result.evidence_sources).toEqual([]);
    });

    test("fallback result has the expected shape", async () => {
      const { ChatOpenAI } = require("@langchain/openai");
      ChatOpenAI.mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: jest.fn().mockRejectedValue(new Error("LLM unavailable")),
        }),
      }));

      const classifier = makeClassifier();
      const result = await classifier.classify("Netflix");

      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("subcategory", null);
      expect(result).toHaveProperty("confidence", "Low");
      expect(result).toHaveProperty("reasoning");
      expect(result).toHaveProperty("evidence_sources");
    });
  });

  describe("search failure graceful handling", () => {
    test("still classifies when Tavily search fails", async () => {
      const { tavily } = require("@tavily/core");
      tavily.mockReturnValue({
        search: jest.fn().mockRejectedValue(new Error("Search API down")),
      });

      // Restore a working LLM mock
      const { ChatOpenAI } = require("@langchain/openai");
      ChatOpenAI.mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: jest.fn().mockResolvedValue({
            category: "Technology",
            subcategory: null,
            confidence: "Medium",
            reasoning: "Based on internal knowledge only.",
          }),
        }),
      }));

      const classifier = makeClassifier();
      const result = await classifier.classify("Nvidia");

      expect(VALID_CATEGORIES).toContain(result.category);
      expect(result.evidence_sources).toEqual([]);
    });
  });
});
