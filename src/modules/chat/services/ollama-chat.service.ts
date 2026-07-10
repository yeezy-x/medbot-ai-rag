import { OllamaChatRequest, OllamaChatResponse } from "../types/ollama.types";

/**
 * OllamaChatService
 * 
 * Serves as the isolation boundary between the MedBot Next.js backend and the 
 * local Ollama AI engine. It handles HTTP requests to Ollama, payload formatting, 
 * and strict error boundary isolation so network failures do not corrupt the database.
 */
export class OllamaChatService {
  constructor(
    // 1. Configuration: Defaults to standard local Ollama port. 
    // In a production environment, this should ideally be injected via environment variables.
    private readonly baseUrl = "http://localhost:11434"
  ) {}

  /**
   * Generates a response using Ollama's native `/api/generate` endpoint.
   * 
   * @param request - The typed request object (typically contains `model`, `prompt`, and `stream`).
   * @returns The parsed and typed response from the LLM.
   */
  async generate(
    request: OllamaChatRequest
  ): Promise<OllamaChatResponse> {
    // 2. Delegation: Passes the endpoint and strict typings to the reusable 'post' method.
    return this.post<OllamaChatResponse>(
      "/api/generate",
      request
    );
  }

  /**
   * Internal utility to handle the HTTP POST boundary to the local LLM.
   * 
   * @param endpoint - The specific Ollama API path (e.g., "/api/generate").
   * @param body - The payload to serialize and send.
   */
  private async post<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    
    // 3. Execution: Initiate the HTTP POST request to the local inference engine.
    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Serialize the TypeScript object into a strict JSON string
        body: JSON.stringify(body),
      }
    );

    // 4. Boundary Error Isolation: Trap non-200 HTTP responses immediately.
    // This prevents the orchestrator (ChatService) from persisting empty/broken data to PostgreSQL.
    if (!response.ok) {
        
      // Specifically trap 404 errors (the exact issue you were facing previously)
      if (response.status === 404) {
        // Extract the model name from the body if possible for a better error message
        const modelName = (body as Record<string, unknown>)?.model || 'your-model';
        throw new Error(
          `[OllamaChatService] Boundary Error: 404 Not Found.\n` +
          `Endpoint: ${this.baseUrl}${endpoint}\n` +
          `Fix: Open your terminal and run 'ollama pull ${modelName}' to ensure the model is downloaded locally.`
        );
      }

      // Generic fallback for other HTTP failures (e.g., 500 Internal Server Error)
      throw new Error(
        `[OllamaChatService] Request failed: ${response.status} ${response.statusText}`
      );
    }

    // 5. Resolution: Parse and return the successful JSON response.
    // This is passed back up to the ChatService for database persistence.
    return response.json() as Promise<T>;
  }
}