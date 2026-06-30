export interface PromptMessage {
  role: "system" | "user";
  content: string;
}

export interface Prompt {
  system:string;
  context:string;
  question:string
}