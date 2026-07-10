import { ContextWindow } from "../types/context.types";
import { Prompt } from "../types/prompt.types";
import { RAGConversationMessage } from "../types/rag.types";

export class PromptBuilder {
  build(
    question: string,
    context: ContextWindow,
    history: RAGConversationMessage[]
  ): Prompt {
    const formattedHistory = history
      .map((message) => {
        const role =
          message.role === "USER"
            ? "User"
            : message.role === "ASSISTANT"
              ? "MedBot"
              : "System";

        return `${role}: ${message.content}`;
      })
      .join("\n\n");

    const finalPromptText = `
<medical_context>
${context.text}
</medical_context>

<conversation_history>
${formattedHistory}
</conversation_history>

<current_user_question>
${question}
</current_user_question>
    `.trim();

    return {
      system: this.buildSystemPrompt(),
      context: finalPromptText,
      question,
    };
  }

  private buildSystemPrompt(): string {
    return `
You are MedBot, an empathetic and highly accurate AI medical assistant.

Guidelines:

1. If the user makes casual conversation, such as greetings or sharing their name, respond naturally using the Conversation History.

2. For medical questions, answer ONLY using the supplied Medical Context.

3. If a medical question cannot be answered by the Medical Context, politely state that you do not have enough information.

4. Never fabricate or hallucinate medical information or diagnoses.

5. When source page information is available, cite it when providing medical facts.
    `.trim();
  }
}