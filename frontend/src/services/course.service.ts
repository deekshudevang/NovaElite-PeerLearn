import { apiClient } from '@/lib/api-client';

export interface CourseDTO {
  _id: string;
  id?: string;
  title: string;
  category: 'Development'|'Design'|'Science'|'Business';
  banner_url: string | null;
  instructor: { _id?: string; id?: string; full_name: string };
  subject: { _id?: string; id?: string; name: string };
  rating: number;
  price?: number;
  currency?: string;
  level?: string;
  duration?: string;
  description?: string;
  total_students?: number;
}

export const courseService = {
  async getCourses(category?: string): Promise<CourseDTO[]> {
    const res = await apiClient.get<CourseDTO[]>('/courses', { params: category ? { category } : {} });
    return res.data;
  },
  
  async list(category?: string): Promise<CourseDTO[]> {
    return this.getCourses(category);
  },
  
  async getCourseById(id: string): Promise<CourseDTO> {
    const res = await apiClient.get<CourseDTO>(`/courses/${id}`);
    return res.data;
  }
};
