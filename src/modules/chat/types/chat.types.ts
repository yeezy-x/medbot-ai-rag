export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;

  role:
    | "USER"
    | "ASSISTANT"
    | "SYSTEM";

  content: string;

  createdAt: string;
}