import { localStorageStore } from "./localStorage";

export interface ConversationEntry {
	role: string;
	content: string;
}
export const conversationHistory = localStorageStore("conversationHistory", []);
