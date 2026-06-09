'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { handleCreateAnnouncement } from '@/actions/announcements';
import { useRouterState } from '@/lib/router-state';

export default function NewAnnouncementPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { startLoading } = useRouterState();
  const { success, error, loading: loadingToast, dismiss } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastId = loadingToast('正在提交...');
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      await handleCreateAnnouncement(formData);
      dismiss(toastId);
      success('操作成功', '公告已创建');
      setTimeout(() => {
        startLoading();
        router.push('/admin/announcements');
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error('操作失败', err instanceof Error ? err.message : '创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/announcements"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回公告列表
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">新建公告</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">标题 <span className="text-destructive">*</span></label>
              <input
                type="text"
                name="title"
                className="input w-full"
                placeholder="输入公告标题"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">摘要</label>
              <textarea
                name="excerpt"
                className="textarea w-full"
                placeholder="公告摘要（可选，默认截取内容前150字）"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">内容 <span className="text-destructive">*</span></label>
              <textarea
                name="content"
                className="textarea w-full min-h-[300px]"
                placeholder="输入公告内容"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-4">
              <h3 className="font-medium mb-4">发布设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      className="rounded"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">立即发布</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_pinned"
                      className="rounded"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">置顶公告</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/announcements')}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '提交中...' : '创建公告'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}