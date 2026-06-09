"use server";

import { revalidatePath } from "next/cache";
import { createComment, approveComment, rejectComment, deleteComment, getComments } from "@/services/comments";
import { buildCommentTree } from "@/services/comments";
import { requireAuth, requireAuthorOrHigher } from "@/lib/auth";
import { redisCommentRateLimiter } from "@/lib/redis-rate-limiter";
import { sanitizeComment } from "@/lib/sanitize";
import type { Comment } from "@/types";

export async function handleCreateComment(postId: string, formData: FormData) {
  const profile = await requireAuth();

  const rateLimitKey = `${profile.id}:${postId}`;
  const rateLimitResult = await redisCommentRateLimiter.check(rateLimitKey);
  
  if (!rateLimitResult.allowed) {
    const resetSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    const resetMinutes = Math.ceil(resetSeconds / 60);
    
    const timeMessage = resetMinutes > 0 
      ? `${resetMinutes} 分钟`
      : `${resetSeconds} 秒`;
    
    throw new Error(`评论频率超限！您已在 1 分钟内评论了 ${rateLimitResult.totalLimit} 次。请 ${timeMessage} 后再试。`);
  }

  const content = formData.get("content") as string;
  const parentId = formData.get("parent_id") as string | null;

  if (!content || content.trim().length === 0) {
    throw new Error("评论内容不能为空");
  }

  if (content.trim().length < 1) {
    throw new Error("评论内容至少需要 1 个字符");
  }

  if (content.trim().length > 2000) {
    throw new Error("评论内容不能超过 2000 个字符");
  }

  const sanitizedContent = sanitizeComment(content);

  await createComment({
    content: sanitizedContent,
    post_id: postId,
    author_id: profile.id,
    parent_id: parentId || null,
    status: "pending",
  });

  revalidatePath(`/posts/${postId}`);
}

export async function getCommentRateLimitStatus(postId: string) {
  try {
    const profile = await requireAuth();
    const rateLimitKey = `${profile.id}:${postId}`;
    return await redisCommentRateLimiter.getStatus(rateLimitKey);
  } catch {
    return null;
  }
}

export async function handleApproveComment(commentId: string) {
  await requireAuthorOrHigher();

  await approveComment(commentId);

  revalidatePath("/admin/comments");
}

export async function handleRejectComment(commentId: string) {
  await requireAuthorOrHigher();

  await rejectComment(commentId);

  revalidatePath("/admin/comments");
}

export async function handleDeleteComment(commentId: string) {
  await requireAuthorOrHigher();

  await deleteComment(commentId);

  revalidatePath("/admin/comments");
}

export async function getPostComments(postId: string): Promise<(Comment & { children?: Comment[] })[]> {
  const comments = await getComments(postId, "approved");
  return buildCommentTree(comments);
}
