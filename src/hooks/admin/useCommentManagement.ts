'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCommentsByStatus } from '@/services/comments';
import type { Comment } from '@/types';
import type { CommentStatus } from '@/lib/status';

export function useCommentManagement() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);
  const [rejectedComments, setRejectedComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pending, approved, rejected] = await Promise.all([
        getCommentsByStatus('pending'),
        getCommentsByStatus('approved'),
        getCommentsByStatus('rejected'),
      ]);
      setPendingComments(pending);
      setApprovedComments(approved);
      setRejectedComments(rejected);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载评论失败');
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filterComments = (comments: Comment[], searchTerm: string) => {
    if (!searchTerm) return comments;
    const lowerTerm = searchTerm.toLowerCase();
    return comments.filter(
      (comment) =>
        (!comment.profiles?.username || comment.profiles.username.toLowerCase().includes(lowerTerm)) ||
        (!comment.content || comment.content.toLowerCase().includes(lowerTerm)) ||
        (!comment.posts?.title || comment.posts.title.toLowerCase().includes(lowerTerm))
    );
  };

  const updateCommentStatus = (commentId: string, newStatus: CommentStatus) => {
    setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
    setApprovedComments((prev) => prev.filter((c) => c.id !== commentId));
    setRejectedComments((prev) => prev.filter((c) => c.id !== commentId));
    if (newStatus === 'approved') {
      setApprovedComments((prev) => [...prev, { id: commentId, status: 'approved' } as Comment]);
    } else if (newStatus === 'rejected') {
      setRejectedComments((prev) => [...prev, { id: commentId, status: 'rejected' } as Comment]);
    }
  };

  const removeComment = (commentId: string) => {
    setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
    setApprovedComments((prev) => prev.filter((c) => c.id !== commentId));
    setRejectedComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return {
    pendingComments,
    approvedComments,
    rejectedComments,
    isLoading,
    error,
    filterComments,
    updateCommentStatus,
    removeComment,
    refetch: fetchComments,
    setError,
  };
}