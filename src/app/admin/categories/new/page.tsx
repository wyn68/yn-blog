"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { handleCreateCategoriesBulk } from "@/actions/categories";
import { useToast } from "@/components/ui/Toast";
import { useRouterState } from "@/lib/router-state";

interface CategoryForm {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryForm[]>([
    { id: "1", name: "", slug: "", description: "" },
  ]);
  const { success, error, loading, dismiss } = useToast();

  const addCategory = () => {
    setCategories([...categories, { id: Date.now().toString(), name: "", slug: "", description: "" }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const updateCategory = (id: string, field: keyof CategoryForm, value: string) => {
    setCategories(categories.map((cat) =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validCategories = categories.filter((cat) => cat.name.trim());
    if (validCategories.length === 0) {
      error("请至少填写一个分类名称", "");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = loading(`正在创建 ${validCategories.length} 个分类...`);

    try {
      const result = await handleCreateCategoriesBulk(validCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug || undefined,
        description: cat.description || undefined,
      })));
      
      dismiss(toastId);
      success(
        `分类创建完成`,
        `成功创建 ${result.created} 个分类${result.duplicates > 0 ? `，跳过 ${result.duplicates} 个重复` : ""}`
      );
      
      setTimeout(() => {
        startLoading();
        router.push("/admin/categories");
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error("创建分类失败", err instanceof Error ? err.message : "创建分类失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/categories" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回分类列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">新建分类</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        {categories.map((category, index) => (
          <div key={category.id} className="card p-4 border-2 border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">分类 {index + 1}</span>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
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
                  value={category.name}
                  onChange={(e) => updateCategory(category.id, "name", e.target.value)}
                  className="input w-full"
                  placeholder="分类名称"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={category.slug}
                  onChange={(e) => updateCategory(category.id, "slug", e.target.value)}
                  className="input w-full"
                  placeholder="自动生成"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">描述</label>
                <textarea
                  value={category.description}
                  onChange={(e) => updateCategory(category.id, "description", e.target.value)}
                  className="textarea w-full"
                  placeholder="分类描述"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 border border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          添加更多分类
        </button>

        <div className="flex gap-3">
          <Link href="/admin/categories" className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors">取消</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "创建中..." : `创建 ${categories.length} 个分类`}
          </button>
        </div>
      </form>
    </div>
  );
}
