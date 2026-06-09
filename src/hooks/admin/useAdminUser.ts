'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { hasRole, type Role } from '@/lib/role';

interface AdminUser {
  id: string;
  userId: string;
  role: string;
  username?: string;
}

export function useAdminUser() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('未登录');
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, role, username')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setUser({
          id: profile.id,
          userId: profile.user_id,
          role: profile.role,
          username: profile.username || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取用户信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const canManageContent = () => {
    if (!user) return false;
    return hasRole(user.role as Role, 'editor');
  };

  const canManageUsers = () => {
    if (!user) return false;
    return hasRole(user.role as Role, 'admin');
  };

  return {
    user,
    isLoading,
    error,
    canManageContent,
    canManageUsers,
  };
}
