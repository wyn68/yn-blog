"use client";

import { useState, useEffect } from "react";
import { Send, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase";
import { submitMessage } from "@/actions/messages";

export default function MessageForm() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      error("请输入留言内容");
      return;
    }
    
    if (content.length > 2000) {
      error("留言内容不能超过2000字");
      return;
    }

    setIsSubmitting(true);
    
    const result = await submitMessage(content);
    
    if (result.success) {
      success("留言提交成功，感谢您的反馈！");
      setContent("");
    } else {
      error(result.error || "提交失败，请稍后重试");
    }
    
    setIsSubmitting(false);
  };

  if (!session) {
    return (
      <div className="card p-6 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">登录后留言</h3>
            <p className="text-sm text-muted-foreground mb-3">
              请先登录账号，才能给管理员留言
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              立即登录
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">给管理员留言</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入您的留言（1-2000字）..."
              className="w-full h-36 px-4 py-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
              maxLength={2000}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${content.length > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/2000
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim() || content.length > 2000}
            isLoading={isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            提交留言
          </Button>
        </div>
      </form>
    </div>
  );
}