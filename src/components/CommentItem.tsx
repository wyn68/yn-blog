"use client";

import { useState } from "react";
import { Reply, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment } from "@/types";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface CommentItemProps {
  comment: Comment & { children?: Comment[] };
  depth?: number;
  onReply: (commentId: string | null) => void;
  isReplying: boolean;
}

const CommentItemComponent = ({
  comment,
  depth = 0,
  onReply,
  isReplying,
}: CommentItemProps) => {
  const [isRepliesOpen, setIsRepliesOpen] = useState(depth < 2);
  const hasReplies = comment.children && comment.children.length > 0;

  return (
    <div
      className="animate-fade-in"
      style={{ marginLeft: depth > 0 ? `${Math.min(depth, 3) * 24}px` : 0 }}
    >
      <div className="card p-5 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            {comment.profiles?.avatar_url ? (
              <OptimizedImage
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username}
                className="w-full h-full object-cover"
                fill={true}
                aspectRatio="1/1"
                sizes="40px"
              />
            ) : null}
            <span className={`text-xs sm:text-sm font-medium ${comment.profiles?.avatar_url ? 'hidden fallback-avatar' : ''}`}>
              {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.profiles?.username || "匿名用户"}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString("zh-CN")}
              </span>
            </div>
            <p className="text-foreground/90 text-sm leading-relaxed mb-3">
              {comment.content}
            </p>
            <button
              onClick={() => onReply(isReplying ? null : comment.id)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              回复
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="mt-2">
          <button
            onClick={() => setIsRepliesOpen(!isRepliesOpen)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {isRepliesOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {isRepliesOpen ? "收起" : "展开"} {comment.children!.length} 条回复
          </button>

          {isRepliesOpen && (
            <div className="border-l-2 border-border pl-4">
              {comment.children!.map((child) => (
                <CommentItemComponent
                  key={child.id}
                  comment={child}
                  depth={depth + 1}
                  onReply={onReply}
                  isReplying={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItemComponent;