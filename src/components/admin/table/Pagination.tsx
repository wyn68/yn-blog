'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | 'dots')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('dots');
      }
      
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('dots');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-4 py-3 border-t border-border ${className}`}>
      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        显示第 {Math.max(1, (currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, totalCount)} 条，共 {totalCount} 条
      </div>
      
      <nav className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="首页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {pageNumbers.map((page, index) => (
          page === 'dots' ? (
            <span key={index} className="px-2 text-muted-foreground">...</span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="末页"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}