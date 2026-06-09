'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Pin, FileText } from 'lucide-react';
import { getAnnouncements } from '@/services/announcements';
import { handleDeleteAnnouncement } from '@/actions/announcements';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmModal, AdminPageHeader, AdminTable } from '@/components/admin';
import { useAdminUser } from '@/hooks/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouterState } from '@/lib/router-state';
import { sanitizeHtml } from '@/lib/sanitize';
import { clearCacheByPrefix } from '@/lib/cache-with-log';
import type { Announcement } from '@/types';

export default function AdminAnnouncements() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isLoadingUser, error: userError } = useAdminUser();
  const { success, error, loading: loadingToast, dismiss } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    announcement: null as { id: string; title: string } | null,
    isLoading: false,
  });

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      clearCacheByPrefix('announcements');
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      error('加载失败', err instanceof Error ? err.message : '加载公告列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user, fetchAnnouncements]);

  const handleDelete = async () => {
    if (!deleteModal.announcement) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除公告...');

    try {
      await handleDeleteAnnouncement(deleteModal.announcement.id);
      dismiss(toastId);
      success('公告已删除', '公告已从数据库中移除');
      setAnnouncements((prev) => prev?.filter((a) => a.id !== deleteModal.announcement?.id) || null);
    } catch (err) {
      dismiss(toastId);
      error('删除公告失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, announcement: null, isLoading: false });
    }
  };

  const openDeleteDialog = (announcementId: string, title: string) => {
    setDeleteModal({ isOpen: true, announcement: { id: announcementId, title }, isLoading: false });
  };

  if (isLoadingUser) {
    return <LoadingSpinner text="加载用户信息..." />;
  }

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{userError || '无法获取用户信息'}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner text="加载公告中..." />;
  }

  const columns = [
    {
      key: 'title',
      header: '标题',
      render: (announcement: Announcement) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            announcement.is_pinned
              ? 'bg-amber-100 text-amber-600'
              : announcement.is_published
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
          }`}>
            {announcement.is_pinned ? (
              <Pin className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <span className="font-medium truncate">{sanitizeHtml(announcement.title)}</span>
        </div>
      ),
    },
    {
      key: 'excerpt',
      header: '摘要',
      className: 'text-muted-foreground',
      render: (announcement: Announcement) => (
        <span className="line-clamp-1">
          {sanitizeHtml(announcement.excerpt || announcement.content.substring(0, 50))}...
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (announcement: Announcement) => (
        <div className="flex items-center gap-2">
          {announcement.is_pinned && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              置顶
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            announcement.is_published
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {announcement.is_published ? '已发布' : '草稿'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: '创建时间',
      className: 'text-muted-foreground',
      render: (announcement: Announcement) =>
        new Date(announcement.created_at).toLocaleDateString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '',
      icon: <Edit className="h-4 w-4" />,
      onClick: (announcement: Announcement) => {
        startLoading();
        router.push(`/admin/announcements/${announcement.id}/edit`);
      },
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (announcement: Announcement) => openDeleteDialog(announcement.id, announcement.title),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="公告管理"
        description="管理网站公告的发布、编辑和删除"
        actions={
          <Link href="/admin/announcements/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" />
            新建公告
          </Link>
        }
      />

      <AdminTable
        data={announcements}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无公告，点击上方按钮创建第一条公告"
        onRefresh={() => fetchAnnouncements()}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="确认删除"
        description={`确定要删除公告「${sanitizeHtml(deleteModal.announcement?.title || '')}」吗？此操作不可撤销。`}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}