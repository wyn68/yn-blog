import { describe, it, expect } from 'vitest';
import { validateEmail, isValidEmailFormat, isTemporaryEmail } from './email-validation';

describe('Email Validation Tests', () => {
  describe('isValidEmailFormat', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmailFormat('test@example.com')).toBe(true);
      expect(isValidEmailFormat('user.name@domain.org')).toBe(true);
      expect(isValidEmailFormat('test123@sub.domain.com')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidEmailFormat('invalid-email')).toBe(false);
      expect(isValidEmailFormat('@missing-local.com')).toBe(false);
      expect(isValidEmailFormat('missing-domain@')).toBe(false);
      expect(isValidEmailFormat('missing.at.sign.com')).toBe(false);
    });
  });

  describe('isTemporaryEmail', () => {
    it('should return true for temporary email domains', () => {
      expect(isTemporaryEmail('test@mailinator.com')).toBe(true);
      expect(isTemporaryEmail('user@yopmail.com')).toBe(true);
      expect(isTemporaryEmail('test@tempmail.com')).toBe(true);
    });

    it('should return false for valid email domains', () => {
      expect(isTemporaryEmail('test@example.com')).toBe(false);
      expect(isTemporaryEmail('user@gmail.com')).toBe(false);
      expect(isTemporaryEmail('test@company.org')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return valid for valid non-temporary emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for invalid formats', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('请输入有效的邮箱地址');
    });

    it('should return invalid for temporary emails', () => {
      const result = validateEmail('test@mailinator.com');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('不允许使用临时邮箱注册，请使用正式邮箱地址');
    });

    it('should handle whitespace trimming', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.valid).toBe(true);
    });

    it('should be case insensitive', () => {
      const result = validateEmail('Test@Example.COM');
      expect(result.valid).toBe(true);
    });
  });
});