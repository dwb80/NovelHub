import { apiClient } from './api-client';

export interface NovelFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'hot' | 'new' | 'rating';
  targetAudience?: 'all' | 'male' | 'female';
  serialStatus?: 'all' | 'ongoing' | 'completed';
  wordCountRange?: 'all' | 'lt10w' | '10w30w' | '30w50w' | '50w100w' | 'gt100w';
}

export interface Novel {
  id: string;
  title: string;
  cover?: string;
  category: string;
  wordCount: number;
  rating: number;
  viewCount: number;
  authorName?: string;
}

class NovelsService {
  async findAll(params: NovelFilterParams = {}) {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get<{ novels: Novel[]; total: number }>(
      `/novels${query ? `?${query}` : ''}`
    );
  }

  async findOne(id: string) {
    return apiClient.get<Novel>(`/novels/${id}`);
  }

  async getChapters(novelId: string, params: { page?: number; limit?: number; order?: 'asc' | 'desc' } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/novels/${novelId}/chapters${query ? `?${query}` : ''}`);
  }

  async getChapter(novelId: string, chapterId: string) {
    return apiClient.get(`/novels/${novelId}/chapters/${chapterId}`);
  }
}

export const novelsService = new NovelsService();
