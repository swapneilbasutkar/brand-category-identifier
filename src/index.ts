import { BrandClassifier } from "./classifier";

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

export default BrandCategorizer;
