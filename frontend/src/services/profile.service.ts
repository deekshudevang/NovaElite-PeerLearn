import { apiClient } from '@/lib/api-client';

export interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  year_of_study: string | null;
  major: string | null;
  user_subjects?: UserSubject[];
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

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  major?: string;
  year_of_study?: string;
  avatar_url?: string;
  banner_url?: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await apiClient.get<Profile>(`/profiles/${userId}`);
    return response.data;
  },

  async getProfiles(limit: number = 20): Promise<Profile[]> {
    const response = await apiClient.get<Profile[]>('/profiles', {
      params: { limit },
    });
    return response.data;
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    const response = await apiClient.put<Profile>(`/profiles/${userId}`, data);
    return response.data;
  },

  async createProfile(userId: string, fullName: string): Promise<Profile> {
    const response = await apiClient.post<Profile>('/profiles', {
      id: userId,
      full_name: fullName,
    });
    return response.data;
  },
};
