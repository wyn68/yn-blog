'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

interface UseDeleteConfirmOptions {
  onDelete: (id: string) => Promise<void>;
  onSuccess?: (id: string) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export function useDeleteConfirm({
  onDelete,
  onSuccess,
  successMessage = '删除成功',
  errorMessage = '删除失败',
  loadingMessage = '正在删除...',
}: UseDeleteConfirmOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error, loading, dismiss } = useToast();

  const openDeleteConfirm = useCallback((id: string) => {
    setDeletingId(id);
    setIsModalOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsModalOpen(false);
    setDeletingId(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingId || isDeleting) return;

    setIsDeleting(true);
    const toastId = loading(loadingMessage);

    try {
      await onDelete(deletingId);
      dismiss(toastId);
      success(successMessage);
      onSuccess?.(deletingId);
      closeDeleteConfirm();
    } catch (err) {
      dismiss(toastId);
      const msg = err instanceof Error ? err.message : errorMessage;
      error('操作失败', msg);
      setIsDeleting(false);
    }
  }, [
    deletingId,
    isDeleting,
    onDelete,
    onSuccess,
    successMessage,
    errorMessage,
    loadingMessage,
    success,
    error,
    loading,
    dismiss,
    closeDeleteConfirm,
  ]);

  return {
    isModalOpen,
    deletingId,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleConfirmDelete,
  };
}
