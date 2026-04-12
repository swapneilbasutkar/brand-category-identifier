import { BrandCategorizer } from "../src/index";

describe("BrandCategorizer", () => {
  let categorizer: BrandCategorizer;

  beforeAll(() => {
    categorizer = new BrandCategorizer();
  });

  // --- Exact match ---
  describe("exact match", () => {
    test("identifies Technology brands", () => {
      expect(categorizer.getCategory("Apple")).toBe("Technology");
      expect(categorizer.getCategory("Microsoft")).toBe("Technology");
      expect(categorizer.getCategory("Nvidia")).toBe("Technology");
    });

    test("identifies Automotive brands", () => {
      expect(categorizer.getCategory("Toyota")).toBe("Automotive");
      expect(categorizer.getCategory("BMW")).toBe("Automotive");
    });

    test("identifies Fashion brands", () => {
      expect(categorizer.getCategory("Nike")).toBe("Fashion");
      expect(categorizer.getCategory("Gucci")).toBe("Fashion");
    });

    test("identifies Food & Beverage brands", () => {
      expect(categorizer.getCategory("Coca-Cola")).toBe("Food & Beverage");
      expect(categorizer.getCategory("McDonald's")).toBe("Food & Beverage");
    });

    test("identifies Retail brands", () => {
      expect(categorizer.getCategory("Amazon")).toBe("Retail");
      expect(categorizer.getCategory("IKEA")).toBe("Retail");
    });

    test("identifies Healthcare brands", () => {
      expect(categorizer.getCategory("Pfizer")).toBe("Healthcare");
      expect(categorizer.getCategory("Merck")).toBe("Healthcare");
    });

    test("identifies Finance brands", () => {
      expect(categorizer.getCategory("Visa")).toBe("Finance");
      expect(categorizer.getCategory("PayPal")).toBe("Finance");
    });

    test("identifies Entertainment brands", () => {
      expect(categorizer.getCategory("Netflix")).toBe("Entertainment");
      expect(categorizer.getCategory("Spotify")).toBe("Entertainment");
    });
  });

  // --- Case insensitivity (now handled by normalizer in classifier) ---
  describe("case insensitivity", () => {
    test("handles all-lowercase input", () => {
      expect(categorizer.getCategory("apple")).toBe("Technology");
      expect(categorizer.getCategory("toyota")).toBe("Automotive");
    });

    test("handles all-uppercase input", () => {
      expect(categorizer.getCategory("NIKE")).toBe("Fashion");
      expect(categorizer.getCategory("NETFLIX")).toBe("Entertainment");
    });

    test("handles mixed-case input", () => {
      expect(categorizer.getCategory("SpOtIfY")).toBe("Entertainment");
    });
  });

  // --- Corporate suffix stripping (normalizer integration) ---
  describe("corporate suffix stripping", () => {
    test("strips 'Inc' suffix before matching", () => {
      expect(categorizer.getCategory("Apple Inc")).toBe("Technology");
    });

    test("strips 'Inc.' suffix before matching", () => {
      expect(categorizer.getCategory("Apple Inc.")).toBe("Technology");
    });

    test("strips 'Corporation' suffix before matching", () => {
      expect(categorizer.getCategory("Microsoft Corporation")).toBe("Technology");
    });

    test("strips 'Ltd' suffix before matching", () => {
      expect(categorizer.getCategory("Toyota Ltd")).toBe("Automotive");
    });

    test("strips 'AG' suffix before matching", () => {
      expect(categorizer.getCategory("BMW AG")).toBe("Automotive");
    });
  });

  // --- Error handling ---
  describe("error handling", () => {
    test("throws on empty string", () => {
      expect(() => categorizer.getCategory("")).toThrow(
        "Brand name cannot be empty"
      );
    });

    test("throws on whitespace-only string", () => {
      expect(() => categorizer.getCategory("   ")).toThrow(
        "Brand name cannot be empty"
      );
    });
  });

  // --- Probabilistic / unknown brands ---
  describe("unknown brands", () => {
    test("returns a non-empty string for an unrecognised brand", () => {
      const result = categorizer.getCategory("TechSoft");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // --- getProbabilities ---
  describe("getProbabilities", () => {
    test("returns an array of classifications for a known brand", () => {
      const probs = categorizer.getProbabilities("Apple");
      expect(Array.isArray(probs)).toBe(true);
      expect(probs.length).toBeGreaterThan(0);
      expect(probs[0]).toHaveProperty("label");
      expect(probs[0]).toHaveProperty("value");
    });
  });
});
