"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { handleCreateTagsBulk } from "@/actions/tags";
import { useToast } from "@/components/ui/Toast";
import { useRouterState } from "@/lib/router-state";

interface TagForm {
  id: string;
  name: string;
  slug: string;
}

export default function NewTagPage() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<TagForm[]>([{ id: "1", name: "", slug: "" }]);
  const { success, error, loading, dismiss } = useToast();

  const addTag = () => {
    setTags([...tags, { id: Date.now().toString(), name: "", slug: "" }]);
  };

  const removeTag = (id: string) => {
    if (tags.length > 1) {
      setTags(tags.filter((tag) => tag.id !== id));
    }
  };

  const updateTag = (id: string, field: keyof TagForm, value: string) => {
    setTags(tags.map((tag) =>
      tag.id === id ? { ...tag, [field]: value } : tag
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validTags = tags.filter((tag) => tag.name.trim());
    if (validTags.length === 0) {
      error("请至少填写一个标签名称", "");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = loading(`正在创建 ${validTags.length} 个标签...`);

    try {
      const result = await handleCreateTagsBulk(validTags.map((tag) => ({
        name: tag.name,
        slug: tag.slug || undefined,
      })));
      
      dismiss(toastId);
      success(
        `标签创建完成`,
        `成功创建 ${result.created} 个标签${result.duplicates > 0 ? `，跳过 ${result.duplicates} 个重复` : ""}`
      );
      
      setTimeout(() => {
        startLoading();
        router.push("/admin/tags");
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error("创建标签失败", err instanceof Error ? err.message : "创建标签失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tags" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回标签列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">新建标签</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        {tags.map((tag, index) => (
          <div key={tag.id} className="card p-4 border-2 border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">标签 {index + 1}</span>
              {tags.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">名称</label>
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => updateTag(tag.id, "name", e.target.value)}
                  className="input w-full"
                  placeholder="标签名称"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={tag.slug}
                  onChange={(e) => updateTag(tag.id, "slug", e.target.value)}
                  className="input w-full"
                  placeholder="自动生成"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addTag}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 border border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          添加更多标签
        </button>

        <div className="flex gap-3">
          <Link href="/admin/tags" className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors">取消</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "创建中..." : `创建 ${tags.length} 个标签`}
          </button>
        </div>
      </form>
    </div>
  );
}
