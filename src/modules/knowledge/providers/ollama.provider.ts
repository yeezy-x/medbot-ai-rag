import { Ollama } from "ollama";

import { EMBEDDING } from "../constants/embedding.constants";

import { EmbeddingProvider } from "./embedding.provider";

import {
  BatchEmbeddingRequest,
  BatchEmbeddingResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "../types/embedding.types";

export class OllamaEmbeddingProvider
  implements EmbeddingProvider
{
  readonly provider = "ollama";

  readonly model = EMBEDDING.MODEL;

  private readonly client: Ollama;

  constructor(client?:Ollama) {
    this.client = client ?? new Ollama({
      host: EMBEDDING.OLLAMA_BASE_URL,
    });
  }

  async embed(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    const response =
      await this.client.embed({
        model: this.model,
        input: request.text,
        keep_alive:
          EMBEDDING.KEEP_ALIVE,
      });

    const values =
      response.embeddings[0];

    return {
      embedding: {
        values,

        dimensions:
          values.length,

        model: this.model,

        metadata: {
          provider:
            this.provider,

          createdAt:
            new Date(),
        },
      },
    };
  }

  async embedBatch(
    request: BatchEmbeddingRequest
  ): Promise<BatchEmbeddingResponse> {

    const response =
      await this.client.embed({
        model: this.model,

        input: request.texts,

        keep_alive:
          EMBEDDING.KEEP_ALIVE,
      });

    return {

      embeddings:
        response.embeddings.map(
          values => ({
            values,

            dimensions:
              values.length,

            model:
              this.model,

            metadata: {

                provider:
                    this.provider,

                createdAt:
                    new Date(),

            },
          })
        ),
    };
  }
}