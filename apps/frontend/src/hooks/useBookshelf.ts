'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookshelfService } from '@/lib/api/services';
import { BookshelfItem } from '@/types';

export function useBookshelf() {
  const [items, setItems] = useState<BookshelfItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookshelf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BookshelfService.getBookshelf();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取书架失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToBookshelf = useCallback(async (bookId: string) => {
    try {
      const item = await BookshelfService.addToBookshelf({ bookId });
      setItems((prev) => [...prev, item]);
      return item;
    } catch (err) {
      throw err;
    }
  }, []);

  const removeFromBookshelf = useCallback(async (bookId: string) => {
    try {
      await BookshelfService.removeFromBookshelf(bookId);
      setItems((prev) => prev.filter((item) => item.bookId !== bookId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchBookshelf();
  }, [fetchBookshelf]);

  return {
    items,
    isLoading,
    error,
    addToBookshelf,
    removeFromBookshelf,
    refresh: fetchBookshelf,
  };
}
