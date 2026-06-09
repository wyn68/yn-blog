'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Post } from '@/types';
import ArticleCard from '@/components/ui/ArticleCard';
import Pagination from '@/components/admin/table/Pagination';
import { cn } from '@/lib/utils';

interface PostsListProps {
  initialPosts: (Post & { comment_count: number })[];
  postsPerPage: number;
  className?: string;
}

export default function PostsList({ initialPosts, postsPerPage, className }: PostsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPosts = initialPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return initialPosts.slice(startIndex, endIndex);
  }, [initialPosts, currentPage, postsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-6">
        {currentPosts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalPosts}
            pageSize={postsPerPage}
            onPageChange={handlePageChange}
          />
          <p className="text-center text-sm text-muted-foreground mt-2">
            第 {currentPage} / {totalPages} 页，共 {totalPosts} 篇文章
          </p>
        </div>
      )}

      {totalPosts === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">暂无文章</p>
        </div>
      )}
    </div>
  );
}
