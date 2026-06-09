'use client';

import type { Comment } from '@/types';
import Image from "next/image";

interface CommentCardProps {
  comment: Comment;
  showActions?: boolean;
  onApprove?: (commentId: string) => void;
  onReject?: (commentId: string) => void;
  onHide?: (commentId: string) => void;
  onRestore?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentCard({
  comment,
  showActions = true,
  onApprove,
  onReject,
  onHide,
  onRestore,
  onDelete,
}: CommentCardProps) {
  return (
    <div className="card p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-accent flex items-center justify-center relative flex-shrink-0">
              {comment.profiles?.avatar_url ? (
                <Image
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.username || ""}
                  fill
                  className="object-cover"
                  sizes="28px"
                  quality={80}
                />
              ) : (
                <span className="text-xs sm:text-sm">{comment.profiles?.username?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base truncate">{comment.profiles?.username || '匿名用户'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-2">{comment.content}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            文章: {comment.posts?.title}
          </p>
        </div>
        {showActions && (
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {onApprove && (
              <button
                onClick={() => onApprove(comment.id)}
                className="btn btn-ghost p-1.5 sm:p-2 text-green-500 hover:bg-green-50"
                title="通过"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(comment.id)}
                className="btn btn-ghost p-1.5 sm:p-2 text-yellow-500 hover:bg-yellow-50"
                title="拒绝"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onRestore && (
              <button
                onClick={() => onRestore(comment.id)}
                className="btn btn-ghost p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50"
                title="恢复"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onHide && (
              <button
                onClick={() => onHide(comment.id)}
                className="btn btn-ghost p-1.5 sm:p-2 text-gray-500 hover:bg-gray-50"
                title="隐藏"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="btn btn-ghost p-1.5 sm:p-2 text-red-500 hover:bg-red-50"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}