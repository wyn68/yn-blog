"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Info, X, Loader2 } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "loading" | "info";
  title: string;
  message?: string;
  duration?: number;
  onRetry?: () => void;
}

interface ToastContextType {
  messages: ToastMessage[];
  addMessage: (message: Omit<ToastMessage, "id">) => string;
  removeMessage: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string, onRetry?: () => void) => string;
  loading: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  updateMessage: (id: string, updates: Partial<Omit<ToastMessage, "id">>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: XCircle,
  loading: Loader2,
  info: Info,
};

const toastColors = {
  success: "bg-success text-success-foreground",
  error: "bg-destructive text-destructive-foreground",
  loading: "bg-primary text-primary-foreground",
  info: "bg-muted text-muted-foreground",
};

let toastId = 0;
const createToastId = () => `toast-${++toastId}-${Date.now()}`;

function ToastContainer() {
  const { messages, removeMessage } = useToast();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    messages.forEach((msg) => {
      if (msg.type !== "loading" && msg.duration !== 0) {
        const timer = setTimeout(() => {
          removeMessage(msg.id);
        }, msg.duration || 3000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [messages, removeMessage]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {messages.map((msg) => {
        const Icon = icons[msg.type];
        const colorClass = toastColors[msg.type];
        return (
          <div
            key={msg.id}
            className="card p-4 flex items-start gap-3 animate-slide-in-right"
          >
            <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${msg.type === "loading" ? "animate-spin" : ""}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-card-foreground">{msg.title}</h4>
                {msg.type !== "loading" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMessage(msg.id);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {msg.message && (
                <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
              )}
              {msg.type === "error" && msg.onRetry && (
                <button
                  onClick={() => {
                    removeMessage(msg.id);
                    const onRetry = msg.onRetry;
                    if (onRetry) {
                      onRetry();
                    }
                  }}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  重试
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addMessage = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = createToastId();
    setMessages((prev) => [...prev, { ...message, id }]);
    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addMessage({ type: "success", title, message });
  }, [addMessage]);

  const error = useCallback((title: string, message?: string, onRetry?: () => void) => {
    return addMessage({ type: "error", title, message, onRetry });
  }, [addMessage]);

  const loading = useCallback((title: string, message?: string) => {
    return addMessage({ type: "loading", title, message, duration: 0 });
  }, [addMessage]);

  const info = useCallback((title: string, message?: string) => {
    return addMessage({ type: "info", title, message });
  }, [addMessage]);

  const updateMessage = useCallback((id: string, updates: Partial<Omit<ToastMessage, "id">>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    removeMessage(id);
  }, [removeMessage]);

  return (
    <ToastContext.Provider
      value={{
        messages,
        addMessage,
        removeMessage,
        success,
        error,
        loading,
        info,
        updateMessage,
        dismiss,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
