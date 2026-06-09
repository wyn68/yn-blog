'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSettings } from '@/services/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设置失败');
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    isLoading,
    error,
    getSetting,
    refetch: fetchSettings,
    setError,
  };
}