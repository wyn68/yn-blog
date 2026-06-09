"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { saveProfile } from "@/actions/profile";
import { handleServerAction } from "@/lib/client-errors";
import { useToast } from "@/components/ui/Toast";
import { User, Check, X, Link as LinkIcon, Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: {
    username: string | null;
    bio: string | null;
    avatar_url?: string | null;
    website?: string | null;
  };
  email: string;
}

const AVATAR_URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[\w=&-]*)?$/i;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
/** 禁止的 URL 协议 */
const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;
/** 可信图片域名 - 支持不带标准扩展名的图片链接 */
const TRUSTED_IMAGE_HOSTS = ['img.ynpro.top', 'telegra.ph'];

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: profile.username || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
    website: profile.website || "",
  });

  const validateImageUrl = (url: string): { valid: boolean; error?: string } => {
    if (!url.trim()) {
      return { valid: true };
    }

    if (BLOCKED_PROTOCOLS.test(url.trim())) {
      return { valid: false, error: "图片URL包含不安全的协议" };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { valid: false, error: "图片URL必须以 http:// 或 https:// 开头" };
    }

    const hasValidExtension = IMAGE_EXTENSIONS.some(ext => url.toLowerCase().includes(ext));
    if (hasValidExtension || AVATAR_URL_REGEX.test(url)) {
      return { valid: true };
    }

    try {
      const urlObj = new URL(url.trim());
      const hostname = urlObj.hostname.toLowerCase();
      if (TRUSTED_IMAGE_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`))) {
        return { valid: true };
      }
    } catch {
      // URL 解析失败
    }

    return { valid: false, error: "URL必须指向有效的图片文件（jpg、png、gif、webp等）" };
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, avatar_url: url });
    setAvatarError(null);

    if (url.trim()) {
      const validation = validateImageUrl(url);
      if (!validation.valid) {
        setAvatarError(validation.error || "无效的图片链接");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.avatar_url.trim() && avatarError) {
      toastError("保存失败", "请先修复头像链接错误");
      return;
    }

    setIsSaving(true);

    const form = new FormData();
    form.append("username", formData.username);
    form.append("bio", formData.bio);
    form.append("avatar_url", formData.avatar_url);
    form.append("website", formData.website);

    const result = await handleServerAction(
      () => saveProfile(form),
      (loading) => setIsSaving(loading),
      (message) => {
        setError(message);
        toastError("保存失败", message);
      }
    );

    if (result?.success) {
      success("保存成功", "个人资料已更新");
      setIsEditing(false);
      router.refresh();
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || "",
      website: profile.website || "",
    });
    setIsEditing(false);
    setError(null);
    setAvatarError(null);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">个人资料</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            编辑资料
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            用户名
          </label>
          {isEditing ? (
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-foreground/30 transition-all"
              placeholder="请输入用户名"
              maxLength={50}
              required
            />
          ) : (
            <p className="px-4 py-2.5 rounded-lg bg-muted/30 text-foreground">
              {profile.username || "未设置"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            邮箱
          </label>
          <p className="px-4 py-2.5 rounded-lg bg-muted/30 text-muted-foreground">
            {email} <span className="text-xs">(不可更改)</span>
          </p>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">
            个人网站
          </label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-foreground/30 transition-all"
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <p className="px-4 py-2.5 rounded-lg bg-muted/30 text-foreground">
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {profile.website}
                </a>
              ) : (
                "未设置"
              )}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            个人简介
          </label>
          {isEditing ? (
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-foreground/30 transition-all resize-none"
              placeholder="简单介绍一下自己"
              rows={3}
              maxLength={200}
            />
          ) : (
            <p className="px-4 py-2.5 rounded-lg bg-muted/30 text-foreground">
              {profile.bio || "暂无简介"}
            </p>
          )}
          {isEditing && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.bio.length}/200
            </p>
          )}
        </div>

        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium mb-2">
            头像链接
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleAvatarUrlChange}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                    avatarError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                      : 'border-border focus:border-foreground/30'
                  }`}
                  placeholder="https://example.com/avatar.jpg" // 保持英文示例链接
                />
                {avatarError && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {avatarError}
                  </p>
                )}
              </div>
              
              {formData.avatar_url && !avatarError && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                  <OptimizedImage
                    src={formData.avatar_url}
                    alt="头像预览"
                    className="w-full h-full object-cover"
                    fill={true}
                    aspectRatio="1/1"
                    sizes="96px"
                    onError={() => setAvatarError("图片链接无法加载，请检查URL是否正确")}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                支持 jpg、png、gif、webp 等图片格式
              </p>
            </div>
          ) : (
            <div>
              {profile.avatar_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt="头像"
                    className="w-full h-full object-cover"
                    fill={true}
                    aspectRatio="1/1"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving || !!avatarError}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white dark:bg-green-500 dark:text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  保存
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4" />
              取消
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
