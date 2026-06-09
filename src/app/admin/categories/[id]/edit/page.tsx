"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { handleUpdateCategory, handleDeleteCategory } from "@/actions/categories";
import { getCategoryById } from "@/services/categories";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = params.id;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error, loading, dismiss } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const result = await getCategoryById(categoryId);
      if (!result) {
        notFound();
      }
      setCategory(result as Category);
      setIsLoading(false);
    };
    fetchData();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const toastId = loading("正在更新分类...");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      await handleUpdateCategory(categoryId, formData);
      
      dismiss(toastId);
      success("分类已成功更新", "您的修改已保存");
      
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      const errorMessage = err instanceof Error ? err.message : "更新分类失败";
      error("更新分类失败", errorMessage, () => handleSubmit(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (!confirm("确定要删除这个分类吗？此操作不可撤销。")) {
      return;
    }
    
    setIsDeleting(true);
    const toastId = loading("正在删除分类...");

    try {
      await handleDeleteCategory(categoryId);
      
      dismiss(toastId);
      success("分类已成功删除", "分类已从数据库中移除");
      
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      const errorMessage = err instanceof Error ? err.message : "删除分类失败";
      error("删除分类失败", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !category) {
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
            href="/admin/categories"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回分类列表
          </Link>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "删除中..." : "删除"}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">编辑分类</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">名称</label>
          <input
            type="text"
            name="name"
            className="input w-full"
            defaultValue={category.name}
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
            defaultValue={category.slug}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <textarea
            name="description"
            className="textarea w-full"
            defaultValue={category.description || ""}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3">
          <Link href="/admin/categories" className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors">
            取消
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>更新中...</span>
              </>
            ) : (
              "更新分类"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
