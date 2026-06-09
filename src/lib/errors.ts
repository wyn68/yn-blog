export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "资源未找到") {
    super(message, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "未授权") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "禁止访问") {
    super(message, "FORBIDDEN", 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "错误的请求") {
    super(message, "BAD_REQUEST", 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "数据库错误") {
    super(message, "DATABASE_ERROR", 500);
  }
}

export function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

export function handleSupabaseError(error: unknown, context: string): never {
  if (isSupabaseError(error)) {
    switch (error.code) {
      case 'PGRST116':
        throw new NotFoundError(`${context}不存在`);
      case '42501':
        throw new ForbiddenError(`没有权限${context}`);
      case '23505':
        throw new BadRequestError(`${context}已存在`);
      default:
        throw new DatabaseError(`${context}失败: ${error.message}`);
    }
  }
  throw new DatabaseError(`${context}失败`);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '发生了未知错误';
}
