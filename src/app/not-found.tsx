"use client";

import LoadingLink from "@/components/LoadingLink";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-muted-foreground">页面未找到</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移除。
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <LoadingLink href="/" className="btn btn-primary">
            返回首页
          </LoadingLink>
          <LoadingLink href="/search" className="btn btn-outline">
            浏览文章
          </LoadingLink>
        </div>
      </div>
    </div>
  );
}
