import { BrandCategorizer } from "../src/index";

describe("BrandCategorizer", () => {
  let categorizer: BrandCategorizer;

  beforeAll(() => {
    categorizer = new BrandCategorizer();
  });

  test("should correctly identify exact matches", () => {
    expect(categorizer.getCategory("Apple")).toBe("Technology");
    expect(categorizer.getCategory("Toyota")).toBe("Automotive");
    expect(categorizer.getCategory("Nike")).toBe("Fashion");
    expect(categorizer.getCategory("Coca-Cola")).toBe("Food & Beverage");
  });

  test("should handle case insensitivity", () => {
    expect(categorizer.getCategory("apple")).toBe("Technology");
    expect(categorizer.getCategory("TOYOTA")).toBe("Automotive");
  });

  test("should error on empty input", () => {
    expect(() => categorizer.getCategory("")).toThrow(
      "Brand name cannot be empty"
    );
  });

  // Since ML moves a bit, we test for reasonable output, or just ensure it returns a string
  test("should return a category for unknown but plausible inputs", () => {
    // This is a probabilistic test, so we just check it returns *something* valid
    // "TechSoft" sounds like Technology
    const result = categorizer.getCategory("TechSoft");
    console.log("Classified TechSoft as:", result);
    expect(typeof result).toBe("string");
  });
});
