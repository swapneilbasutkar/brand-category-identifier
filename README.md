# Brand Category Identifier

A lightweight, zero-dependency (runtime) Node.js library to identify the category of a brand based on its name. It uses a hybrid approach of exact matching and a Naive Bayes classifier (via `natural`) for accurate and robust predictions.

## Installation

```bash
npm install brand-category-identifier
```

## Usage

```typescript
import { BrandCategorizer } from "brand-category-identifier";

const categorizer = new BrandCategorizer();

// Exact match examples
console.log(categorizer.getCategory("Apple")); // Output: "Technology"
console.log(categorizer.getCategory("Toyota")); // Output: "Automotive"

// Case insensitive
console.log(categorizer.getCategory("nike")); // Output: "Fashion"

// ML-based prediction for unknown brands (heuristics)
console.log(categorizer.getCategory("TechSoft")); // Output: "Technology" (Predicted)
```

## Features

- **Hybrid Classification**: Uses a dictionary of common brands for 100% accuracy on known entities, and a Naive Bayes classifier for unknown inputs.
- **Zero External API Dependencies**: Runs entirely locally. No OpenAI/Gemini keys required.
- **Lightweight**: Fast to regular expressions and simple probability calculations.
- **TypeScript Support**: Written in TypeScript with full type definitions included.

## Supported Categories (Initial Dataset)

- Technology
- Automotive
- Fashion
- Food & Beverage
- Retail

## License

ISC
