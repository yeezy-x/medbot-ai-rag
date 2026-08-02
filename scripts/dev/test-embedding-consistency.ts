import {
  OllamaEmbeddingProvider,
} from "@/modules/knowledge/providers/ollama.provider";

async function main(): Promise<void> {
  // 1. Setup: Instantiate the provider that communicates with the Ollama service
  const provider = new OllamaEmbeddingProvider();

  // 2. Define Test Cases
  // Inputs A and B are exactly the same to test for consistency (determinism).
  const inputA = "What are the symptoms of diabetes?";
  const inputB = "What are the symptoms of diabetes?";
  
  // Input C is uniquely different to ensure the model actually differentiates text.
  const inputC = "How is tuberculosis diagnosed?";

  console.log("\n========== EMBEDDING CONSISTENCY TEST ==========\n");

  // 3. Execution & Benchmarking
  // Generate and time the embedding for Input A
  console.time("Embedding A");
  const responseA = await provider.embed({ text: inputA });
  console.timeEnd("Embedding A");

  // Generate and time the embedding for Input B
  console.time("Embedding B");
  const responseB = await provider.embed({ text: inputB });
  console.timeEnd("Embedding B");

  // Generate and time the embedding for Input C
  console.time("Embedding C");
  const responseC = await provider.embed({ text: inputC });
  console.timeEnd("Embedding C");

  // 4. Data Extraction
  // Extract the raw array of floating-point numbers (the vector) from the responses
  const vectorA = responseA.embedding.values;
  const vectorB = responseB.embedding.values;
  const vectorC = responseC.embedding.values;

  // Calculate the length (dimensions) of each vector
  const dimensionsA = vectorA.length;
  const dimensionsB = vectorB.length;
  const dimensionsC = vectorC.length;

  // 5. Validation Logic
  // Check if A and B are perfectly identical (they should be)
  const identicalInputsMatch = vectorsAreEqual(vectorA, vectorB);

  // Check if A and C are different (they should be)
  const differentInputsDiffer = !vectorsAreEqual(vectorA, vectorC);

  // Combine all vectors into one giant array and ensure every number is finite 
  // (Prevents silent failures where a model returns NaN or Infinity)
  const allFinite = [...vectorA, ...vectorB, ...vectorC].every(Number.isFinite);

  // 6. Reporting
  console.log("\n========== RESULTS ==========\n");

  // Print a clean visual table of the boolean and numeric results
  console.table({
    dimensionsA,
    dimensionsB,
    dimensionsC,
    identicalInputsMatch,
    differentInputsDiffer,
    allFinite,
  });

  // Print a small sample of the actual vector data for visual inspection
  console.log("\nFirst 5 values of vector A:");
  console.log(vectorA.slice(0, 5));

  console.log("\nFirst 5 values of vector B:");
  console.log(vectorB.slice(0, 5));

  console.log("\nFirst 5 values of vector C:");
  console.log(vectorC.slice(0, 5));

  /*
   * 7. Strict Assertions
   * If any of these conditions fail, the script throws an error and crashes.
   * This is standard practice for CI/CD pipelines to ensure tests fail loudly.
   */

  // Enforce a strict 768-dimension limit 
  if (
    dimensionsA !== 768 ||
    dimensionsB !== 768 ||
    dimensionsC !== 768
  ) {
    throw new Error(
      `Expected 768 dimensions, received: ${dimensionsA}, ${dimensionsB}, ${dimensionsC}`
    );
  }

  // Fail if the same text resulted in different vectors
  if (!identicalInputsMatch) {
    throw new Error("Identical inputs produced different embeddings.");
  }

  // Fail if different text somehow resulted in the exact same vector
  if (!differentInputsDiffer) {
    throw new Error("Different inputs unexpectedly produced identical embeddings.");
  }

  // Fail if the data is corrupted with NaN or Infinity
  if (!allFinite) {
    throw new Error("Embedding contains NaN or Infinity.");
  }

  // If the script gets here, all assertions passed
  console.log("\n✅ EMBEDDING CONSISTENCY TEST PASSED\n");
}

/**
 * Helper function to compare two arrays of numbers.
 * It checks if they are the exact same length, and then checks
 * if every single number at every index perfectly matches.
 */
function vectorsAreEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

// 8. Script Entry Point & Error Handling
// Runs the main function. If an assertion throws an error, it is caught here,
// logged in red (standard error), and forces the Node process to exit with a failure code (1).
main().catch((error) => {
  console.error("\n❌ EMBEDDING CONSISTENCY TEST FAILED\n");
  console.error(error);
  process.exit(1);
});