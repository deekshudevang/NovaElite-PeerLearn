import { apiClient } from '@/lib/api-client';

export interface ChatRoom {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  participants: Array<string | {
    _id?: string;
    id?: string;
    full_name: string;
  }>;
  subject?: string;
  last_activity?: string;
  created_at: string;
}

export interface Message {
  _id: string;
  id?: string;
  content: string;
  sender: {
    _id?: string;
    id?: string;
    full_name: string;
  };
  message_type: 'text' | 'file' | 'system';
  created_at: string;
  is_own?: boolean;
}

export interface CreateRoomData {
  name: string;
  participants: string[];
  tutoring_request_id?: string;
  course_id?: string;
}

export interface SendMessageData {
  content: string;
  message_type?: 'text' | 'file' | 'system';
}

export const chatService = {
  async createRoom(data: CreateRoomData): Promise<ChatRoom> {
    const response = await apiClient.post<ChatRoom>('/chat/rooms', data);
    return response.data;
  },

  async getRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>('/chat/rooms');
    return response.data;
  },

  async getMessages(roomId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  async sendMessage(roomId: string, data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<Message>(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  async markAsRead(roomId: string): Promise<void> {
    await apiClient.patch(`/chat/rooms/${roomId}/read`);
  }
};