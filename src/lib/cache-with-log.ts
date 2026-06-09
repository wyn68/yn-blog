/* eslint-disable @typescript-eslint/no-explicit-any */
interface CacheEntry {
  value: unknown;
  expiry: number | null;
  createdAt: number;
}

const cacheStore = new Map<string, CacheEntry>();
const cacheStats = new Map<string, { hits: number; misses: number; lastAccess: Date }>();
const pendingRequests = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function cacheWithLog<T extends (...args: any[]) => any>(
  fn: T,
  cacheKey: string,
  options: { ttl?: number } = {}
): T {
  const ttl = options.ttl ?? DEFAULT_TTL;
  
  function stableStringify(args: unknown[]): string {
    try {
      if (args.length === 0) return '[]';
      const stable = args.map(arg => {
        if (arg === null || arg === undefined) return String(arg);
        if (typeof arg === 'object') {
          return JSON.stringify(arg, Object.keys(arg as object).sort());
        }
        return JSON.stringify(arg);
      });
      return `[${stable.join(',')}]`;
    } catch {
      return JSON.stringify(args);
    }
  }

  const wrappedFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const argsKey = stableStringify(args as unknown[]);
    const fullKey = `${cacheKey}:${argsKey}`;
    
    const cachedEntry = cacheStore.get(fullKey);
    if (cachedEntry !== undefined) {
      if (cachedEntry.expiry === null || Date.now() < cachedEntry.expiry) {
        incrementHit(cacheKey, argsKey);
        return cachedEntry.value as ReturnType<T>;
      } else {
        cacheStore.delete(fullKey);
      }
    }

    const pendingPromise = pendingRequests.get(fullKey);
    if (pendingPromise) {
      const result = await pendingPromise;
      incrementHit(cacheKey, argsKey);
      return result as ReturnType<T>;
    }

    const promise = (async () => {
      const startTime = Date.now();
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      cacheStore.set(fullKey, {
        value: result,
        expiry: ttl > 0 ? Date.now() + ttl : null,
        createdAt: Date.now(),
      });
      pendingRequests.delete(fullKey);
      
      incrementMiss(cacheKey, argsKey, duration);
      return result;
    })();

    pendingRequests.set(fullKey, promise);
    
    try {
      return (await promise) as ReturnType<T>;
    } catch (error) {
      pendingRequests.delete(fullKey);
      throw error;
    }
  };
  
  return wrappedFn as T;
}

function incrementHit(cacheKey: string, argsKey: string) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const stats = cacheStats.get(cacheKey) || { hits: 0, misses: 0, lastAccess: new Date() };
  stats.hits++;
  stats.lastAccess = new Date();
  cacheStats.set(cacheKey, stats);
  
  console.log(`[CACHE HIT] ${cacheKey} | Args: ${argsKey}`);
  console.log(`[CACHE STATS] ${cacheKey} | Hits: ${stats.hits} | Misses: ${stats.misses} | Rate: ${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%`);
}

function incrementMiss(cacheKey: string, argsKey: string, duration: number) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const stats = cacheStats.get(cacheKey) || { hits: 0, misses: 0, lastAccess: new Date() };
  stats.misses++;
  stats.lastAccess = new Date();
  cacheStats.set(cacheKey, stats);
  
  console.log(`[CACHE MISS] ${cacheKey} | Args: ${argsKey} | Duration: ${duration}ms`);
  console.log(`[CACHE STATS] ${cacheKey} | Hits: ${stats.hits} | Misses: ${stats.misses} | Rate: ${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%`);
}

export function getCacheStats() {
  return cacheStats;
}

export function resetCacheStats() {
  cacheStats.clear();
}

export function clearCache() {
  cacheStore.clear();
  cacheStats.clear();
  pendingRequests.clear();
}

export function clearCacheByPrefix(prefix: string) {
  cacheStore.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  });
  
  cacheStats.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      cacheStats.delete(key);
    }
  });
}

export function cleanupExpiredCache() {
  const now = Date.now();
  let expiredCount = 0;
  
  const entries = Array.from(cacheStore.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, entry] = entries[i];
    if (entry.expiry !== null && now >= entry.expiry) {
      cacheStore.delete(key);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`[CACHE CLEANUP] Removed ${expiredCount} expired cache entries`);
  }
  
  return expiredCount;
}

// Auto-cleanup every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * 启动缓存自动清理定时器。
 *
 * ⚠️ 警告：在 Vercel/Netlify 等 serverless 环境下，setInterval 可能导致函数实例
 * 无法被回收，造成持续计费。此函数仅应在传统服务器环境（如 Docker、VPS）中使用。
 * 对于 serverless 部署，缓存过期通过惰性删除（在 get 时检查过期时间）处理。
 */
export function startCacheCleanup(intervalMs: number = 5 * 60 * 1000) {
  // Serverless 环境检测：无 window 对象且不是开发模式
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn(
      '[CACHE] Serverless 环境检测到，跳过 setInterval 定时清理。' +
      '缓存过期将通过惰性删除处理。如需定时清理，请使用外部 cron job 调用 cleanupExpiredCache()。'
    );
    return;
  }

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  cleanupInterval = setInterval(cleanupExpiredCache, intervalMs);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[CACHE] Auto-cleanup started (interval: ${intervalMs / 1000}s)`);
  }
}

export function stopCacheCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    if (process.env.NODE_ENV === 'development') {
      console.log('[CACHE] Auto-cleanup stopped');
    }
  }
}