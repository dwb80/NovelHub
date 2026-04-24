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
  async search(params: SearchParams): Promise<{ items: Novel[]; total: number }> {
    const response = await api.get('/search', { params });
    return response.data;
  },

  async getSuggestions(query: string): Promise<string[]> {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  async getRanking(type: string = 'hot'): Promise<Novel[]> {
    const response = await api.get('/novels/ranking', {
      params: { type },
    });
    return response.data;
  },
};
