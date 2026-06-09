'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMediaFiles } from '@/services/media';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export function useMediaManagement() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await getMediaFiles();
      setMediaFiles(Array.isArray(files) ? files : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载媒体文件失败');
      console.error('Failed to fetch media files:', err);
      setMediaFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filterFiles = (searchTerm: string) => {
    if (!searchTerm) return mediaFiles;
    const lowerTerm = searchTerm.toLowerCase();
    return mediaFiles.filter(
      (file) =>
        (!file.name || file.name.toLowerCase().includes(lowerTerm)) ||
        (!file.profiles?.username || file.profiles.username.toLowerCase().includes(lowerTerm))
    );
  };

  const removeFile = (fileId: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return {
    mediaFiles,
    isLoading,
    error,
    filterFiles,
    removeFile,
    refetch: fetchMedia,
    setError,
  };
}