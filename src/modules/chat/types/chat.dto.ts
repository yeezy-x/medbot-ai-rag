export interface CreateChatDto {
  title: string;
}

export interface DeleteChatDto {
  chatId: string;
}

export interface AskQuestionDto {
  sessionId: string;
  message: string;
}