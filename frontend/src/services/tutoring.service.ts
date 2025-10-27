import { apiClient } from '@/lib/api-client';

export interface TutoringRequestData {
  from_user_id: string;
  to_user_id: string;
  subject_id: string;
  message: string;
  status?: string;
}

export interface TutoringRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject_id: string;
  subject_name?: string;
  other_name?: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const tutoringService = {
  async createRequest(data: TutoringRequestData): Promise<TutoringRequest> {
    const response = await apiClient.post<TutoringRequest>('/tutoring-requests', {
      ...data,
      status: data.status || 'pending',
    });
    return response.data;
  },

  async getRequests(userId: string): Promise<TutoringRequest[]> {
    const response = await apiClient.get<TutoringRequest[]>(`/tutoring-requests/user/${userId}`);
    return response.data;
  },

  async updateRequestStatus(requestId: string, status: string): Promise<TutoringRequest> {
    const response = await apiClient.patch<TutoringRequest>(`/tutoring-requests/${requestId}`, {
      status,
    });
    return response.data;
  },
};
