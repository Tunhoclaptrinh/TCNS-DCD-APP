import { apiClient } from '../config/api.client';
import { ENDPOINTS } from '../config/api.config';
import { BaseApiResponse } from '../types/api.types';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export const AIService = {
  sendMessage: async (message: string, context?: any) => {
    return apiClient.post<BaseApiResponse<{ message: string; reply: string }>>(ENDPOINTS.AI.CHAT, { message, context });
  },

  // Future: Get history, etc.
};
