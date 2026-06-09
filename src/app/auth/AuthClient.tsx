"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, RefreshCw, User, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouterState } from "@/lib/router-state";
import { validateEmailDomain } from "@/services/emailWhitelist";
import { validateEmailDomainServer } from "@/actions/emailValidation";

type AuthMode = "login" | "register";
type AuthStatus = "idle" | "loading" | "success" | "error";

function translateAuthError(errorMessage: string, mode: AuthMode): string {
  if (mode === "login") {
    if (errorMessage.includes("Email not confirmed")) {
      return "您的邮箱尚未验证，请检查邮箱并点击验证链接";
    }
    if (errorMessage.includes("Invalid login credentials")) {
      return "邮箱或密码错误，请重新输入";
    }
    if (errorMessage.includes("User not found")) {
      return "该用户不存在，请先注册";
    }
  } else {
    if (errorMessage.includes("email rate limit exceeded")) {
      return "邮件发送频率过高，请稍后再试（约5-10分钟后恢复）";
    }
    if (errorMessage.includes("email already registered")) {
      return "该邮箱已被注册，请使用其他邮箱";
    }
  }
  if (errorMessage.includes("password must be at least")) {
    return "密码长度不足，请输入至少8个字符";
  }
  if (errorMessage.includes("invalid email")) {
    return "邮箱格式无效，请输入正确的邮箱地址";
  }
  return errorMessage;
}

interface AuthClientProps {
  initialMode?: AuthMode;
}

export default function AuthClient({ initialMode = "login" }: AuthClientProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success">("idle");
  const [showResendButton, setShowResendButton] = useState(false);
  
  const router = useRouter();
  const { startLoading } = useRouterState();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "permission_denied") {
      setStatus("error");
      setMessage("您的账户没有权限访问该页面");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        startLoading();
        if (mode === "login") {
          router.push("/");
          router.refresh();
        } else {
          router.push("/login");
        }
      }, mode === "login" ? 1000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [status, mode, router, startLoading]);

  const validateLoginForm = () => {
    if (!email || !password) {
      setStatus("error");
      setMessage("请填写邮箱和密码");
      return false;
    }
    return true;
  };

  const validateRegisterForm = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setStatus("error");
      setMessage("请填写所有字段");
      return false;
    }

    if (username.length < 3 || username.length > 50) {
      setStatus("error");
      setMessage("用户名长度必须在3-50个字符之间");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("请输入有效的邮箱地址");
      return false;
    }

    const emailValidation = await validateEmailDomain(email);
    if (!emailValidation.valid) {
      setStatus("error");
      setMessage(emailValidation.message);
      return false;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("密码长度至少为8个字符");
      return false;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("两次输入的密码不一致");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(translateAuthError(error.message, "login"));
      setShowResendButton(error.message.includes("Email not confirmed"));
    } else {
      setStatus("success");
      setMessage("登录成功！");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateRegisterForm();
    if (!isValid) return;

    setStatus("loading");
    setMessage("");

    try {
      const serverValidation = await validateEmailDomainServer(email);
      if (!serverValidation.valid) {
        setStatus("error");
        setMessage(serverValidation.message);
        return;
      }

      const supabase = createClient();
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) {
        setStatus("error");
        const errorMessage = translateAuthError(signUpError.message, "register");
        setMessage(errorMessage || "注册失败");
        return;
      }

      setStatus("success");
      setMessage("注册成功！请检查您的邮箱，点击验证链接激活账户");
    } catch {
      setStatus("error");
      setMessage("网络错误，请稍后重试");
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("请先输入邮箱地址");
      return;
    }

    setResendStatus("loading");
    
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setMessage("重发验证邮件失败: " + error.message);
      setResendStatus("idle");
    } else {
      setResendStatus("success");
      setTimeout(() => setResendStatus("idle"), 3000);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (status === "error") {
        setStatus("idle");
        setMessage("");
      }
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-start mb-4">
            <a 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </a>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === "login" ? "欢迎回来" : "创建账户"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" ? "请登录您的账户" : "开始您的博客之旅"}
            </p>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {status === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <span>{message}</span>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-600 rounded-lg">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-foreground">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleInputChange(setUsername)}
                    placeholder="请输入用户名"
                    disabled={status === "loading" || status === "success"}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  placeholder="请输入邮箱"
                  disabled={status === "loading" || status === "success"}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder={mode === "login" ? "请输入密码" : "至少8个字符"}
                  disabled={status === "loading" || status === "success"}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={status === "loading" || status === "success"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    placeholder="再次输入密码"
                    disabled={status === "loading" || status === "success"}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {mode === "login" ? "登录中..." : "注册中..."}
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {mode === "login" ? "登录成功" : "注册成功"}
                </>
              ) : (
                mode === "login" ? "登录" : "注册"
              )}
            </button>
          </form>

          {mode === "login" && showResendButton && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResendEmail}
                disabled={resendStatus === "loading"}
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {resendStatus === "loading" ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : resendStatus === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    邮件已发送
                  </>
                ) : (
                  "重发验证邮件"
                )}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "还没有账户？" : "已有账户？"}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setStatus("idle");
                  setMessage("");
                  setUsername("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="ml-1 text-primary hover:underline transition-colors"
              >
                {mode === "login" ? "立即注册" : "立即登录"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}