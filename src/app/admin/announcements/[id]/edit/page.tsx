'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getAnnouncementById } from '@/services/announcements';
import { handleUpdateAnnouncement } from '@/actions/announcements';
import { useRouterState } from '@/lib/router-state';
import type { Announcement } from '@/types';

export default function EditAnnouncementPage() {
  const params = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { startLoading } = useRouterState();
  const { success, error, loading: loadingToast, dismiss } = useToast();

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const data = await getAnnouncementById(params.id as string);
        setAnnouncement(data);
      } catch (err) {
        error('加载失败', err instanceof Error ? err.message : '加载公告失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncement();
  }, [params.id, error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastId = loadingToast('正在提交...');
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      await handleUpdateAnnouncement(params.id as string, formData);
      dismiss(toastId);
      success('操作成功', '公告已更新');
      setTimeout(() => {
        startLoading();
        router.push('/admin/announcements');
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error('操作失败', err instanceof Error ? err.message : '更新失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="加载公告中..." />;
  }

  if (!announcement) {
    return (
      <div className="card p-12 text-center">
        <p className="text-lg font-medium text-foreground">公告不存在</p>
        <Link href="/admin/announcements" className="mt-4 inline-block">
          返回公告列表
        </Link>
      </div>
    );
  }

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

      <h1 className="text-2xl font-bold mb-6">编辑公告</h1>

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
                defaultValue={announcement.title}
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
                defaultValue={announcement.excerpt || ''}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">内容 <span className="text-destructive">*</span></label>
              <textarea
                name="content"
                className="textarea w-full min-h-[300px]"
                placeholder="输入公告内容"
                defaultValue={announcement.content}
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
                      defaultChecked={announcement.is_published}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">发布状态</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_pinned"
                      className="rounded"
                      defaultChecked={announcement.is_pinned}
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
                {isSubmitting ? '提交中...' : '更新公告'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}