import api from '@/lib/api';
import { Novel } from '@/types';

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}

export const SearchService = {
  // 搜索小说 - 使用 /search/novels
  async search(params: SearchParams): Promise<{ items: Novel[]; total: number }> {
    const response = await api.get('/search/novels', { params });
    // 适配后端返回格式 { novels: [], total: number }
    return {
      items: response.data.novels || [],
      total: response.data.total || 0,
    };
  },

  // 获取搜索建议 - 使用 /search/suggestions
  async getSuggestions(query: string): Promise<string[]> {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  // 获取排行榜 - 使用 /search/ranking
  async getRanking(type: string = 'hot'): Promise<Novel[]> {
    const response = await api.get('/search/ranking', {
      params: { type },
    });
    return response.data;
  },
};
