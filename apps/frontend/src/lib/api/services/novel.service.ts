import api from '@/lib/api';
import { Novel, Chapter } from '@/types';

export interface NovelListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: number;
  sort?: string;
}

export interface CreateNovelData {
  title: string;
  summary: string;
  category: string;
  tags?: string[];
  cover?: string;
}

export const NovelService = {
  async getNovels(params: NovelListParams = {}): Promise<{ items: Novel[]; total: number }> {
    const response = await api.get('/novels', { params });
    return response.data;
  },

  async getNovelById(id: string): Promise<Novel> {
    const response = await api.get(`/novels/${id}`);
    return response.data;
  },

  async createNovel(data: CreateNovelData): Promise<Novel> {
    const response = await api.post('/novels', data);
    return response.data;
  },

  async updateNovel(id: string, data: Partial<CreateNovelData>): Promise<Novel> {
    const response = await api.put(`/novels/${id}`, data);
    return response.data;
  },

  async deleteNovel(id: string): Promise<void> {
    await api.delete(`/novels/${id}`);
  },

  async getMyNovels(): Promise<Novel[]> {
    const response = await api.get('/novels/my-novels');
    return response.data.novels;
  },

  async getChapters(novelId: string): Promise<Chapter[]> {
    const response = await api.get(`/novels/${novelId}/chapters`);
    return response.data;
  },

  async getChapter(novelId: string, chapterId: string): Promise<Chapter> {
    const response = await api.get(`/novels/${novelId}/chapters/${chapterId}`);
    return response.data;
  },

  async createChapter(novelId: string, data: { title: string; content: string }): Promise<Chapter> {
    const response = await api.post(`/novels/${novelId}/chapters`, data);
    return response.data;
  },

  async updateChapter(novelId: string, chapterId: string, data: { title?: string; content?: string }): Promise<Chapter> {
    const response = await api.put(`/novels/${novelId}/chapters/${chapterId}`, data);
    return response.data;
  },

  async deleteChapter(novelId: string, chapterId: string): Promise<void> {
    await api.delete(`/novels/${novelId}/chapters/${chapterId}`);
  },
};
