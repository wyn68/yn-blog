'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaginatedResult } from '@/types/admin';

interface UseAdminTableOptions<T> {
  fetchData: (page?: number, pageSize?: number) => Promise<T[] | PaginatedResult<T>>;
  autoFetch?: boolean;
  pageSize?: number;
}

export function useAdminTable<T extends { id: string }>({
  fetchData,
  autoFetch = true,
  pageSize = 10,
}: UseAdminTableOptions<T>) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchData(page, pageSize);
      
      if (Array.isArray(result)) {
        setData(result);
        setTotalCount(result.length);
        setTotalPages(Math.ceil(result.length / pageSize));
      } else {
        setData(result.data);
        setTotalCount(result.total);
        setTotalPages(result.totalPages);
      }
      setCurrentPage(page);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载数据失败';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadData(page);
    }
  }, [loadData, totalPages, currentPage]);

  const removeItem = useCallback((id: string) => {
    setData((prev) => prev?.filter((item) => item.id !== id) || null);
    setTotalCount((prev) => Math.max(0, prev - 1));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setData((prev) =>
      prev?.map((item) => (item.id === id ? { ...item, ...updates } : item)) ||
      null
    );
  }, []);

  useEffect(() => {
    if (autoFetch) {
      loadData(1);
    }
  }, [loadData, autoFetch]);

  return {
    data,
    isLoading,
    error,
    loadData,
    removeItem,
    updateItem,
    setData,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
  };
}