"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";

interface RouterStateContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const RouterStateContext = createContext<RouterStateContextType | undefined>(undefined);

export function RouterStateProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldShowLoadingRef = useRef(false);

  const startLoading = useCallback(() => {
    // 清除之前的定时器
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    shouldShowLoadingRef.current = true;
    
    // 延迟 150ms 显示加载状态，如果在这期间停止了就不显示
    loadingTimerRef.current = setTimeout(() => {
      if (shouldShowLoadingRef.current) {
        setIsLoading(true);
      }
    }, 150);
  }, []);

  const stopLoading = useCallback(() => {
    shouldShowLoadingRef.current = false;
    
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    setIsLoading(false);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  return (
    <RouterStateContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </RouterStateContext.Provider>
  );
}

export function useRouterState() {
  const context = useContext(RouterStateContext);
  if (!context) {
    throw new Error("useRouterState must be used within a RouterStateProvider");
  }
  return context;
}