import Redis from "ioredis";
import { getEnvSafe } from "./env";

let redis: Redis | null = null;
let redisConnectionError: Error | null = null;
let lastConnectionAttempt = 0;

/** 两次重连尝试的最小间隔（毫秒） */
const RECONNECT_INTERVAL_MS = 10_000;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = getEnvSafe('REDIS_URL');

    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not set");
    }

    const maxConnections = parseInt(process.env.REDIS_MAX_CONNECTIONS || '10', 10);
    const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000', 10);

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout,
      // Serverless 环境下建议使用 lazyConnect 避免建立不必要的连接
      lazyConnect: process.env.VERCEL ? true : false,
      // 保持长连接，减少 serverless 冷启动时的建连延迟
      keepAlive: 30_000,
      retryStrategy(times: number) {
        // 指数退避，最大 3 秒
        const delay = Math.min(times * 200, 3000);
        redisConnectionError = null;
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on("error", (err) => {
      redisConnectionError = err;
      console.error("[Redis] Connection error:", err.message);
    });

    redis.on("connect", () => {
      redisConnectionError = null;
      lastConnectionAttempt = Date.now();
      console.log("[Redis] Connected successfully");
    });

    redis.on("ready", () => {
      redisConnectionError = null;
      console.log("[Redis] Ready to accept commands");
    });

    redis.on("close", () => {
      console.log("[Redis] Connection closed");
    });
  }

  return redis;
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
    } catch {
      // 强制断开（quit 可能在已断开时抛错）
      redis.disconnect();
    }
    redis = null;
    redisConnectionError = null;
    console.log("[Redis] Connection closed");
  }
}

/**
 * 检查 Redis 是否可用。
 * 如果连接已断开，且距上次重连超过间隔阈值，尝试重新连接。
 */
export function isRedisAvailable(): boolean {
  if (!redis) {
    return false;
  }

  const status: string = redis.status;

  // 如果连接状态正常，直接返回
  if (status === "ready" || status === "connect") {
    return true;
  }

  // 连接异常时，尝试按间隔重连
  const now = Date.now();
  if (now - lastConnectionAttempt > RECONNECT_INTERVAL_MS) {
    lastConnectionAttempt = now;
    console.warn("[Redis] Connection lost, attempting reconnect...");
    try {
      redis.connect().catch(() => {});
    } catch {
      // connect() 可能同步抛错
    }
  }

  const recheckStatus: string = redis.status;
  return recheckStatus === "ready" || recheckStatus === "connect";
}

/**
 * Redis 健康检查：执行 PING 命令确认连接可用。
 * 返回 true 表示 Redis 完全正常。
 */
export async function redisHealthCheck(): Promise<boolean> {
  if (!redis) {
    return false;
  }
  const status: string = redis.status;
  if (status !== "ready") {
    return false;
  }
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

/**
 * 获取最后一次连接错误（用于诊断）。
 */
export function getRedisConnectionError(): Error | null {
  return redisConnectionError;
}

export function getRedisClientSafe(): Redis | null {
  try {
    const redisUrl = getEnvSafe('REDIS_URL');
    if (!redisUrl) return null;
    return getRedisClient();
  } catch {
    return null;
  }
}