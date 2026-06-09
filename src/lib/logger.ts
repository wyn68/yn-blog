/**
 * 统一日志监控系统
 * 
 * 功能特性：
 * - 支持不同日志级别（debug, info, warn, error）
 * - 生产环境自动关闭 debug 日志
 * - 支持自定义日志处理器
 * - 服务端和客户端通用
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const isServer = typeof window === 'undefined';

/** 日志级别优先级 */
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 当前日志级别（生产环境默认为 info） */
const currentLevel: LogLevel = isProduction ? 'info' : 'debug';

/** 日志存储（客户端使用） */
const clientLogs: LogContext[] = [];
const MAX_LOGS = 100;

export class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    if (isProduction && level === 'debug') return false;
    return levelPriority[level] >= levelPriority[currentLevel];
  }

  private formatMessage(message: string, context?: Record<string, unknown>): string {
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    let formatted = `${prefix}${message}`;
    
    if (context && Object.keys(context).length > 0) {
      try {
        formatted += ` | ${JSON.stringify(context)}`;
      } catch {
        formatted += ` | [context: ${typeof context}]`;
      }
    }
    
    return formatted;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    if (isServer) {
      console.debug(this.formatMessage(message, context));
    } else {
      console.debug(`[DEBUG] ${this.formatMessage(message, context)}`);
      this.storeLog('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    if (isServer) {
      console.log(this.formatMessage(message, context));
    } else {
      console.info(`[INFO] ${this.formatMessage(message, context)}`);
      this.storeLog('info', message, context);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    if (isServer) {
      console.warn(this.formatMessage(message, context));
    } else {
      console.warn(`[WARN] ${this.formatMessage(message, context)}`);
      this.storeLog('warn', message, context);
    }
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    
    let context: Record<string, unknown> | undefined;
    let stack: string | undefined;
    
    if (error instanceof Error) {
      context = {
        name: error.name,
        message: error.message,
      };
      stack = error.stack;
    } else if (error) {
      context = error;
    }
    
    const formatted = this.formatMessage(message, context);
    
    if (isServer) {
      console.error(formatted);
      if (stack) console.error(stack);
    } else {
      console.error(`[ERROR] ${formatted}`);
      if (stack) console.error(stack);
      this.storeLog('error', message, context, stack);
    }
  }

  private storeLog(level: LogLevel, message: string, context?: Record<string, unknown>, stack?: string): void {
    if (isServer) return;
    
    const log: LogContext = {
      timestamp: Date.now(),
      level,
      message,
      context,
      stack,
    };
    
    clientLogs.unshift(log);
    if (clientLogs.length > MAX_LOGS) {
      clientLogs.pop();
    }
  }
}

/**
 * 获取客户端日志（用于调试或上报）
 */
export function getClientLogs(): LogContext[] {
  return [...clientLogs];
}

/**
 * 清空客户端日志
 */
export function clearClientLogs(): void {
  clientLogs.length = 0;
}

/**
 * 资源加载监控
 * 监控图片、脚本、样式等资源加载失败
 */
export function setupResourceMonitoring(): void {
  if (isServer) return;

  // 监控图片加载失败
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const logger = new Logger('Resource');
      logger.error(`Image load failed`, {
        src: img.src,
        alt: img.alt,
        tagName: target.tagName,
      });
    }
    
    if (target.tagName === 'LINK' && target.getAttribute('rel') === 'stylesheet') {
      const link = target as HTMLLinkElement;
      const logger = new Logger('Resource');
      logger.error(`Stylesheet load failed`, {
        href: link.href,
        rel: link.rel,
      });
    }
  }, true);

  // 监控脚本加载失败
  window.addEventListener('error', (event) => {
    const logger = new Logger('Script');
    logger.error(`Script error`, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }, true);

  // 监控未捕获的Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const logger = new Logger('Promise');
    logger.error(`Unhandled promise rejection`, {
      reason: event.reason instanceof Error 
        ? { message: event.reason.message, stack: event.reason.stack }
        : String(event.reason),
    });
  });

  // 监控网络请求失败
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0] instanceof Request ? args[0].url : args[0];
    const logger = new Logger('Network');
    
    try {
      const response = await originalFetch(...args);
      
      if (!response.ok) {
        logger.warn(`HTTP request failed`, {
          url,
          status: response.status,
          statusText: response.statusText,
        });
      }
      
      return response;
    } catch (error) {
      logger.error(`Fetch failed`, {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}

/**
 * 创建带命名空间的日志实例
 */
export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}

// 创建常用的日志实例
export const serverLogger = new Logger('Server');
export const clientLogger = new Logger('Client');
export const redisLogger = new Logger('Redis');
export const databaseLogger = new Logger('Database');
export const securityLogger = new Logger('Security');
export const resourceLogger = new Logger('Resource');