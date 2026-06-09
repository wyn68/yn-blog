/**
 * 客户端初始化文件
 * 在应用启动时执行，设置必要的监控和初始化逻辑
 */

import { setupResourceMonitoring } from './logger';

/**
 * 初始化客户端监控
 */
export function initializeClientMonitoring(): void {
  // 设置资源加载监控
  setupResourceMonitoring();
  
  // 记录应用启动信息
  console.log(`[App] Initialized at ${new Date().toISOString()}`);
}

/**
 * 错误边界上报
 * @param error 错误对象
 * @param errorInfo 错误信息
 */
export function reportError(error: Error, errorInfo?: React.ErrorInfo): void {
  const logger = new Logger('ErrorBoundary');
  logger.error('Error boundary caught error', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
  });
}

// 避免循环导入问题，这里使用内联Logger类
class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  error(message: string, context?: Record<string, unknown>): void {
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    let formatted = `${prefix}${message}`;
    
    if (context && Object.keys(context).length > 0) {
      try {
        formatted += ` | ${JSON.stringify(context)}`;
      } catch {
        formatted += ` | [context]`;
      }
    }
    
    console.error(`[ERROR] ${formatted}`);
  }
}