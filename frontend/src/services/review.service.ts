import { apiClient } from '@/lib/api-client';

export interface CourseReview {
  id: string;
  course_id?: string;
  course?: {
    id: string;
    title: string;
    category: string;
    banner_url: string;
    instructor: string;
  };
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  rating: number;
  comment: string;
  session_date: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateReviewData {
  course_id: string;
  rating: number;
  comment?: string;
  session_date?: string;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: CourseReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const reviewService = {
  async createReview(data: CreateReviewData): Promise<CourseReview> {
    const response = await apiClient.post<CourseReview>('/reviews', data);
    return response.data;
  },

  async getCourseReviews(courseId: string, page = 1, limit = 10): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(`/reviews/course/${courseId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getMyReviews(): Promise<CourseReview[]> {
    const response = await apiClient.get<CourseReview[]>('/reviews/my-reviews');
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  async getCourseSummary(courseId: string): Promise<ReviewSummary> {
    const response = await apiClient.get<ReviewSummary>(`/reviews/course/${courseId}/summary`);
    return response.data;
  }
};