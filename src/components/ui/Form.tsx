"use client";

import { useState, useRef, type FormEvent, type ReactNode, type ReactElement } from "react";
import { Button } from "@/components/ui/Button";

interface FormRenderProps {
  isSubmitting: boolean;
}

type FormChildren = ReactNode | ((props: FormRenderProps) => ReactElement);

interface FormProps {
  children: FormChildren;
  onSubmit: (formData: FormData) => Promise<void>;
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function Form({ children, onSubmit, onSuccess, onError, className = "" }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitCountRef = useRef(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    submitCountRef.current += 1;
    const currentCount = submitCountRef.current;

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);

      if (currentCount === submitCountRef.current) {
        onSuccess?.("操作成功");
        formRef.current?.reset();
      }
    } catch (error) {
      if (currentCount === submitCountRef.current) {
        onError?.(error instanceof Error ? error : new Error("操作失败"));
      }
    } finally {
      if (currentCount === submitCountRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {typeof children === "function"
        ? children({ isSubmitting })
        : children}
    </form>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
}

export function SubmitButton({
  children,
  isSubmitting = false,
  disabled = false,
  className = "",
  type = "submit"
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      disabled={isSubmitting || disabled}
      isLoading={isSubmitting}
      className={className}
    >
      {children}
    </Button>
  );
}
