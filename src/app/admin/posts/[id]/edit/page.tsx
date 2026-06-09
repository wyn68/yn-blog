'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye } from 'lucide-react';
import { handleUpdatePost, handleDeletePost, fetchPostById } from '@/actions/posts';
import type { Post } from '@/types';
import { useToast } from '@/components/ui/Toast';
import PostForm from '@/components/admin/posts/PostForm';
import { DeleteConfirmModal } from '@/components/admin';
import { useRouterState } from '@/lib/router-state';

export default function EditPostPage() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { success, error, loading: loadingToast, dismiss } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  useEffect(() => {
    if (postId && postId === 'new') {
      router.replace('/admin/posts/new');
      return;
    }

    if (postId) {
      startTransition(async () => {
        try {
          const result = await fetchPostById(postId);
          if (!result) {
            setLoadError('文章不存在');
            return;
          }
          setPost(result as Post);
        } catch (err) {
          setLoadError(err instanceof Error ? err.message : '加载文章失败');
        }
      });
    }
  }, [postId, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await handleUpdatePost(postId, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除文章...');

    try {
      await handleDeletePost(postId);
      dismiss(toastId);
      success('文章已成功删除', '文章已从数据库中移除');
      setTimeout(() => {
        startLoading();
        router.push('/admin/posts');
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error('删除文章失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, isLoading: false });
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{loadError}</div>
        <Link href="/admin/posts" className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors">
          返回文章列表
        </Link>
      </div>
    );
  }

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/posts/${post.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="h-4 w-4" />
            预览
          </Link>
          <button
            onClick={() => setDeleteModal((prev) => ({ ...prev, isOpen: true }))}
            disabled={deleteModal.isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            删除文章
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>

      <PostForm
        initialData={post}
        onSubmit={handleSubmit}
        submitButtonText="更新并发布"
        draftButtonText="保存草稿"
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="确认删除"
        description={`确定要删除文章「${post.title}」吗？此操作不可撤销。`}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}
