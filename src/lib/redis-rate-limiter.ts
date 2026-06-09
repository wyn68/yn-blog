import { getRedisClient, isRedisAvailable } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalLimit: number;
  usedCount: number;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

const isProd = process.env.NODE_ENV === 'production';

/** 生产环境缺少 Redis 时发出的警告次数（避免日志刷屏） */
const fallbackWarningCounts = new Map<string, number>();
const MAX_FALLBACK_WARNINGS = 5;

function warnFallback(className: string): void {
  const count = fallbackWarningCounts.get(className) || 0;
  if (count < MAX_FALLBACK_WARNINGS) {
    fallbackWarningCounts.set(className, count + 1);
    if (isProd) {
      console.error(
        `[${className}] ⚠️ 生产环境缺少 Redis！限流退回到内存模式，在多实例部署下将无法共享限流状态。` +
        `请设置 REDIS_URL 环境变量。` +
        (count === MAX_FALLBACK_WARNINGS - 1 ? ' (此警告不再显示)' : '')
      );
    } else {
      console.warn(
        `[${className}] Redis not available, falling back to in-memory (dev mode OK)`
      );
    }
  }
}

export class RedisRateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private keyPrefix: string;

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.keyPrefix = options.keyPrefix || "ratelimit";
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  private getWindowSeconds(): number {
    return Math.ceil(this.windowMs / 1000);
  }

  async check(key: string): Promise<RateLimitResult> {
    if (!isRedisAvailable()) {
      warnFallback('RedisRateLimiter');
      return this.fallbackCheck(key);
    }

    try {
      const redis = getRedisClient();
      const redisKey = this.getKey(key);
      const windowSeconds = this.getWindowSeconds();

      const luaScript = `
        local key = KEYS[1]
        local max_requests = tonumber(ARGV[1])
        local window_seconds = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        -- 删除过期数据
        redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_seconds * 1000)

        -- 获取当前请求数
        local current_count = redis.call('ZCARD', key)

        -- 检查是否超过限制
        if current_count >= max_requests then
          -- 获取最早的请求时间
          local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
          local reset_time = oldest[2] and (tonumber(oldest[2]) + window_seconds * 1000) or (now + window_seconds * 1000)
          return {0, current_count, reset_time}
        end

        -- 添加新请求
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, window_seconds)

        -- 返回剩余次数和重置时间
        local reset_time = now + window_seconds * 1000
        return {1, max_requests - current_count - 1, reset_time}
      `;

      const now = Date.now();
      const result = await redis.eval(
        luaScript,
        1,
        redisKey,
        this.maxRequests,
        windowSeconds,
        now
      ) as [number, number, number];

      const [allowed, remaining, resetTime] = result;

      return {
        allowed: allowed === 1,
        remaining: Math.max(0, remaining),
        resetTime,
        totalLimit: this.maxRequests,
        usedCount: this.maxRequests - Math.max(0, remaining),
      };
    } catch (error) {
      console.error("[RedisRateLimiter] Error checking rate limit:", error);
      warnFallback('RedisRateLimiter');
      return this.fallbackCheck(key);
    }
  }

  async consume(key: string): Promise<RateLimitResult> {
    return this.check(key);
  }

  async getStatus(key: string): Promise<RateLimitResult> {
    if (!isRedisAvailable()) {
      warnFallback('RedisRateLimiter');
      return this.fallbackGetStatus(key);
    }

    try {
      const redis = getRedisClient();
      const redisKey = this.getKey(key);
      const windowSeconds = this.getWindowSeconds();
      const now = Date.now();

      const luaScript = `
        local key = KEYS[1]
        local window_seconds = tonumber(ARGV[1])
        local now = tonumber(ARGV[2])

        -- 删除过期数据
        redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_seconds * 1000)

        -- 获取当前请求数
        local current_count = redis.call('ZCARD', key)

        -- 获取最早的请求时间
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local reset_time = oldest[2] and (tonumber(oldest[2]) + window_seconds * 1000) or (now + window_seconds * 1000)

        return {current_count, reset_time}
      `;

      const result = await redis.eval(
        luaScript,
        1,
        redisKey,
        windowSeconds,
        now
      ) as [number, number];

      const [usedCount, resetTime] = result;

      return {
        allowed: usedCount < this.maxRequests,
        remaining: Math.max(0, this.maxRequests - usedCount),
        resetTime,
        totalLimit: this.maxRequests,
        usedCount,
      };
    } catch (error) {
      console.error("[RedisRateLimiter] Error getting status:", error);
      warnFallback('RedisRateLimiter');
      return this.fallbackGetStatus(key);
    }
  }

  async reset(key: string): Promise<void> {
    if (!isRedisAvailable()) {
      warnFallback('RedisRateLimiter');
      return;
    }

    try {
      const redis = getRedisClient();
      const redisKey = this.getKey(key);
      await redis.del(redisKey);
    } catch (error) {
      console.error("[RedisRateLimiter] Error resetting rate limit:", error);
    }
  }

  private fallbackInMemoryStore = new Map<string, { count: number; timestamp: number }>();

  private fallbackCheck(key: string): RateLimitResult {
    const now = Date.now();
    const fullKey = this.getKey(key);
    const record = this.fallbackInMemoryStore.get(fullKey);

    if (!record || now - record.timestamp > this.windowMs) {
      this.fallbackInMemoryStore.set(fullKey, { count: 1, timestamp: now });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: 1,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.timestamp + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: record.count,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.timestamp + this.windowMs,
      totalLimit: this.maxRequests,
      usedCount: record.count,
    };
  }

  private fallbackGetStatus(key: string): RateLimitResult {
    const now = Date.now();
    const fullKey = this.getKey(key);
    const record = this.fallbackInMemoryStore.get(fullKey);

    if (!record || now - record.timestamp > this.windowMs) {
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: 0,
      };
    }

    return {
      allowed: record.count < this.maxRequests,
      remaining: Math.max(0, this.maxRequests - record.count),
      resetTime: record.timestamp + this.windowMs,
      totalLimit: this.maxRequests,
      usedCount: record.count,
    };
  }
}

export const redisCommentRateLimiter = new RedisRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyPrefix: "comment",
});

export const redisUploadRateLimiter = new RedisRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyPrefix: "upload",
});

export const redisViewRateLimiter = new RedisRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
  keyPrefix: "view",
});

export const redisDeleteMediaRateLimiter = new RedisRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyPrefix: "delete_media",
});
