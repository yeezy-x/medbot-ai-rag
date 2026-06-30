import { RetrievalService } from "./retrieval.service";

import { ContextBuilder } from "../builders/context.builder";

import { PromptBuilder } from "../builders/prompt.builder";

import {RAGContext,RAGRequest} from "../types/rag.types";

export class RAGService {

  constructor(

    private readonly retrievalService =
      new RetrievalService(),

    private readonly contextBuilder =
      new ContextBuilder(),

    private readonly promptBuilder =
      new PromptBuilder()

  ) {}

  async buildContext(
    request: RAGRequest
  ): Promise<RAGContext> {

    throw new Error(
      "Method not implemented."
    );

  }

}