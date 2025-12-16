import dotenv from "dotenv";
import { AIBrandClassifier } from "../src/ai-classifier";

// Load environment variables for API keys
dotenv.config();

async function runTest() {
  const openAIKey = process.env.OPENAI_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!openAIKey || !tavilyKey) {
    console.warn(
      "⚠️  Missing API keys. Please set OPENAI_API_KEY and TAVILY_API_KEY in .env file."
    );
    if (!openAIKey) console.warn(" - Missing OPENAI_API_KEY");
    if (!tavilyKey) console.warn(" - Missing TAVILY_API_KEY");
    // We can't proceed without keys for the real test, but we can instantiate to check basic build
    // return;
  }

  const classifier = new AIBrandClassifier({
    openAIApiKey: openAIKey!,
    tavilyApiKey: tavilyKey!,
  });

  const testBrands = [
    "Nvidia", // Technology
    "Impossible Fods", // Typo intended -> Food
    "Lululemon", // Fashion usually
    "Wlamart", // Typo -> Retail
  ];

  console.log("Starting AI Classification Test...\n");

  for (const brand of testBrands) {
    try {
      console.log(`--- Testing: ${brand} ---`);
      // Test the simple API
      const simpleCategory = await classifier.identify(brand);
      console.log(`Simple Identify Result: "${simpleCategory}"`);

      // Test the detailed API
      const result = await classifier.classify(brand);
      console.log("Detailed Result:", JSON.stringify(result, null, 2));
      console.log("-------------------------\n");
    } catch (error) {
      console.error(`Error classifying ${brand}:`, error);
    }
  }
}

runTest().catch(console.error);
