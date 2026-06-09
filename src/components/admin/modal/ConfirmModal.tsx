'use client';

import { Dialog } from '@/components/ui/Dialog';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  isLoading = false,
  isDestructive = false,
}: ConfirmModalProps) {
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
      isDestructive={isDestructive}
    />
  );
}