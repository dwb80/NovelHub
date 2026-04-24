'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchService } from '@/lib/api/services';
import { Novel } from '@/types';

export function useSearch() {
  const [results, setResults] = useState<Novel[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (query: string, params = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await SearchService.search({ q: query, ...params });
      setResults(response.items);
      setTotal(response.total);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await SearchService.getSuggestions(query);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }, []);

  return { results, suggestions, isLoading, total, search, getSuggestions };
}
