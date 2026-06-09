import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, commentRateLimiter, uploadRateLimiter } from '@/lib/rate-limiter';

describe('Rate Limiter Tests', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 60 * 1000,
    });
  });

  describe('RateLimiter class', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimiter.check('user:1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track remaining requests correctly', async () => {
      let remaining = 5;

      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.check('user:test');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(remaining - 1);
        remaining--;
      }
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 5; i++) {
        await rateLimiter.check('user:blocked');
      }

      const result = await rateLimiter.check('user:blocked');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should allow requests after window expires', async () => {
      const shortLimiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 100,
      });

      await shortLimiter.check('user:window');
      await shortLimiter.check('user:window');

      const blocked = await shortLimiter.check('user:window');
      expect(blocked.allowed).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const allowed = await shortLimiter.check('user:window');
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(1);
    });

    it('should track different keys independently', async () => {
      await rateLimiter.check('user:1');
      await rateLimiter.check('user:1');
      await rateLimiter.check('user:2');

      const result1 = await rateLimiter.check('user:1');
      const result2 = await rateLimiter.check('user:2');

      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(3);
    });

    it('should reset correctly', async () => {
      await rateLimiter.check('user:reset');
      await rateLimiter.check('user:reset');

      rateLimiter.reset('user:reset');

      const result = await rateLimiter.check('user:reset');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should provide correct reset time', async () => {
      const before = Date.now();
      const result = await rateLimiter.check('user:time');
      const after = Date.now();

      expect(result.resetTime).toBeGreaterThanOrEqual(before + 60000);
      expect(result.resetTime).toBeLessThanOrEqual(after + 60000);
    });
  });

  describe('commentRateLimiter', () => {
    it('should have correct configuration for comments', () => {
      expect(commentRateLimiter).toBeDefined();
    });

    it('should block after 10 comment attempts per minute', async () => {
      const userId = 'test-user-comment';
      const postId = 'test-post';

      for (let i = 0; i < 10; i++) {
        const result = await commentRateLimiter.check(`comment:${userId}:${postId}`);
        expect(result.allowed).toBe(true);
      }

      const blocked = await commentRateLimiter.check(`comment:${userId}:${postId}`);
      expect(blocked.allowed).toBe(false);
    });

    it('should allow comments on different posts independently', async () => {
      const userId = 'test-user-multi';

      for (let i = 0; i < 10; i++) {
        await commentRateLimiter.check(`comment:${userId}:post-1`);
      }

      const blocked = await commentRateLimiter.check(`comment:${userId}:post-1`);
      expect(blocked.allowed).toBe(false);

      const allowed = await commentRateLimiter.check(`comment:${userId}:post-2`);
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('uploadRateLimiter', () => {
    it('should have correct configuration for uploads', () => {
      expect(uploadRateLimiter).toBeDefined();
    });

    it('should block after 10 upload attempts per minute', async () => {
      const userId = 'test-user-upload';

      for (let i = 0; i < 10; i++) {
        const result = await uploadRateLimiter.check(`upload:${userId}`);
        expect(result.allowed).toBe(true);
      }

      const blocked = await uploadRateLimiter.check(`upload:${userId}`);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('Anti-Spam Scenarios', () => {
    it('should prevent rapid comment flooding', async () => {
      const spamUserId = 'spammer-user';
      const postId = 'victim-post';

      let blockedCount = 0;
      let successCount = 0;

      for (let i = 0; i < 20; i++) {
        const result = await commentRateLimiter.check(`comment:${spamUserId}:${postId}`);
        if (result.allowed) {
          successCount++;
        } else {
          blockedCount++;
        }
      }

      expect(successCount).toBe(10);
      expect(blockedCount).toBe(10);
    });

    it('should allow legitimate users with multiple posts', async () => {
      const userId = 'legitimate-user';

      const post1Comments: Array<{ allowed: boolean }> = [];
      const post2Comments: Array<{ allowed: boolean }> = [];
      const post3Comments: Array<{ allowed: boolean }> = [];

      for (let i = 0; i < 5; i++) {
        post1Comments.push(await commentRateLimiter.check(`comment:${userId}:post-1`));
      }

      for (let i = 0; i < 5; i++) {
        post2Comments.push(await commentRateLimiter.check(`comment:${userId}:post-2`));
      }

      for (let i = 0; i < 5; i++) {
        post3Comments.push(await commentRateLimiter.check(`comment:${userId}:post-3`));
      }

      expect(post1Comments.filter(r => r.allowed).length).toBe(5);
      expect(post2Comments.filter(r => r.allowed).length).toBe(5);
      expect(post3Comments.filter(r => r.allowed).length).toBe(5);
    });

    it('should handle concurrent users correctly', async () => {
      const users = ['user-a', 'user-b', 'user-c'];

      const results = await Promise.all(
        users.map(async (userId) => {
          const results: Array<{ allowed: boolean }> = [];
          for (let i = 0; i < 5; i++) {
            results.push(await rateLimiter.check(`concurrent:${userId}`));
          }
          return results;
        })
      );

      results.forEach((userResults) => {
        expect(userResults.filter(r => r.allowed).length).toBe(5);
      });
    });
  });
});
