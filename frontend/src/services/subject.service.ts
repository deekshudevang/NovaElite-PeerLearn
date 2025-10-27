import { apiClient } from '@/lib/api-client';

export interface Subject {
  id: string;
  name: string;
  description: string | null;
}

export interface UserSubject {
  id: string;
  can_teach: boolean;
  can_learn: boolean;
  proficiency_level: string | null;
  subjects: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface UserSubjectData {
  user_id: string;
  subject_id?: string; // optional: backend supports name-only upsert
  name?: string;       // optional: specify subject by name
  can_teach: boolean;
  can_learn: boolean;
  proficiency_level: string;
}

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>('/subjects');
    return response.data;
  },

  async getUserSubjects(userId: string): Promise<UserSubject[]> {
    const response = await apiClient.get<UserSubject[]>(`/subjects/user/${userId}`);
    return response.data;
  },

  async updateUserSubjects(userId: string, subjects: UserSubjectData[]): Promise<void> {
    await apiClient.post(`/subjects/user/${userId}`, { subjects });
  },

  async deleteUserSubjects(userId: string): Promise<void> {
    await apiClient.delete(`/subjects/user/${userId}`);
  },
};
