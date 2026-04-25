import api from '@/lib/api';
import { BookshelfItem } from '@/types';

export interface AddToBookshelfData {
  bookId: string;
  categoryId?: string;
}

export interface UpdateProgressData {
  bookId: string;
  chapterId: string;
  progress: number;
}

export const BookshelfService = {
  async getBookshelf(): Promise<BookshelfItem[]> {
    const response = await api.get('/bookshelf');
    return response.data;
  },

  async addToBookshelf(data: AddToBookshelfData): Promise<BookshelfItem> {
    const response = await api.post('/bookshelf', data);
    return response.data;
  },

  // 从书架移除 - 使用状态更新接口
  async removeFromBookshelf(bookId: string): Promise<void> {
    await api.put(`/bookshelf/${bookId}/status`, { status: 'REMOVED' });
  },

  // 更新阅读进度 - 使用正确的路由
  async updateProgress(data: UpdateProgressData): Promise<void> {
    await api.put(`/bookshelf/${data.bookId}/progress`, {
      chapterId: data.chapterId,
      progress: data.progress,
    });
  },

  async getReadingHistory(): Promise<BookshelfItem[]> {
    const response = await api.get('/bookshelf/history');
    return response.data;
  },
};
