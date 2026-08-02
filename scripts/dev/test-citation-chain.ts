// 1. Imports
// Prisma is our ORM (Object-Relational Mapper). It handles database queries safely.
import { prisma } from "@/db";
// This is the specific service containing the business logic we want to test.
import { RetrievalService } from "@/modules/knowledge/services/retrieval.service";

async function main(): Promise<void> {
  // Instantiate the service. In a real app, this might rely on a vector database 
  // (like Pinecone or pgvector) to find text that matches our query.
  const retrievalService = new RetrievalService();

  // The mock input we are using for this test run.
  const query = "What are the symptoms of AIDS?";

  console.log("\n========== CITATION CHAIN TEST ==========\n");

  // 2. Execute the Service
  // We ask the service to fetch the top 5 most relevant 'chunks' of text for our query.
  const result = await retrievalService.retrieve({
    query,
    topK: 5, 
    candidatePoolSize: 20,
    minScore: null, 
  });

  // 3. Basic Validation (Assertions)
  // We explicitly asked for 5 chunks. If we get anything else, the service is broken.
  if (result.chunks.length !== 5) {
    throw new Error(
      `Expected 5 retrieved chunks, received ${result.chunks.length}.`
    );
  }

  // Every chunk of text MUST have an exact corresponding citation (metadata).
  // If the arrays are different lengths, our data mapping is out of sync.
  if (result.citations.length !== result.chunks.length) {
    throw new Error(
      `Citation count mismatch. Chunks: ${result.chunks.length}, citations: ${result.citations.length}.`
    );
  }

  // 4. Deep Data Validation (The "Citation Chain")
  // We iterate through the results to verify the integrity of every single item.
  for (let index = 0; index < result.citations.length; index++) {
    const citation = result.citations[index]; 
    const retrievedChunk = result.chunks[index];

    // Null check: Ensure neither object is undefined at this index.
    if (!citation || !retrievedChunk) {
      throw new Error(`Missing citation or chunk at index ${index}.`);
    }

    /*
     * Verify the Metadata matches the Application Data.
     * We are checking if the citation object correctly maps to the retrieved text object.
     */
    if (citation.chunkId !== retrievedChunk.id) {
      throw new Error(`chunkId mismatch at index ${index}.`);
    }

    if (citation.documentId !== retrievedChunk.documentId) {
      throw new Error(`documentId mismatch at index ${index}.`);
    }

    if (citation.pageNumber !== retrievedChunk.pageNumber) {
      throw new Error(`pageNumber mismatch at index ${index}.`);
    }

    if (citation.sourceTitle !== retrievedChunk.source.title) {
      throw new Error(`sourceTitle mismatch at index ${index}.`);
    }

    /*
     * 5. The "Source of Truth" Database Check
     * We don't just trust the data in memory. We query Postgres directly 
     * to ensure this chunk wasn't mutated or hallucinated by the app layer.
     */
    const databaseChunk = await prisma.chunk.findUnique({
      where: {
        id: citation.chunkId,
      },
      // 'include' tells Prisma to perform a SQL JOIN to get the parent Document table data too.
      include: {
        document: true, 
      },
    });

    // If Prisma returns null, the chunk doesn't actually exist in the DB.
    if (!databaseChunk) {
      throw new Error(`Chunk ${citation.chunkId} does not exist in database.`);
    }

    /*
     * Verify Database references match the Citation metadata.
     */
    if (databaseChunk.documentId !== citation.documentId) {
      throw new Error(`Database documentId mismatch for chunk ${citation.chunkId}.`);
    }

    if (databaseChunk.pageNumber !== citation.pageNumber) {
      throw new Error(`Database pageNumber mismatch for chunk ${citation.chunkId}.`);
    }

    if (databaseChunk.document.title !== citation.sourceTitle) {
      throw new Error(`Database sourceTitle mismatch for chunk ${citation.chunkId}.`);
    }

    // 6. Logging
    // If all assertions pass, print a visual confirmation for the developer running the test.
    console.log({
      rank: index + 1, 
      chunkId: citation.chunkId,
      documentId: citation.documentId,
      pageNumber: citation.pageNumber,
      sourceTitle: citation.sourceTitle,
      databaseVerified: true, 
      // We clean up line breaks (regex \s+) and truncate the string so it fits nicely in the terminal.
      preview: databaseChunk.content.replace(/\s+/g, " ").slice(0, 200),
    });
  }

  // If the script reaches this line without throwing an error, the test is a success.
  console.log("\n✅ CITATION CHAIN TEST PASSED\n");
}

// 7. Script Execution & Error Handling
main()
  .catch((error) => {
    // If ANY of our "throw new Error" statements were triggered, they get caught here.
    console.error("\n❌ CITATION CHAIN TEST FAILED\n");
    console.error(error); // Print the stack trace so the dev can debug.
    
    // Set exit code to 1 (Failure). This ensures CI/CD pipelines (like GitHub Actions) 
    // know the test failed and will block the code from being merged or deployed.
    process.exitCode = 1; 
  })
  .finally(async () => {
    // The 'finally' block runs no matter what (success or crash).
    // We MUST disconnect Prisma, otherwise the database connection stays open and hangs the script.
    await prisma.$disconnect();
  });