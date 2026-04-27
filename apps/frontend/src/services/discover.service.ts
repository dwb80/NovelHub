import { apiClient } from './api-client';
import type { Novel } from './novels.service';

export type RankingType = 'hot' | 'favorite' | 'rating' | 'new' | 'completed';
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

export interface CategoryStats {
  male: { category: string; count: number }[];
  female: { category: string; count: number }[];
  published: { category: string; count: number }[];
}

class DiscoverService {
  /**
   * 获取分类导航统计（男频/女频/出版）
   */
  async getCategoryStats(): Promise<CategoryStats> {
    return apiClient.get<CategoryStats>('/discover/categories');
  }

  /**
   * 获取排行榜数据
   */
  async getRankings(
    type?: RankingType,
    period?: RankingPeriod,
    limit?: number
  ): Promise<Novel[]> {
    const params: Record<string, any> = {};
    if (type) params.type = type;
    if (period) params.period = period;
    if (limit) params.limit = limit;
    
    const query = new URLSearchParams(params).toString();
    return apiClient.get<Novel[]>(`/discover/rankings${query ? `?${query}` : ''}`);
  }

  /**
   * 获取热门搜索词
   */
  async getHotSearches(limit?: number): Promise<string[]> {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.get<string[]>(`/discover/hot-searches${query}`);
  }
}

export const discoverService = new DiscoverService();
