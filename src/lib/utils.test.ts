import { describe, it, expect } from 'vitest';
import { cn, generateSlug, calculateReadingTime } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', false, undefined, null, 0, 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes with ternary', () => {
      expect(cn('base', true ? 'active' : '')).toBe('base active');
      expect(cn('base', false ? 'active' : '')).toBe('base');
    });

    it('should handle mixed arguments', () => {
      expect(cn('flex', true && 'items-center')).toBe('flex items-center');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle Chinese characters', () => {
      expect(generateSlug('你好世界')).toBe('你好世界');
    });

    it('should handle mixed English and Chinese', () => {
      expect(generateSlug('Hello 世界')).toBe('hello-世界');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world');
      expect(generateSlug('Hello @#$% World')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
    });

    it('should handle leading and trailing spaces', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });
  });

  describe('calculateReadingTime', () => {
    it('should return 1 for empty content (minimum)', () => {
      expect(calculateReadingTime('')).toBe(1);
      expect(calculateReadingTime('   ')).toBe(1);
    });

    it('should calculate reading time for Chinese content', () => {
      const chineseContent = '中'.repeat(500);
      expect(calculateReadingTime(chineseContent)).toBe(1);
    });

    it('should calculate reading time for English content', () => {
      const englishContent = 'word '.repeat(200);
      expect(calculateReadingTime(englishContent)).toBe(1);
    });

    it('should calculate combined reading time', () => {
      const mixedContent = '中'.repeat(500) + ' word '.repeat(200);
      expect(calculateReadingTime(mixedContent)).toBe(2);
    });

    it('should handle typical blog post length', () => {
      const chineseContent = '中'.repeat(2500);
      expect(calculateReadingTime(chineseContent)).toBe(5);
    });
  });
});
