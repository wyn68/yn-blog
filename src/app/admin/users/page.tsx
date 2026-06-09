'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Edit2, Trash2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmModal, AdminPageHeader, AdminTable } from '@/components/admin';
import { RoleBadge } from '@/components/admin/users';
import { useUserManagement } from '@/hooks/admin';
import type { Role } from '@/lib/role';
import { useRouterState } from '@/lib/router-state';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface UserWithEmail {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: Role;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null as string | null,
    userName: '',
  });

  const {
    users,
    isLoading,
    error,
    deletingId,
    fetchUsers,
    handleDeleteUser,
    isCurrentUser,
    isAdmin,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
  } = useUserManagement();

  const { success } = useToast();

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    const successResult = await handleDeleteUser(deleteModal.userId);
    if (successResult) {
      success('用户删除成功');
    }
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const openDeleteDialog = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  if (isLoading) {
    return <LoadingSpinner text="加载用户中..." />;
  }

  if (error && !users) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => fetchUsers(1)} className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors mt-4">
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="用户管理"
        description="管理博客用户"
        actions={null}
      />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <AdminTable
        data={users}
        columns={[
          {
            key: 'info',
            header: '用户信息',
            render: (user: UserWithEmail) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <OptimizedImage
                      src={user.avatar_url}
                      alt={user.username || ''}
                      className="w-full h-full object-cover"
                      fill={true}
                      aspectRatio="1/1"
                      sizes="36px"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.username || '未设置'}</p>
                  {isCurrentUser(user.user_id) && (
                    <p className="text-xs text-muted-foreground">（当前账户）</p>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'email',
            header: '邮箱',
            className: 'text-muted-foreground',
            render: (user: UserWithEmail) => user.email || '-',
          },
          {
            key: 'role',
            header: '角色',
            render: (user: UserWithEmail) => (
              <RoleBadge role={user.role} />
            ),
          },
          {
            key: 'created_at',
            header: '创建时间',
            className: 'text-muted-foreground',
            render: (user: UserWithEmail) =>
              new Date(user.created_at).toLocaleDateString('zh-CN'),
          },
        ]}
        actions={[
          {
            label: '',
            icon: <Edit2 className="h-4 w-4" />,
            onClick: (user: UserWithEmail) => {
              startLoading();
              router.push(`/admin/users/${user.id}/edit`);
            },
            disabled: (user: UserWithEmail) => isCurrentUser(user.user_id) || isAdmin(user.role),
          },
          {
            label: '',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (user: UserWithEmail) => openDeleteDialog(user.id, user.username || '该用户'),
            destructive: true,
            disabled: (user: UserWithEmail) => isCurrentUser(user.user_id) || isAdmin(user.role),
          },
        ]}
        isLoading={isLoading}
        emptyMessage="暂无用户"
        searchable
        searchFields={['username', 'email', 'role']}
        searchPlaceholder="搜索用户名、邮箱或角色..."
        onRefresh={() => fetchUsers(1)}
        pagination={totalPages > 1 ? {
          currentPage,
          totalPages,
          onPageChange: goToPage,
          totalCount,
          pageSize,
        } : undefined}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDeleteConfirm}
        title="确认删除用户"
        description={`确定要删除用户「${deleteModal.userName}」吗？此操作不可撤销，将同时删除该用户的认证记录。`}
        isLoading={deletingId === deleteModal.userId}
      />
    </div>
  );
}