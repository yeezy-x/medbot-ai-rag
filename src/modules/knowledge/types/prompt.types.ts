export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Prompt {
  system:string;
  context:string;
  question:string
}