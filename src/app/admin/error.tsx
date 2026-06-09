"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error.message);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">管理后台加载异常</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {error.message || "发生了意外错误"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary font-medium hover:bg-secondary/80 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </Link>
        </div>
      </div>
    </div>
  );
}
