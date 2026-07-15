import {
  ContextChunk,
  ContextWindow,
} from "../types/context.types";

import {
  RetrievedChunk,
} from "../types/retrieval.types";

import {
  MAX_CONTEXT_CHARACTERS,
} from "../constants/context.constants";

// This is a visual divider that helps the AI model understand where one document ends 
// and a completely different document begins. It prevents the AI from blending facts together.
const CONTEXT_SEPARATOR = "\n\n------------------------------\n\n";

export class ContextBuilder {
  /**
   * The main orchestrator. It takes a raw list of search results from the database
   * and packs them into a single string that is safe to send to an AI model.
   */
  build(chunks: RetrievedChunk[]): ContextWindow {
    
    // GUARD CLAUSE: Always handle the "empty state" first. 
    // If the database found no matching results, we return an empty context immediately 
    // so we don't waste CPU cycles running the rest of the code.
    if (chunks.length === 0) {
      return {
        chunks: [],
        text: "",
        totalCharacters: 0,
        totalEstimatedTokens: 0,
      };
    }

    // We use two arrays to keep track of our work: 
    // one for the structured data (acceptedChunks) and one for the raw text strings (formattedParts).
    const acceptedChunks: ContextChunk[] = [];
    const formattedParts: string[] = [];

    let totalCharacters = 0;

    // Loop through the search results one by one, starting with the most relevant.
    for (const chunk of chunks) {
      // 1. Strip away heavy database metadata and keep only what we need.
      const contextChunk = this.mapChunk(chunk);

      // 2. Turn the data object into a readable string for the AI.
      const formatted = this.formatChunk(contextChunk);

      // 3. Figure out how many characters the separator adds. 
      // (We don't add a separator before the very first chunk).
      const separatorLength =
        formattedParts.length > 0 ? CONTEXT_SEPARATOR.length : 0;

      // 4. Calculate what our total character count WOULD be if we add this chunk.
      const nextTotal = totalCharacters + separatorLength + formatted.length;

      // 5. THE BOUNCER: AI models crash if you send them too much text.
      // If adding this chunk pushes us over our maximum limit, we completely stop the loop using `break`.
      // Any remaining chunks are intentionally left out to protect the AI.
      if (nextTotal > MAX_CONTEXT_CHARACTERS) {
        break; 
      }

      // 6. If we passed the safety check, permanently add this chunk to our context window.
      acceptedChunks.push(contextChunk);
      formattedParts.push(formatted);
      
      // Update our running total for the next loop iteration.
      totalCharacters = nextTotal;
    }

    // Stitch all the individual strings together into one giant text block, 
    // inserting our visual separator between each one.
    const text = formattedParts.join(CONTEXT_SEPARATOR);

    // Return the finalized package to be sent to the LLM.
    return {
      chunks: acceptedChunks,
      text,
      totalCharacters: text.length,
      totalEstimatedTokens: this.estimateTokens(text),
    };
  }

  /**
   * HELPER: Data Transformation (Mapping)
   * A "RetrievedChunk" likely has a lot of heavy database relationships (timestamps, foreign keys).
   * We map it into a leaner "ContextChunk" that only contains exactly what the AI needs.
   */
  private mapChunk(chunk: RetrievedChunk): ContextChunk {
    return {
      id: chunk.id,
      content: chunk.content,
      source: chunk.source.title,
      pageNumber: chunk.pageNumber,
    };
  }

  /**
   * HELPER: String Formatting
   * We format the text so the AI can easily cite its sources. 
   * It looks like this:
   * * Source: Biology 101
   * Page: 42
   * * The mitochondria is the powerhouse of the cell...
   */
  private formatChunk(chunk: ContextChunk): string {
    // If the database didn't have a page number for this chunk, default to "Unknown" 
    // so we don't accidentally print "Page: undefined" to the AI.
    const page =
      chunk.pageNumber !== undefined
        ? `Page: ${chunk.pageNumber}`
        : "Page: Unknown";

    return [
      `Source: ${chunk.source}`,
      page,
      "", // Creates an empty line break between the metadata and the actual content
      chunk.content,
    ].join("\n");
  }

  /**
   * HELPER: Token Math
   * AI providers (like OpenAI or Anthropic) charge money based on "tokens", not characters.
   * A token is roughly a syllable or a chunk of a word.
   * The industry standard rule-of-thumb for English is that 1 token ≈ 4 characters.
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}