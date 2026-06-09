'use client';

import { useState, useEffect } from 'react';
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { getCategories } from '@/services/categories';
import { getTags, getPostTags } from '@/services/tags';
import type { Post } from '@/types';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface PostFormProps {
  initialData?: Post | null;
  onSubmit: (formData: FormData) => Promise<void>;
  submitButtonText?: string;
  draftButtonText?: string;
  isSubmitting?: boolean;
}

export default function PostForm({
  initialData,
  onSubmit,
  submitButtonText = '发布文章',
  draftButtonText = '保存草稿',
  isSubmitting = false,
}: PostFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { success, error, loading: loadingToast, dismiss } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, tagList] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tagList);

        if (initialData?.category_id) {
          setSelectedCategoryId(initialData.category_id);
        }

        if (initialData?.id) {
          const postTagIds = await getPostTags(initialData.id) as string[];
          setSelectedTagIds(postTagIds);
        }
      } catch (err) {
        error('加载失败', err instanceof Error ? err.message : '加载数据失败');
      }
    };

    loadData();
  }, [initialData?.id, initialData?.category_id, error]);

  useEffect(() => {
    if (initialData?.featured_image) {
      setFeaturedImageUrl(initialData.featured_image);
    }
  }, [initialData?.featured_image]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // 添加选中的分类 ID 到 formData
    formData.set('category_id', selectedCategoryId);
    
    // 添加选中的标签 ID 到 formData
    selectedTagIds.forEach(tagId => {
      formData.append('tags', tagId);
    });
    
    const toastId = loadingToast('正在提交...');

    try {
      await onSubmit(formData);
      dismiss(toastId);
      success('操作成功', initialData ? '文章已更新' : '文章已创建');
      setTimeout(() => {
        router.push('/admin/posts');
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error('操作失败', err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">标题</label>
            <input
              type="text"
              name="title"
              className="input w-full"
              placeholder="输入文章标题"
              defaultValue={initialData?.title || ''}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              name="slug"
              className="input w-full"
              placeholder="自动生成"
              defaultValue={initialData?.slug || ''}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">摘要</label>
            <textarea
              name="excerpt"
              className="textarea w-full"
              placeholder="文章摘要（可选）"
              defaultValue={initialData?.excerpt || ''}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">内容</label>
            <textarea
              name="content"
              className="textarea w-full min-h-[400px]"
              placeholder="使用 Markdown 格式编写文章内容"
              defaultValue={initialData?.content || ''}
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
                <label className="block text-sm font-medium mb-2">状态</label>
                <select
                  name="status"
                  className="input w-full"
                  defaultValue={initialData?.status || 'draft'}
                  disabled={isSubmitting}
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                  <option value="archived">归档</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <select
                  name="category_id"
                  className="input w-full"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">未分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="tags"
                        value={tag.id}
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">封面图 URL</label>
                <input
                  type="text"
                  name="featured_image"
                  className="input w-full"
                  placeholder="输入图片 URL"
                  value={featuredImageUrl}
                  onChange={(e) => {
                    setFeaturedImageUrl(e.target.value);
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {featuredImageUrl && (() => {
                try {
                  new URL(featuredImageUrl);
                } catch {
                  return null;
                }
                
                return (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">封面预览</label>
                    <div className="relative rounded-lg overflow-hidden border border-border bg-muted h-48">
                      <OptimizedImage
                      src={featuredImageUrl}
                      alt="封面预览"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              name="status"
              value="draft"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中...' : draftButtonText}
            </button>
            <button
              type="submit"
              name="status"
              value="published"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中...' : submitButtonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
