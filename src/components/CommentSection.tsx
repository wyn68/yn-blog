"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, AlertCircle, LogIn, User } from "lucide-react";
import { handleCreateComment, getCommentRateLimitStatus } from "@/actions/comments";
import type { Comment } from "@/types";
import { useToast } from "@/components/ui/Toast";
import CommentItem from "./CommentItem";
import { createClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

// 浏览器端 Supabase 客户端模块级单例，避免每次组件挂载都创建新实例
const supabaseBrowser = createClient();

interface CommentSectionProps {
  postId: string;
  comments: (Comment & { children?: Comment[] })[];
}

interface RateLimitStatus {
  remaining: number;
  totalLimit: number;
  usedCount: number;
  allowed: boolean;
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [contentLength, setContentLength] = useState(0);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const { success, error, loading, dismiss } = useToast();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
      }
    };
  }, [dismiss]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setSession(session as Session | null);
    };
    getSession();
  }, []);

  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      try {
        const status = await getCommentRateLimitStatus(postId);
        if (status) {
          setRateLimitStatus({
            remaining: status.remaining,
            totalLimit: status.totalLimit,
            usedCount: status.usedCount,
            allowed: status.allowed
          });
        }
      } catch (err) {
        console.error('Failed to fetch rate limit status:', err);
      }
    };

    fetchRateLimitStatus();
  }, [postId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setContent(value);
      setContentLength(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (rateLimitStatus && rateLimitStatus.remaining <= 0) {
      error("评论频率超限", "您已达到本分钟内评论上限，请稍后再试");
      return;
    }

    setSubmitting(true);
    const toastId = loading("正在提交评论...");
    toastIdRef.current = toastId;

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (replyTo) {
        formData.append("parent_id", replyTo);
      }

      await handleCreateComment(postId, formData);
      
      dismiss(toastId);
      success("评论已成功提交", "您的评论已发布，等待审核");
      
      setContent("");
      setContentLength(0);
      setReplyTo(null);
      
      if (rateLimitStatus) {
        setRateLimitStatus({
          ...rateLimitStatus,
          remaining: Math.max(0, rateLimitStatus.remaining - 1),
          usedCount: rateLimitStatus.usedCount + 1
        });
      }
    } catch (err) {
      dismiss(toastId);
      console.error("Comment submission error:", err);
      error("提交评论失败", "评论提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string | null) => {
    setReplyTo(commentId);
  };

  const isOverLimit = rateLimitStatus && rateLimitStatus.remaining <= 0;
  const isNearLimit = rateLimitStatus && rateLimitStatus.remaining <= 2 && rateLimitStatus.remaining > 0;

  return (
    <div className="space-y-6">
      {!session ? (
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">登录后发表评论</h3>
              <p className="text-sm text-muted-foreground mb-3">
                请先登录账号，才能发表评论
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
      ) : (
        <>
          <form onSubmit={handleSubmit} className="card p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  className={`textarea flex-1 text-sm ${isOverLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={isOverLimit ? "评论频率超限，请稍后再试" : "写下你的评论..."}
                  rows={3}
                  disabled={submitting || !!isOverLimit}
                />
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isOverLimit && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        评论频率超限
                      </span>
                    )}
                    {isNearLimit && (
                      <span className="text-orange-600 dark:text-orange-400">
                        剩余 {rateLimitStatus.remaining} 次评论机会
                      </span>
                    )}
                  </div>
                  <span className={contentLength > 1800 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}>
                    {contentLength}/2000
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {rateLimitStatus && (
                <div className="text-xs text-muted-foreground">
                  本分钟已评论 {rateLimitStatus.usedCount}/{rateLimitStatus.totalLimit} 次
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !content.trim() || isOverLimit || contentLength < 1}
                className={`btn btn-primary text-sm px-6 sm:px-8 py-2 ${
                  isOverLimit 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : ''
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "提交中..." : isOverLimit ? "已达上限" : "发表评论"}
              </button>
            </div>
          </form>

          {replyTo && (
            <div className="card p-4 bg-accent/50">
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  className="textarea w-full text-sm"
                  placeholder="写下你的回复..."
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    回复中... {contentLength}/2000
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      disabled={submitting}
                      className="btn btn-ghost text-sm"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !content.trim() || contentLength < 2}
                      className="btn btn-primary text-sm"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      {submitting ? "提交中..." : "回复"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            isReplying={replyTo === comment.id}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">暂无评论，快来发表第一条评论吧！</p>
        </div>
      )}
    </div>
  );
}
