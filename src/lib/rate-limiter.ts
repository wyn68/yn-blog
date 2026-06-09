/**
 * 内存级速率限制器
 * 
 * ⚠️ 警告：此实现使用模块级 Map 存储状态，在无服务器/多实例环境（Vercel, Netlify 等）中
 * 每个实例有独立的内存空间，速率限制将无法跨实例共享。
 * 生产环境请使用 RedisRateLimiter（基于 Redis 的分布式实现）。
 * 
 * @see RedisRateLimiter in ./redis-rate-limiter.ts
 */

interface RateLimitRecord {
  count: number;
  timestamp: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalLimit: number;
  usedCount: number;
}

export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now - record.timestamp > this.windowMs) {
      rateLimitStore.set(key, { count: 1, timestamp: now });
      return { 
        allowed: true, 
        remaining: this.maxRequests - 1, 
        resetTime: now + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: 1
      };
    }

    if (record.count >= this.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: record.timestamp + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: record.count
      };
    }

    record.count++;
    return { 
      allowed: true, 
      remaining: this.maxRequests - record.count, 
      resetTime: record.timestamp + this.windowMs,
      totalLimit: this.maxRequests,
      usedCount: record.count
    };
  }

  async consume(key: string): Promise<RateLimitResult> {
    return this.check(key);
  }

  async getStatus(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now - record.timestamp > this.windowMs) {
      return { 
        allowed: true, 
        remaining: this.maxRequests, 
        resetTime: now + this.windowMs,
        totalLimit: this.maxRequests,
        usedCount: 0
      };
    }

    return {
      allowed: record.count < this.maxRequests,
      remaining: Math.max(0, this.maxRequests - record.count),
      resetTime: record.timestamp + this.windowMs,
      totalLimit: this.maxRequests,
      usedCount: record.count
    };
  }

  reset(key: string): void {
    rateLimitStore.delete(key);
  }
}

// 生产环境警告：内存级限流器不支持多实例部署
// 使用标志位确保即使模块被多次加载也只警告一次
let rateLimiterWarningEmitted = false;
if (process.env.NODE_ENV === 'production' && !rateLimiterWarningEmitted) {
  rateLimiterWarningEmitted = true;
  console.error(
    '[RateLimiter] ⚠️ 检测到生产环境使用内存级限流器！' +
    '多实例/Serverless 部署下各实例限流计数独立，限流将无法正常工作。' +
    '请使用 RedisRateLimiter（from ./redis-rate-limiter）替代。' +
    '如果已配置 REDIS_URL，请确保代码使用 redis* 开头的导出（如 redisCommentRateLimiter）。' +
    '（此警告在本次进程生命周期内仅输出一次）'
  );
}

export const commentRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
});

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
});

export const deleteMediaRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
});

export const viewRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
});
