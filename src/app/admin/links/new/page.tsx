"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { handleCreateLink } from "@/actions/links";
import { useToast } from "@/components/ui/Toast";
import { useRouterState } from "@/lib/router-state";

export default function NewLinkPage() {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    avatar: "",
    is_active: true,
    sort_order: 0,
  });
  const { success, error, loading, dismiss } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.name.trim()) {
      error("请填写友链名称", "");
      return;
    }
    
    if (!formData.url.trim()) {
      error("请填写友链地址", "");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = loading("正在创建友链...");

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("url", formData.url);
      if (formData.description) form.append("description", formData.description);
      if (formData.avatar) form.append("avatar", formData.avatar);
      form.append("is_active", formData.is_active ? "on" : "");
      form.append("sort_order", formData.sort_order.toString());

      await handleCreateLink(form);
      
      dismiss(toastId);
      success("友链创建成功", "");
      
      setTimeout(() => {
        startLoading();
        router.push("/admin/links");
      }, 1500);
    } catch (err) {
      dismiss(toastId);
      error("创建友链失败", err instanceof Error ? err.message : "创建友链失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/links" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回友链列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">新建友链</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input w-full"
            placeholder="友链名称"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">链接地址 <span className="text-red-500">*</span></label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://example.com"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full"
            placeholder="友链描述（可选）"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">头像 URL</label>
          <input
            type="url"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://example.com/avatar.jpg"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">排序</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="input w-24"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              启用
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link href="/admin/links" className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors">取消</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "创建中..." : "创建友链"}
          </button>
        </div>
      </form>
    </div>
  );
}