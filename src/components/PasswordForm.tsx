"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { validatePassword, validatePasswordMatch, validatePasswordNotSame, validateRequired } from "@/utils/validators";
import { useRouterState } from "@/lib/router-state";

interface PasswordFormProps {
  email: string;
}

export default function PasswordForm({ email }: PasswordFormProps) {
  const router = useRouter();
  const { startLoading } = useRouterState();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const validateForm = (): string | null => {
    const currentPasswordValidation = validateRequired(currentPassword, "当前密码");
    if (!currentPasswordValidation.valid) {
      return currentPasswordValidation.message;
    }

    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.valid) {
      return newPasswordValidation.message;
    }

    const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchValidation.valid) {
      return matchValidation.message;
    }

    const notSameValidation = validatePasswordNotSame(currentPassword, newPassword);
    if (!notSameValidation.valid) {
      return notSameValidation.message;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setStatus("error");
        setMessage("当前密码不正确");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setStatus("error");
        setMessage(updateError.message || "更新密码失败");
        return;
      }

      setStatus("success");
      setMessage("密码重置成功！正在跳转到登录页面...");

      setTimeout(async () => {
        await supabase.auth.signOut();
        startLoading();
        router.push("/login");
      }, 2000);
    } catch {
      setStatus("error");
      setMessage("网络错误，请稍后重试");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">重置密码</h2>
            <p className="text-sm text-muted-foreground">定期更换密码有助于保护账户安全</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary hover:underline"
        >
          {showForm ? "取消" : "修改密码"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              当前密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder="输入当前密码"
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              新密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder="至少8个字符"
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              确认新密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input pl-10 pr-10 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="再次输入新密码"
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">两次输入的密码不一致</p>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                status === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {getStatusIcon()}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center gap-2 px-4 py-2"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "success" ? "密码重置成功" : "重置密码"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            重置密码后需要重新登录
          </p>
        </form>
      )}
    </div>
  );
}
