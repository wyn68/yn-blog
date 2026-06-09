"use client";

import { useState, useEffect } from "react";
import { Send, Lock } from "lucide-react";
import { handleCreateLinkApplication } from "@/actions/linkApplications";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface LinkApplicationFormProps {
  onSuccess?: () => void;
}

export default function LinkApplicationForm({ onSuccess }: LinkApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    avatar: "",
    applicant_name: "",
    applicant_email: "",
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error, loading, dismiss } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

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
      error("请填写网站名称", "");
      return;
    }
    
    if (!formData.url.trim()) {
      error("请填写网站地址", "");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = loading("正在提交申请...");

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("url", formData.url);
      if (formData.description) form.append("description", formData.description);
      if (formData.avatar) form.append("avatar", formData.avatar);
      if (formData.applicant_name) form.append("applicant_name", formData.applicant_name);
      if (formData.applicant_email) form.append("applicant_email", formData.applicant_email);

      await handleCreateLinkApplication(form);
      
      dismiss(toastId);
      success("申请提交成功", "我们会尽快审核您的申请");
      setShowSuccess(true);
      setFormData({
        name: "",
        url: "",
        description: "",
        avatar: "",
        applicant_name: "",
        applicant_email: "",
      });
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      dismiss(toastId);
      error("提交申请失败", err instanceof Error ? err.message : "提交申请失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">请先登录</h3>
        <p className="text-sm text-gray-500 mb-4">提交友链申请需要先登录账号</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors"
        >
          去登录
        </a>
      </div>
    );
  }

  return (
    <div>
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
          ✓ 申请提交成功！我们会尽快审核。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">网站名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="您的网站名称"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">网站地址 <span className="text-red-500">*</span></label>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">网站头像</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className="input w-full"
              placeholder="头像 URL（可选）"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">网站描述</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input w-full"
              placeholder="简短描述（可选）"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">您的姓名</label>
            <input
              type="text"
              name="applicant_name"
              value={formData.applicant_name}
              onChange={handleChange}
              className="input w-full"
              placeholder="您的姓名（可选）"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">联系邮箱</label>
            <input
              type="email"
              name="applicant_email"
              value={formData.applicant_email}
              onChange={handleChange}
              className="input w-full"
              placeholder="your@email.com（可选）"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "提交中..." : "提交申请"}
        </button>
      </form>
    </div>
  );
}
