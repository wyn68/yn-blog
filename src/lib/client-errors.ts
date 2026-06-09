"use client";

export function getClientErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return '发生了未知错误，请稍后重试';
}

export function isClientError(error: unknown): boolean {
  return error !== null && error !== undefined && (
    typeof error === 'string' ||
    (typeof error === 'object' && ('message' in error || 'error' in error))
  );
}

export function handleClientError(error: unknown, onError?: (message: string) => void): void {
  const message = getClientErrorMessage(error);
  if (onError) {
    onError(message);
  }
}

export async function handleServerAction<T>(
  action: () => Promise<T>,
  onLoading?: (loading: boolean) => void,
  onError?: (message: string) => void,
  onSuccess?: (data: T) => void
): Promise<T | null> {
  try {
    onLoading?.(true);
    const result = await action();
    onSuccess?.(result);
    return result;
  } catch (error) {
    const message = getClientErrorMessage(error);
    onError?.(message);
    return null;
  } finally {
    onLoading?.(false);
  }
}
