import { BrandClassifier } from "./classifier";
import {
  AIBrandClassifier,
  BrandClassificationResult,
  VALID_CATEGORIES,
} from "./ai-classifier";
import { normalizeBrandName } from "./utils/normalizer";

// Export the original deterministic classifier
export class BrandCategorizer {
  private classifier: BrandClassifier;

  constructor() {
    this.classifier = new BrandClassifier();
    this.classifier.train();
  }

  /**
   * Identifies the category of a given brand name.
   * @param brandName The name of the brand to identify.
   * @returns The predicted category or 'Unknown' if low confidence/no match.
   */
  public getCategory(brandName: string): string {
    if (!brandName || brandName.trim() === "") {
      throw new Error("Brand name cannot be empty");
    }
    return this.classifier.classify(brandName);
  }

  /**
   * Returns classification probabilities for all categories.
   * @param brandName The name of the brand.
   */
  public getProbabilities(brandName: string) {
    return this.classifier.getClassifications(brandName);
  }
}

// Export the new AI-powered components
export {
  AIBrandClassifier,
  BrandClassificationResult,
  VALID_CATEGORIES,
  BrandIdentifierConfig,
} from "./ai-classifier";
export { normalizeBrandName } from "./utils/normalizer";

export default BrandCategorizer;
