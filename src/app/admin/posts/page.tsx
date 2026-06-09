'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { handleDeletePost } from '@/actions/posts';
import { getPostsWithPagination } from '@/services/posts';
import type { Post } from '@/types';
import { hasRole, type Role } from '@/lib/role';
import { getPostStatusLabel, getPostStatusColor, type PostStatus } from '@/lib/status';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmModal, AdminPageHeader, AdminTable } from '@/components/admin';
import { useAdminUser } from '@/hooks/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PaginatedResult } from '@/types/admin';
import { useRouterState } from '@/lib/router-state';

type PostWithRelations = Post & { 
  profiles?: { username: string }; 
  categories?: { name: string };
  comment_count?: number;
};

export default function AdminPosts() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [posts, setPosts] = useState<PostWithRelations[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user, isLoading: isLoadingUser, error: userError } = useAdminUser();
  const { success, error, loading: loadingToast, dismiss } = useToast();
  const pageSize = 10;

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    post: null as { id: string; title: string } | null,
    isLoading: false,
  });

  const fetchPosts = useCallback(async (page: number = 1) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const params: { authorId?: string } = {};
      
      if (!hasRole(user.role as Role, 'editor')) {
        params.authorId = user.id;
      }
      
      const result: PaginatedResult<PostWithRelations> = await getPostsWithPagination(params, page, pageSize);
      setPosts(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
      setCurrentPage(result.page);
    } catch (err) {
      error('加载失败', err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [user, error]);

  useEffect(() => {
    if (user) {
      fetchPosts(1);
    }
  }, [user, fetchPosts]);

  const handleDelete = async () => {
    if (!deleteModal.post) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除文章...');

    try {
      await handleDeletePost(deleteModal.post.id);
      dismiss(toastId);
      success('文章已成功删除', '文章已从数据库中移除');
      setPosts((prev) => prev?.filter((p) => p.id !== deleteModal.post?.id) || null);
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      dismiss(toastId);
      error('删除文章失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, post: null, isLoading: false });
    }
  };

  const openDeleteDialog = (postId: string, title: string) => {
    setDeleteModal({ isOpen: true, post: { id: postId, title }, isLoading: false });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchPosts(page);
    }
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
    return <LoadingSpinner text="加载文章中..." />;
  }

  const columns = [
    {
      key: 'title',
      header: '标题',
      render: (post: PostWithRelations) => (
        <Link
          href={`/posts/${post.slug}`}
          className="font-medium hover:text-primary truncate max-w-xs inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          {post.title}
        </Link>
      ),
    },
    {
      key: 'author',
      header: '作者',
      className: 'text-muted-foreground',
      render: (post: PostWithRelations) => post.profiles?.username || '匿名',
    },
    {
      key: 'category',
      header: '分类',
      className: 'text-muted-foreground',
      render: (post: PostWithRelations) => post.categories?.name || '未分类',
    },
    {
      key: 'status',
      header: '状态',
      render: (post: PostWithRelations) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getPostStatusColor(post.status as PostStatus)}`}>
          {getPostStatusLabel(post.status as PostStatus)}
        </span>
      ),
    },
    {
      key: 'comment_count',
      header: '评论数',
      className: 'text-muted-foreground',
      render: (post: PostWithRelations) => post.comment_count || 0,
    },
    {
      key: 'created_at',
      header: '创建时间',
      className: 'text-muted-foreground',
      render: (post: PostWithRelations) =>
        new Date(post.created_at).toLocaleDateString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '',
      icon: <Eye className="h-4 w-4" />,
      onClick: (post: PostWithRelations) => {
        window.open(`/posts/${post.slug}`, '_blank');
      },
    },
    {
      label: '',
      icon: <Edit className="h-4 w-4" />,
      onClick: (post: PostWithRelations) => {
        startLoading();
        router.push(`/admin/posts/${post.id}/edit`);
      },
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (post: PostWithRelations) => openDeleteDialog(post.id, post.title),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="文章管理"
        description="管理您的博客文章"
        actions={
          <Link href="/admin/posts/new" className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-colors">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            新建文章
          </Link>
        }
      />

      <AdminTable
        data={posts}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无文章"
        searchable
        searchFields={['title', 'profiles.username', 'categories.name'] as const}
        searchPlaceholder="搜索文章标题、作者或分类..."
        onRefresh={() => fetchPosts(1)}
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
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="确认删除"
        description={`确定要删除文章「${deleteModal.post?.title}」吗？此操作不可撤销。`}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}