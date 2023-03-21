import { writable } from 'svelte/store';

export const conversationHistory = writable<{role: string, content: string}[]>([]);
