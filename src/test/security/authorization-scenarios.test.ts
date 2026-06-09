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

describe('Authorization Security Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Privilege Escalation Prevention', () => {
    it('should prevent unauthenticated users from accessing protected resources', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: null,
        profile: null,
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
      await expect(requireAuthorOrHigher()).rejects.toThrow();
      await expect(requireEditorOrHigher()).rejects.toThrow();
      await expect(requireAuth()).rejects.toThrow();
    });

    it('should prevent regular users from accessing admin-only resources', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'user' },
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
      await expect(requireEditorOrHigher()).rejects.toThrow();
      await expect(requireAuthorOrHigher()).rejects.toThrow();
    });

    it('should prevent authors from accessing editor/admin resources', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'author' },
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
      await expect(requireEditorOrHigher()).rejects.toThrow();
    });

    it('should prevent editors from accessing admin resources', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'editor' },
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
    });
  });

  describe('Role Hierarchy Enforcement', () => {
    it('admin should have access to all resources', async () => {
      const mockUser = { id: 'user123', email: 'admin@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'admin' },
      } as MockReturn);

      await expect(requireAdmin()).resolves.toEqual(mockUser);
      await expect(requireEditorOrHigher()).resolves.toEqual(mockUser);
      await expect(requireAuthorOrHigher()).resolves.toEqual(mockUser);
    });

    it('editor should have access to editor and author resources', async () => {
      const mockUser = { id: 'user123', email: 'editor@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'editor' },
      } as MockReturn);

      await expect(requireEditorOrHigher()).resolves.toEqual(mockUser);
      await expect(requireAuthorOrHigher()).resolves.toEqual(mockUser);
    });

    it('author should have access to author resources only', async () => {
      const mockUser = { id: 'user123', email: 'author@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'author' },
      } as MockReturn);

      await expect(requireAuthorOrHigher()).resolves.toEqual(mockUser);
    });

    it('regular user should only have access to authenticated resources', async () => {
      const mockProfile = { id: 'profile123', role: 'user', user_id: 'user123' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: mockProfile,
      } as MockReturn);

      await expect(requireAuth()).resolves.toEqual(mockProfile);
    });
  });

  describe('Security Boundary Tests', () => {
    it('should reject requests when session is invalid', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockRejectedValue(new Error('Invalid session'));

      await expect(requireAdmin()).rejects.toThrow('Invalid session');
    });

    it('should prevent privilege escalation via role manipulation', async () => {
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: { id: 'user123' } },
        profile: { id: 'profile123', role: 'user' },
      } as MockReturn);

      await expect(requireAdmin()).rejects.toThrow();
      await expect(requireEditorOrHigher()).rejects.toThrow();
      await expect(requireAuthorOrHigher()).rejects.toThrow();
    });

    it('should maintain authentication state across authorization checks', async () => {
      const mockUser = { id: 'user123', email: 'author@example.com' };
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: { id: 'profile123', role: 'author' },
      } as MockReturn);

      const result1 = await requireAuthorOrHigher();
      const result2 = await requireAuthorOrHigher();

      expect(result1).toEqual(mockUser);
      expect(result2).toEqual(mockUser);
      expect(authRepository.getSessionWithProfile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authorization Workflow', () => {
    it('should follow correct authentication -> authorization flow', async () => {
      const mockUser = { id: 'user123', email: 'admin@example.com' };
      const mockProfile = { id: 'profile123', role: 'admin', user_id: 'user123' };
      
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: mockProfile,
      } as MockReturn);

      const adminResult = await requireAdmin();
      const authResult = await requireAuth();

      expect(adminResult).toEqual(mockUser);
      expect(authResult).toEqual(mockProfile);
    });

    it('should return different results for different authorization levels', async () => {
      const mockUser = { id: 'user123', email: 'author@example.com' };
      const mockProfile = { id: 'profile123', role: 'author', user_id: 'user123' };
      
      vi.mocked(authRepository.getSessionWithProfile).mockResolvedValue({
        session: { user: mockUser },
        profile: mockProfile,
      } as MockReturn);

      const authorResult = await requireAuthorOrHigher();
      const authResult = await requireAuth();

      expect(authorResult).toEqual(mockUser);
      expect(authResult).toEqual(mockProfile);
      expect(authorResult).not.toEqual(authResult);
    });
  });
});