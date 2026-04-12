import { normalizeBrandName } from "../src/utils/normalizer";

describe("normalizeBrandName", () => {
  test("trims leading and trailing whitespace", () => {
    expect(normalizeBrandName("  Apple  ")).toBe("apple");
  });

  test("lowercases the name", () => {
    expect(normalizeBrandName("GOOGLE")).toBe("google");
    expect(normalizeBrandName("NViDiA")).toBe("nvidia");
  });

  test("strips 'Inc' suffix (no dot)", () => {
    expect(normalizeBrandName("Apple Inc")).toBe("apple");
  });

  test("strips 'Inc.' suffix (with dot)", () => {
    expect(normalizeBrandName("Apple Inc.")).toBe("apple");
  });

  test("strips 'Incorporated' suffix", () => {
    expect(normalizeBrandName("Apple Incorporated")).toBe("apple");
  });

  test("strips 'Ltd' suffix", () => {
    expect(normalizeBrandName("Tata Ltd")).toBe("tata");
  });

  test("strips 'Ltd.' suffix", () => {
    expect(normalizeBrandName("Tata Ltd.")).toBe("tata");
  });

  test("strips 'LLC' suffix (case-insensitive)", () => {
    expect(normalizeBrandName("Startup LLC")).toBe("startup");
  });

  test("strips 'Corp' suffix", () => {
    expect(normalizeBrandName("Microsoft Corp")).toBe("microsoft");
  });

  test("strips 'Corporation' suffix", () => {
    expect(normalizeBrandName("Microsoft Corporation")).toBe("microsoft");
  });

  test("strips 'Co' suffix", () => {
    expect(normalizeBrandName("Toyota Co")).toBe("toyota");
  });

  test("strips 'Company' suffix", () => {
    expect(normalizeBrandName("Ford Motor Company")).toBe("ford motor");
  });

  test("strips 'GmbH' suffix", () => {
    expect(normalizeBrandName("Volkswagen GmbH")).toBe("volkswagen");
  });

  test("strips 'AG' suffix", () => {
    expect(normalizeBrandName("BMW AG")).toBe("bmw");
  });

  test("strips 'PLC' suffix", () => {
    expect(normalizeBrandName("Vodafone PLC")).toBe("vodafone");
  });

  test("strips 'NV' suffix", () => {
    expect(normalizeBrandName("Philips NV")).toBe("philips");
  });

  test("strips 'SA' suffix", () => {
    expect(normalizeBrandName("Renault SA")).toBe("renault");
  });

  test("strips parenthesised content (e.g. ticker symbols)", () => {
    expect(normalizeBrandName("Apple (AAPL)")).toBe("apple");
  });

  test("does not double-strip a plain brand name", () => {
    expect(normalizeBrandName("Nike")).toBe("nike");
  });

  test("does not strip suffix that is part of a word", () => {
    // 'inca' should not be trimmed — only whole-word suffixes at end
    expect(normalizeBrandName("Llinca")).toBe("llinca");
  });

  test("handles empty-ish input gracefully", () => {
    expect(normalizeBrandName("   ")).toBe("");
  });
});
