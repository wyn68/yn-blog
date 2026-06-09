"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";

type ConfirmStatus = "loading" | "success" | "error";
type ErrorType = "expired" | "invalid" | "network" | "unknown";

export default function ConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [errorType, setErrorType] = useState<ErrorType>("unknown");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token || !type) {
      setStatus("error");
      setMessage("无效的验证链接");
      return;
    }

    const confirmEmail = async () => {
      try {
        const supabase = createClient();
        
        if (type === "email") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) {
            if (error.message.includes("Token has expired")) {
              setStatus("error");
              setErrorType("expired");
              setMessage("验证链接已过期，请登录后重新发送验证邮件");
            } else if (error.message.includes("Invalid token")) {
              setStatus("error");
              setErrorType("invalid");
              setMessage("无效的验证链接，请检查链接是否正确");
            } else {
              setStatus("error");
              setErrorType("unknown");
              setMessage(error.message || "验证失败");
            }
          } else {
            setStatus("success");
            setMessage("邮箱验证成功！您现在可以登录账户了");
            
            const timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  router.push("/login");
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          setStatus("error");
          setMessage("未知的验证类型");
        }
      } catch {
        setStatus("error");
        setErrorType("network");
        setMessage("网络错误，请稍后重试");
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 20, delay: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="card p-8 sm:p-10 text-center shadow-xl border-border">
          {status === "loading" && (
            <>
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <Loader2 className="relative z-10 h-10 w-10 mx-auto pt-5 animate-spin text-primary" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold mb-3 text-foreground">验证中...</h1>
              <p className="text-muted-foreground">正在验证您的邮箱地址，请稍候...</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold mb-3 text-foreground">验证成功</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                <span>自动跳转登录页面</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {countdown}s
                </motion.span>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                立即登录
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold mb-3 text-foreground">验证失败</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                {errorType === "expired" ? (
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                      去登录
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors text-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      重新注册
                    </button>
                  </>
                ) : errorType === "invalid" ? (
                  <button
                    onClick={() => router.push("/register")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    重新注册
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setStatus("loading");
                        setMessage("");
                        const token = searchParams.get("token");
                        const type = searchParams.get("type");
                        if (token && type) {
                          window.location.href = `/auth/confirm?token=${token}&type=${type}`;
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      重新验证
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors text-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      重新注册
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}