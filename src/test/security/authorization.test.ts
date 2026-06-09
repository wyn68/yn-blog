import { describe, it, expect, vi, afterEach } from 'vitest';
import { requireAdmin, requireAuthorOrHigher, requireEditorOrHigher, requireAuth } from '@/lib/auth';
import { authRepository } from '@/repositories/auth-repository';

vi.mock('@/repositories/auth-repository', () => ({
  authRepository: {
    getSessionWithProfile: vi.fn(),
  },
}));

interface MockSession {
  user: { id: string; email?: string };
}

interface MockProfile {
  id: string;
  role: 'admin' | 'editor' | 'author' | 'user';
  user_id?: string;
}

type MockReturn = { session: MockSession | null; profile: MockProfile | null };

describe('Authorization Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAdmin', () => {
    it('should throw error when user is not logged in', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: null,
        profile: null,
      });

      await expect(requireAdmin()).rejects.toThrow();
    });

    it('should throw error when user is logged in but not admin', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'user' },
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
    });

    it('should return user when user is admin', async () => {
      const mockUser = { id: 'user123', email: 'admin@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'admin' },
      } as MockReturn);

      const result = await requireAdmin();
      expect(result).toEqual(mockUser);
    });
  });

  describe('requireEditorOrHigher', () => {
    it('should throw error when user is not logged in', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: null,
        profile: null,
      } as MockReturn);

      await expect(requireEditorOrHigher()).rejects.toThrow();
    });

    it('should throw error when user has user role', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'user' },
      } as MockReturn);

      await expect(requireEditorOrHigher()).rejects.toThrow();
    });

    it('should throw error when user has author role', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'author' },
      } as MockReturn);

      await expect(requireEditorOrHigher()).rejects.toThrow();
    });

    it('should return user when user is editor', async () => {
      const mockUser = { id: 'user123', email: 'editor@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'editor' },
      } as MockReturn);

      const result = await requireEditorOrHigher();
      expect(result).toEqual(mockUser);
    });

    it('should return user when user is admin', async () => {
      const mockUser = { id: 'user123', email: 'admin@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'admin' },
      } as MockReturn);

      const result = await requireEditorOrHigher();
      expect(result).toEqual(mockUser);
    });
  });

  describe('requireAuthorOrHigher', () => {
    it('should throw error when user is not logged in', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: null,
        profile: null,
      } as MockReturn);

      await expect(requireAuthorOrHigher()).rejects.toThrow();
    });

    it('should throw error when user has user role', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'user' },
      } as MockReturn);

      await expect(requireAuthorOrHigher()).rejects.toThrow();
    });

    it('should return user when user is author', async () => {
      const mockUser = { id: 'user123', email: 'author@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'author' },
      } as MockReturn);

      const result = await requireAuthorOrHigher();
      expect(result).toEqual(mockUser);
    });

    it('should return user when user is editor', async () => {
      const mockUser = { id: 'user123', email: 'editor@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'editor' },
      } as MockReturn);

      const result = await requireAuthorOrHigher();
      expect(result).toEqual(mockUser);
    });

    it('should return user when user is admin', async () => {
      const mockUser = { id: 'user123', email: 'admin@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'admin' },
      } as MockReturn);

      const result = await requireAuthorOrHigher();
      expect(result).toEqual(mockUser);
    });
  });

  describe('requireAuth', () => {
    it('should throw error when user is not logged in', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: null,
        profile: null,
      } as MockReturn);

      await expect(requireAuth()).rejects.toThrow();
    });

    it('should return profile when user is logged in', async () => {
      const mockProfile = { id: 'profile123', role: 'user', user_id: 'user123' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: mockProfile,
      } as MockReturn);

      const result = await requireAuth();
      expect(result).toEqual(mockProfile);
    });
  });
});