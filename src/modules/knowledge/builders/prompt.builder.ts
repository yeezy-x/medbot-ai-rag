import { ContextWindow } from "../types/context.types";
import { Prompt } from "../types/prompt.types";

export class PromptBuilder {

  build(
    question: string,
    context: ContextWindow
  ): Prompt {

    return {

      system:
        this.buildSystemPrompt(),

      context:
        context.text,

      question,
    };
  }

  private buildSystemPrompt(): string {

    return `
You are MedBot, an AI medical assistant.

Answer ONLY using the supplied medical context.

If the answer is not present in the context,
state that you don't have enough information.

Never fabricate medical information.

Always cite the source page when possible.
`.trim();

  }

}