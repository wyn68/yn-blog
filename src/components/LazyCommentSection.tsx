"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";
import { getPostComments } from "@/actions/comments";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Comment } from "@/types";

const CommentSection = dynamic(() => import("@/components/CommentSection"), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>
  ),
  ssr: false,
});

interface LazyCommentSectionProps {
  postId: string;
  commentCount: number;
}

export default function LazyCommentSection({ postId, commentCount }: LazyCommentSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState<(Comment & { children?: Comment[] })[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    if (comments !== null || isLoading) return;
    
    setIsLoading(true);
    try {
      const data = await getPostComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId, comments, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          fetchComments();
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchComments]);

  return (
    <section className="mt-16" ref={containerRef}>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        评论 ({commentCount})
      </h2>
      
      {!isVisible || !comments ? (
        <div className="space-y-4">
          <div className="card p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </div>
          
          {commentCount > 0 && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        }>
          <CommentSection postId={postId} comments={comments} />
        </Suspense>
      )}
    </section>
  );
}