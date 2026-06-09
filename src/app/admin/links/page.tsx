'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { handleDeleteLink } from '@/actions/links';
import { getLinksPaginated } from '@/services/links';
import type { Link as LinkType } from '@/types';
import { AdminTable, AdminPageHeader, DeleteConfirmModal } from '@/components/admin';
import { useToast } from '@/components/ui/Toast';
import type { PaginatedResult } from '@/types/admin';
import { useRouterState } from '@/lib/router-state';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export default function AdminLinks() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [data, setData] = useState<LinkType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { success, error, loading: loadingToast, dismiss } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    linkId: null as string | null,
    isLoading: false,
  });

  const loadData = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result: PaginatedResult<LinkType> = await getLinksPaginated(page, pageSize);
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
      setCurrentPage(result.page);
    } catch (err) {
      error('加载失败', err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadData(page);
    }
  }, [loadData, totalPages, currentPage]);

  const handleDelete = async () => {
    if (!deleteModal.linkId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除友链...');

    try {
      await handleDeleteLink(deleteModal.linkId);
      dismiss(toastId);
      success('友链已成功删除');
      setData((prev) => prev?.filter((l) => l.id !== deleteModal.linkId) || null);
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      dismiss(toastId);
      error('删除友链失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, linkId: null, isLoading: false });
    }
  };

  const openDeleteConfirm = (linkId: string) => {
    setDeleteModal({ isOpen: true, linkId, isLoading: false });
  };

  const columns = [
    {
      key: 'name',
      header: '名称',
      render: (link: LinkType) => (
        <div className="flex items-center gap-2">
          {link.avatar && (
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <OptimizedImage
                src={link.avatar}
                alt={link.name}
                className="w-full h-full object-cover"
                fill={true}
                aspectRatio="1/1"
                sizes="24px"
              />
            </div>
          )}
          <span className="font-medium">{link.name}</span>
        </div>
      ),
    },
    {
      key: 'url',
      header: '链接',
      className: 'text-muted-foreground',
      render: (link: LinkType) => (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{link.url}</span>
        </a>
      ),
    },
    {
      key: 'description',
      header: '描述',
      className: 'text-muted-foreground',
      render: (link: LinkType) => (
        <span className="text-sm truncate max-w-[200px]">
          {link.description || '-'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: '状态',
      render: (link: LinkType) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          link.is_active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {link.is_active ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      key: 'sort_order',
      header: '排序',
      className: 'text-muted-foreground',
    },
    {
      key: 'created_at',
      header: '创建时间',
      className: 'text-muted-foreground',
      render: (link: LinkType) =>
        new Date(link.created_at).toLocaleDateString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '',
      icon: <Edit className="h-4 w-4" />,
      onClick: (link: LinkType) => {
        startLoading();
        router.push(`/admin/links/${link.id}/edit`);
      },
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (link: LinkType) => openDeleteConfirm(link.id),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="友链管理"
        description="管理博客友情链接"
        actions={
          <Link href="/admin/links/new" className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-colors">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            新建友链
          </Link>
        }
      />

      <AdminTable
        data={data}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无友链"
        searchable
        searchFields={['name', 'url', 'description'] as const}
        searchPlaceholder="搜索友链名称、链接或描述..."
        onRefresh={() => loadData(1)}
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
        onClose={() => setDeleteModal({ isOpen: false, linkId: null, isLoading: false })}
        onConfirm={handleDelete}
        title="确认删除"
        description="确定要删除此友链吗？此操作不可撤销。"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}