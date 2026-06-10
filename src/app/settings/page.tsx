"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Shield, Mail, Send, X, Check } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import { submitRoleApplication } from "@/actions/roleApplications";
import { fetchCurrentProfile } from "@/actions/profile";
import type { Profile } from "@/types";

export default function SettingsPage() {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 通过 server action 获取 profile（走 Repository 层）
        const profileData = await fetchCurrentProfile();

        if (!profileData) {
          setLoading(false);
          return;
        }

        setSession({ user: { id: profileData.profile.user_id, email: profileData.email || undefined } });
        setProfile(profileData.profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitRoleApplication(reason);
    
    if (result.success) {
      setSubmitSuccess(true);
      setReason("");
      setTimeout(() => {
        setShowApplyModal(false);
        setSubmitSuccess(false);
        router.refresh();
      }, 2000);
    } else {
      setSubmitError(result.error || "提交失败");
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <Settings className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">请先登录</h1>
          <p className="text-muted-foreground mb-6">登录后可以管理您的账户设置</p>
          <a 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            立即登录
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">无法获取用户信息</p>
        </div>
      </div>
    );
  }

  // 只有当角色是 user 时才考虑申请状态
  const isPending = profile.role === "user" && profile.role_application_status === "pending";
  const isApproved = profile.role === "user" && profile.role_application_status === "approved";
  const isRejected = profile.role === "user" && profile.role_application_status === "rejected";

  return (
    <div className="container mx-auto px-4 sm:px-0 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">设置</h1>
            <p className="text-muted-foreground text-sm sm:text-base">管理您的账户信息</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <ProfileForm profile={profile} email={session.user.email || ""} />

          <PasswordForm email={session.user.email || ""} />

          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">账户安全</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm sm:text-base">账户角色</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">您的账户权限级别</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  profile.role === "admin" 
                    ? "bg-red-100 text-red-700" 
                    : profile.role === "editor" 
                      ? "bg-orange-100 text-orange-700" 
                      : profile.role === "author"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                }`}>
                  {profile.role === "admin" ? "管理员" : profile.role === "editor" ? "编辑" : profile.role === "author" ? "作者" : "普通用户"}
                </span>
              </div>

              {profile.role === "user" && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm sm:text-base">申请成为作者</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">升级您的账户权限，获得文章发布能力</p>
                    </div>
                    {isPending ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-medium">
                        审核中
                      </span>
                    ) : isApproved ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                        已通过
                      </span>
                    ) : isRejected ? (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        重新申请
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        立即申请
                      </button>
                    )}
                  </div>
                  {isPending && (
                    <p className="text-xs text-muted-foreground">您的申请正在审核中，请耐心等待管理员处理</p>
                  )}
                  {isApproved && (
                    <p className="text-xs text-green-600">恭喜！您已成功升级为作者，可以发布文章了</p>
                  )}
                  {isRejected && (
                    <p className="text-xs text-red-600">您的申请未通过审核，请重新申请并提供更详细的理由</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm sm:text-base">注册时间</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">账户创建时间</p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString("zh-CN") : "未知"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">申请成为作者</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">申请理由</label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="请简要说明您想成为作者的原因（1-500字）"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={5}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {reason.length}/500 字
                  </span>
                  {reason.length > 0 && reason.length < 1 && (
                    <span className="text-xs text-red-500">至少1字</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    您可以向联系邮箱发送邮件提醒管理员及时处理您的申请
                  </p>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">申请提交成功！管理员将尽快审核</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reason.length < 1 || reason.length > 500}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      提交中
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      提交申请
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
