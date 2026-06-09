'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { updateUserRole, updateUserInfo } from '@/actions/users';
import { useToast } from '@/components/ui/Toast';
import { roles } from '@/components/admin/users';
import type { Role } from '@/lib/role';
import { useAdminUser } from '@/hooks/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isLoading: isLoadingUser } = useAdminUser();
  const { success, error } = useToast();
  
  const [role, setRole] = useState<Role>('user');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<{ id: string; username: string | null; email: string; bio: string | null; website: string | null; currentRole: Role } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData({
            id: data.id,
            username: data.username,
            email: data.email,
            bio: data.bio || null,
            website: data.website || null,
            currentRole: data.role as Role,
          });
          setUsername(data.username || '');
          setBio(data.bio || '');
          setWebsite(data.website || '');
          setRole(data.role as Role);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData) return;

    setIsSaving(true);
    
    try {
      const promises: Promise<{ success: boolean }>[] = [];
      const hasRoleChange = role !== userData.currentRole;
      const hasInfoChange = username !== (userData.username || '') || bio !== (userData.bio || '') || website !== (userData.website || '');
      
      if (hasRoleChange) {
        promises.push(updateUserRole(userData.id, role));
      }
      
      if (hasInfoChange) {
        promises.push(updateUserInfo(userData.id, { 
          username: username || undefined, 
          bio: bio || undefined,
          website: website || undefined,
        }));
      }
      
      if (promises.length === 0) {
        success('无需更改', '没有任何更改需要保存');
        return;
      }
      
      await Promise.all(promises);
      success('更新成功', '用户信息已更新');
      router.back();
    } catch (err) {
      error('更新失败', err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser || isLoading) {
    return <LoadingSpinner text="加载中..." />;
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">用户不存在</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          返回
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">编辑用户</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              placeholder="请输入用户名"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱</label>
            <p className="px-4 py-2.5 rounded-lg bg-muted/30 text-muted-foreground">
              {userData.email} <span className="text-xs">(不可更改)</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">个人简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              placeholder="简单介绍一下自己"
              rows={3}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {bio.length}/200
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">个人网站</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              placeholder="https://example.com"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">角色</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存更改
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}