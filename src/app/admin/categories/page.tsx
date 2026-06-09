'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { handleDeleteCategory } from '@/actions/categories';
import { getCategoriesWithPostCountPaginated } from '@/services/categories';
import type { Category } from '@/types';
import { AdminTable, AdminPageHeader, DeleteConfirmModal } from '@/components/admin';
import { useToast } from '@/components/ui/Toast';
import type { PaginatedResult } from '@/types/admin';
import { useRouterState } from '@/lib/router-state';

interface CategoryWithCount extends Category {
  count?: number;
}

export default function AdminCategories() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [data, setData] = useState<CategoryWithCount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { success, error, loading: loadingToast, dismiss } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null as string | null,
    isLoading: false,
  });

  const loadData = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result: PaginatedResult<CategoryWithCount> = await getCategoriesWithPostCountPaginated(page, pageSize);
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
    if (!deleteModal.categoryId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除分类...');

    try {
      await handleDeleteCategory(deleteModal.categoryId);
      dismiss(toastId);
      success('分类已成功删除');
      setData((prev) => prev?.filter((c) => c.id !== deleteModal.categoryId) || null);
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      dismiss(toastId);
      error('删除分类失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, categoryId: null, isLoading: false });
    }
  };

  const openDeleteConfirm = (categoryId: string) => {
    setDeleteModal({ isOpen: true, categoryId, isLoading: false });
  };

  const columns = [
    {
      key: 'name',
      header: '名称',
      render: (category: CategoryWithCount) => (
        <span className="font-medium">{category.name}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'text-muted-foreground',
    },
    {
      key: 'description',
      header: '描述',
      render: (category: CategoryWithCount) => (
        <span className="text-muted-foreground max-w-xs truncate block">
          {category.description}
        </span>
      ),
    },
    {
      key: 'count',
      header: '文章数',
      className: 'text-muted-foreground',
      render: (category: CategoryWithCount) => category.count || 0,
    },
    {
      key: 'created_at',
      header: '创建时间',
      className: 'text-muted-foreground',
      render: (category: CategoryWithCount) =>
        new Date(category.created_at).toLocaleDateString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '',
      icon: <Edit className="h-4 w-4" />,
      onClick: (category: CategoryWithCount) => {
        startLoading();
        router.push(`/admin/categories/${category.id}/edit`);
      },
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (category: CategoryWithCount) => openDeleteConfirm(category.id),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="分类管理"
        description="管理博客文章分类"
        actions={
          <Link href="/admin/categories/new" className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-colors">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            新建分类
          </Link>
        }
      />

      <AdminTable
        data={data}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无分类"
        searchable
        searchFields={['name', 'slug'] as const}
        searchPlaceholder="搜索分类名称或slug..."
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
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null, isLoading: false })}
        onConfirm={handleDelete}
        title="确认删除"
        description="确定要删除此分类吗？此操作不可撤销。"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}