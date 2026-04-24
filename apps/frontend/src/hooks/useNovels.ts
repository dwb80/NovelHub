'use client';

import { useState, useEffect, useCallback } from 'react';
import { NovelService } from '@/lib/api/services';
import { Novel } from '@/types';

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchNovels = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await NovelService.getNovels(params);
      setNovels(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { novels, isLoading, error, total, fetchNovels };
}

export function useNovel(novelId: string) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNovel = useCallback(async () => {
    if (!novelId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await NovelService.getNovelById(novelId);
      setNovel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说详情失败');
    } finally {
      setIsLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchNovel();
  }, [fetchNovel]);

  return { novel, isLoading, error, refresh: fetchNovel };
}

export function useMyNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyNovels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NovelService.getMyNovels();
      setNovels(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyNovels();
  }, [fetchMyNovels]);

  return { novels, isLoading, refresh: fetchMyNovels };
}
