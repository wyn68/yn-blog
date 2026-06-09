"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PrefetchConfig {
  popularPaths: string[];
  idlePrefetchDelay: number;
  maxPrefetches: number;
}

const DEFAULT_CONFIG: PrefetchConfig = {
  popularPaths: ["/posts", "/categories", "/tags"],
  idlePrefetchDelay: 2000,
  maxPrefetches: 5,
};

export default function PrefetchWarmer({
  config = DEFAULT_CONFIG,
}: {
  config?: Partial<PrefetchConfig>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedRef = useRef<Set<string>>(new Set());
  const idleCallbackRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const { popularPaths, idlePrefetchDelay, maxPrefetches } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const safePrefetch = useCallback(
    (path: string) => {
      if (prefetchedRef.current.has(path) || path === pathname) {
        return;
      }
      
      try {
        router.prefetch(path);
        prefetchedRef.current.add(path);
      } catch (e) {
        console.warn(`[PrefetchWarmer] Failed to prefetch ${path}`, e);
      }
    },
    [router, pathname]
  );

  const prefetchInSequence = useCallback(
    (paths: string[], delayMs: number = 100) => {
      let index = 0;
      const prefetchNext = () => {
        if (index >= paths.length || index >= maxPrefetches) {
          return;
        }
        
        const path = paths[index];
        if (path !== pathname) {
          safePrefetch(path);
        }
        
        index++;
        if (index < paths.length && index < maxPrefetches) {
          setTimeout(prefetchNext, delayMs);
        }
      };
      
      prefetchNext();
    },
    [safePrefetch, pathname, maxPrefetches]
  );

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const isIdleSupported = "requestIdleCallback" in window;

    const startIdlePrefetch = () => {
      if (isIdleSupported) {
        idleCallbackRef.current = window.requestIdleCallback(
          () => {
            prefetchInSequence(popularPaths, 200);
          },
          { timeout: 5000 }
        );
      } else {
        setTimeout(() => {
          prefetchInSequence(popularPaths, 200);
        }, idlePrefetchDelay);
      }
    };

    const timeoutId = setTimeout(() => {
      startIdlePrefetch();
    }, idlePrefetchDelay);

    return () => {
      clearTimeout(timeoutId);
      if (idleCallbackRef.current !== null && isIdleSupported) {
        window.cancelIdleCallback(idleCallbackRef.current);
      }
    };
  }, [popularPaths, idlePrefetchDelay, prefetchInSequence]);

  useEffect(() => {
    prefetchedRef.current.clear();
  }, [pathname]);

  return null;
}
