import { commentsRepository } from "@/repositories/comments-repository";
import type { Comment } from "@/types";

export async function getComments(postId?: string, status?: string) {
  return await commentsRepository.findByPostId(postId, status);
}

export async function getCommentById(id: string) {
  return await commentsRepository.findById(id);
}

export async function createComment(comment: Omit<Comment, "id" | "created_at" | "updated_at">) {
  return await commentsRepository.create(comment);
}

export async function updateComment(id: string, comment: Partial<Comment>) {
  return await commentsRepository.update(id, comment);
}

export async function deleteComment(id: string) {
  await commentsRepository.delete(id);
}

export async function approveComment(id: string) {
  return await commentsRepository.approve(id);
}

export async function rejectComment(id: string) {
  return await commentsRepository.reject(id);
}

export async function getCommentsByStatus(status: string) {
  return await commentsRepository.findByStatus(status);
}

export function buildCommentTree(comments: Comment[]): (Comment & { children?: Comment[] })[] {
  const commentMap = new Map<string, Comment & { children?: Comment[] }>();
  const rootComments: (Comment & { children?: Comment[] })[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    const commentWithChildren = commentMap.get(comment.id)!;
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id)!.children!.push(commentWithChildren);
    } else {
      rootComments.push(commentWithChildren);
    }
  });

  return rootComments;
}

export async function getCommentCount(postId?: string, status?: string) {
  return await commentsRepository.countByPostId(postId, status);
}
