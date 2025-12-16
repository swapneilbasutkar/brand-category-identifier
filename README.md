# Brand Category Identifier

A robust Node.js library to identify brand categories using AI (LangChain + OpenAI + Tavily) with a fallback to a fast Naive Bayes classifier.

## Features

- **AI-Powered Identification**: Uses OpenAI (GPT-4) and Tavily Search to classify any brand with high accuracy and real-time data.
- **Deterministic Pre-processing**: Normalizes brand names to handle variations.
- **Strict Taxonomy**: Classifies into a standardized set of categories (Technology, Automotive, Fashion, etc.).

## Installation

```bash
npm install brand-category-identifier
```

## Usage

### AI Classification (Recommended)

Requires `OPENAI_API_KEY` and `TAVILY_API_KEY`.

```typescript
import { AIBrandClassifier } from "brand-category-identifier";

const classifier = new AIBrandClassifier({
  openAIApiKey: "sk-...",
  tavilyApiKey: "tvly-...",
});

async function main() {
  // Simple usage: Get just the category name
  const category = await classifier.identify("Nvidia");
  console.log(category); // "Technology"

  // Detailed usage: Get category, subcategory, confidence, and source URLs
  const result = await classifier.classify("Impossible Foods");
  console.log(result);
  /*
  {
    category: "Food & Beverage",
    subcategory: "Plant-based Meat Alternatives",
    confidence: "High",
    evidence_sources: ["https://en.wikipedia.org/...", ...]
  }
  */
}

main();
```

### Deterministic/Offline Classification (Legacy)

For internal datasets or offline usage (limited to pre-trained brands).

```typescript
import BrandCategorizer from "brand-category-identifier";

const localClassifier = new BrandCategorizer();
const category = localClassifier.getCategory("Apple"); // "Technology"
```

## Configuration

The `AIBrandClassifier` requires two API keys:

1.  **openAIApiKey**: For the LLM (GPT-4o recommend).
2.  **tavilyApiKey**: For web search to gather context.

NPM Package: https://www.npmjs.com/package/brand-category-identifier

## License

MIT
