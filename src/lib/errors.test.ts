import { describe, it, expect } from 'vitest';
import { 
  AppError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  BadRequestError, 
  DatabaseError,
  isSupabaseError,
  handleSupabaseError,
  getErrorMessage 
} from '@/lib/errors';

describe('errors', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError('test error', 'TEST_ERROR');
      expect(error.message).toBe('test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('not found', 'NOT_FOUND', 404);
      expect(error.message).toBe('not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('资源未找到');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should create a NotFoundError with custom message', () => {
      const error = new NotFoundError('文章不存在');
      expect(error.message).toBe('文章不存在');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('未授权');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('禁止访问');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('BadRequestError', () => {
    it('should create a BadRequestError', () => {
      const error = new BadRequestError();
      expect(error.message).toBe('错误的请求');
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('DatabaseError', () => {
    it('should create a DatabaseError', () => {
      const error = new DatabaseError();
      expect(error.message).toBe('数据库错误');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('isSupabaseError', () => {
    it('should return true for Supabase error objects', () => {
      expect(isSupabaseError({ code: 'PGRST116', message: 'Not found' })).toBe(true);
    });

    it('should return false for non-Supabase error objects', () => {
      expect(isSupabaseError({ message: 'Error' })).toBe(false);
      expect(isSupabaseError({ code: 'ERROR' })).toBe(false);
      expect(isSupabaseError(null)).toBe(false);
      expect(isSupabaseError('string')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should get message from Error object', () => {
      expect(getErrorMessage(new Error('test error'))).toBe('test error');
    });

    it('should get message from string', () => {
      expect(getErrorMessage('test error')).toBe('test error');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage(null)).toBe('发生了未知错误');
      expect(getErrorMessage(undefined)).toBe('发生了未知错误');
      expect(getErrorMessage({})).toBe('发生了未知错误');
    });
  });

  describe('handleSupabaseError', () => {
    it('should throw error with NOT_FOUND code for PGRST116', () => {
      try {
        handleSupabaseError({ code: 'PGRST116', message: 'Not found' }, '获取文章');
      } catch (e) {
        const error = e as AppError;
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('获取文章不存在');
      }
    });

    it('should throw error with FORBIDDEN code for 42501', () => {
      try {
        handleSupabaseError({ code: '42501', message: 'Permission denied' }, '操作');
      } catch (e) {
        const error = e as AppError;
        expect(error.code).toBe('FORBIDDEN');
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('没有权限操作');
      }
    });

    it('should throw error with BAD_REQUEST code for 23505', () => {
      try {
        handleSupabaseError({ code: '23505', message: 'Duplicate key' }, '创建');
      } catch (e) {
        const error = e as AppError;
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('创建已存在');
      }
    });

    it('should throw error with DATABASE_ERROR code for other errors', () => {
      try {
        handleSupabaseError({ code: 'OTHER', message: 'Unknown' }, '操作');
      } catch (e) {
        const error = e as AppError;
        expect(error.code).toBe('DATABASE_ERROR');
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
