import { apiClient } from '@/lib/api-client';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export const aiService = {
  async chat(messages: ChatMessage[]): Promise<{ reply: string }> {
    const res = await apiClient.post<{ reply: string }>('/ai/chat', { messages });
    return res.data;
  },
  async summary(): Promise<{ overview: any; endpoints: string[] }> {
    const res = await apiClient.get<{ overview: any; endpoints: string[] }>('/ai/summary');
    return res.data;
  }
};
