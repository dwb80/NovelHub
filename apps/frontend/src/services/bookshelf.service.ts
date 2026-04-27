import { apiClient } from './api-client';

export type BookshelfSortType = 'recent' | 'added' | 'progress';
export type BookshelfStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED' | 'PAUSED';

export interface BookshelfItem {
  id: string;
  novelId: string;
  novelTitle: string;
  novelCover?: string;
  authorName: string;
  status: BookshelfStatus;
  lastChapterId?: string;
  lastChapterTitle?: string;
  progress: number;
  lastReadAt: Date;
  addedAt: Date;
}

class BookshelfService {
  /**
   * 获取我的书架
   */
  async getMyBookshelf(sort?: BookshelfSortType): Promise<BookshelfItem[]> {
    const query = sort ? `?sort=${sort}` : '';
    return apiClient.get<BookshelfItem[]>(`/bookshelf${query}`);
  }

  /**
   * 检查是否已收藏
   */
  async checkCollectionStatus(novelId: string): Promise<{ isCollected: boolean }> {
    return apiClient.get<{ isCollected: boolean }>(`/bookshelf/check?novelId=${novelId}`);
  }

  /**
   * 添加到书架
   */
  async addToBookshelf(novelId: string, status?: BookshelfStatus) {
    return apiClient.post('/bookshelf', { novelId, status });
  }

  /**
   * 更新阅读状态
   */
  async updateStatus(novelId: string, status: BookshelfStatus) {
    return apiClient.put(`/bookshelf/${novelId}/status`, { status });
  }

  /**
   * 从书架删除
   */
  async removeFromBookshelf(novelId: string): Promise<void> {
    return apiClient.delete(`/bookshelf/${novelId}`);
  }

  /**
   * 获取阅读历史
   */
  async getReadingHistory(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/bookshelf/history${query}`);
  }
}

export const bookshelfService = new BookshelfService();
