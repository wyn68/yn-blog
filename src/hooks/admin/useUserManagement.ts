'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { getUserEmails, deleteUser } from '@/actions/users';
import type { Profile } from '@/types';
import type { Role } from '@/lib/role';
import { hasRole } from '@/lib/role';

interface UserWithEmail extends Profile {
  email: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithEmail[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchUsers = useCallback(async (page: number = 1) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      const offset = (page - 1) * pageSize;

      const [profilesResponse, countResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const total = countResult.count as number || 0;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
      setCurrentPage(page);

      const profilesData = profilesResponse.data || [];
      const userIds = profilesData.map((p) => p.user_id);
      const emailMap = await getUserEmails(userIds);

      const formattedUsers = profilesData.map((profile) => ({
        ...profile,
        email: emailMap.get(profile.user_id) || '-',
      }));

      setUsers(formattedUsers);
    } catch (err) {
      setError('加载用户失败');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchUsers(page);
    }
  }, [fetchUsers, totalPages, currentPage]);

  const handleDeleteUser = async (profileId: string): Promise<boolean> => {
    setDeletingId(profileId);
    try {
      await deleteUser(profileId);
      setUsers((prev) => (prev || []).filter((u) => u.id !== profileId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除用户失败');
      console.error('Error deleting user:', err);
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  const updateUserRoleInList = (profileId: string, newRole: Role) => {
    setUsers((prev) =>
      (prev || []).map((u) => (u.id === profileId ? { ...u, role: newRole } : u))
    );
  };

  const isCurrentUser = (userId: string) => currentUserId === userId;
  const isAdmin = (role: string) => hasRole(role as Role, 'admin');

  return {
    users,
    isLoading,
    error,
    currentUserId,
    deletingId,
    fetchUsers,
    handleDeleteUser,
    updateUserRoleInList,
    isCurrentUser,
    isAdmin,
    setError,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
  };
}