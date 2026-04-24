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

  async removeFromBookshelf(bookId: string): Promise<void> {
    await api.delete(`/bookshelf/${bookId}`);
  },

  async updateProgress(data: UpdateProgressData): Promise<void> {
    await api.put('/bookshelf/progress', data);
  },

  async getReadingHistory(): Promise<BookshelfItem[]> {
    const response = await api.get('/bookshelf/history');
    return response.data;
  },
};
