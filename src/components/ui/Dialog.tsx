"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  isConfirmLoading?: boolean;
  isDestructive?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  isConfirmLoading = false,
  isDestructive = false,
}: DialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
        if (e.key === "Enter" && !isConfirmLoading) {
          e.preventDefault();
          confirmButtonRef.current?.click();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose, isConfirmLoading]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="关闭对话框"
      />
      <Card variant="elevated" padding="none" className="relative w-full max-w-md">
        <CardHeader className="p-6 pb-0">
          <CardTitle id="dialog-title">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-2" role="status">
              {description}
            </p>
          )}
        </CardHeader>
        <CardFooter className="p-6 pt-4 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            autoFocus
            ref={cancelButtonRef}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isConfirmLoading || isConfirming}
            isLoading={isConfirmLoading || isConfirming}
            className="flex-1"
            ref={confirmButtonRef}
          >
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
