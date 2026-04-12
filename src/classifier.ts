import { BayesClassifier } from "natural";
import { brands, BrandData } from "./data/brands";
import { normalizeBrandName } from "./utils/normalizer";

export class BrandClassifier {
  private classifier: BayesClassifier;
  private isTrained: boolean = false;

  constructor() {
    this.classifier = new BayesClassifier();
  }

  public train(): void {
    if (this.isTrained) return;

    brands.forEach((brand: BrandData) => {
      this.classifier.addDocument(brand.name, brand.category);
    });

    this.classifier.train();
    this.isTrained = true;
  }

  public classify(brandName: string): string {
    if (!this.isTrained) {
      this.train();
    }
    const normalized = normalizeBrandName(brandName);
    // Simple exact match check first for 100% accuracy on known data
    const exactMatch = brands.find(
      (b) => normalizeBrandName(b.name) === normalized
    );
    if (exactMatch) {
      return exactMatch.category;
    }

    return this.classifier.classify(normalized);
  }

  public getClassifications(brandName: string) {
    if (!this.isTrained) {
      this.train();
    }
    return this.classifier.getClassifications(normalizeBrandName(brandName));
  }
}
