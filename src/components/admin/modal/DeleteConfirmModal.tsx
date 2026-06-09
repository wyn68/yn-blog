'use client';

import { Dialog } from '@/components/ui/Dialog';
import type { DeleteConfirmModalProps } from '@/types/admin';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '确认删除',
  description = '此操作不可撤销，确定要继续吗？',
  confirmText = '删除',
  cancelText = '取消',
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      isConfirmLoading={isLoading}
      isDestructive
    />
  );
}
