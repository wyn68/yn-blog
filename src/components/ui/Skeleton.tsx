interface SkeletonProps {
  className?: string;
  [key: string]: any;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div className={`skeleton ${className}`} {...props} />;
}

export function ArticleCardSkeleton() {
  return (
    <div className="card p-6 space-y-4 animate-pulse">
      <div className="flex gap-4">
        <Skeleton className="w-1/3 h-32 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="relative h-64">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompactPostSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 animate-pulse">
      <Skeleton className="w-20 h-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-4 animate-pulse">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6 space-y-4 animate-pulse">
        <Skeleton className="h-5 w-20" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="w-full h-64 rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 w-${Math.random() > 0.5 ? 'full' : '3/4'}`} />
        ))}
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-[360px] animate-pulse">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 border-4 rounded-full border-border" />
        <div className="absolute inset-0 border-4 rounded-full border-transparent border-t-foreground animate-spin" />
      </div>
    </div>
  );
}
