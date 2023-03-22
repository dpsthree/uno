import { localStorageStore } from "./localStorage";

export interface ConversationEntry {
  user: { role: 'user', content: string}
  assistant: { role: 'assistant', content: string}
}
export const conversationHistory = localStorageStore<ConversationEntry[]>("conversationHistory", []);
