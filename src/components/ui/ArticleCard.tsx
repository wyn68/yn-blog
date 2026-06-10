"use client";

import { memo, type MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, MessageCircle, Eye } from "lucide-react";
import { calculateReadingTime, formatDate } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import LoadingLink from "@/components/LoadingLink";
import { useRouterState } from "@/lib/router-state";
import type { Post } from "@/types";

interface ArticleCardProps {
  post: Post & {
    profiles?: { username: string; avatar_url?: string | null };
    categories?: { name: string; slug: string };
    reading_time?: number;
    comment_count?: number;
  };
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
}

const CategoryButton = memo(function CategoryButton({
  name,
  slug,
  className = "",
}: {
  name: string;
  slug: string;
  className?: string;
}) {
  const { startLoading } = useRouterState();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startLoading();
    router.push(`/categories/${slug}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {name}
    </button>
  );
});

const ArticleCard = memo(function ArticleCard({
  post,
  variant = "default",
  priority = false,
}: ArticleCardProps) {
  const readingTime = post.reading_time || calculateReadingTime(post.content || '');
  const commentCount = post.comment_count || 0;
  const viewCount = post.view_count || 0;
  
  const displayDate = formatDate(post.created_at);

  const router = useRouter();
  const { startLoading } = useRouterState();

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.profiles?.id) {
      startLoading();
      router.push(`/authors/${post.profiles.id}`);
    }
  };
  
  if (variant === "featured") {
    return (
      <LoadingLink href={`/posts/${post.slug}`} className="block group relative card overflow-hidden hover-lift-card cursor-pointer">
        {post.featured_image && (
          <div className="relative h-64 overflow-hidden">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              aspectRatio="16/9"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {post.categories && (
                <CategoryButton
                  name={post.categories.name}
                  slug={post.categories.slug}
                  className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full mb-3"
                />
              )}
              <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-foreground transition-colors">
                {post.title}
              </h2>
              <p className="text-white/80 text-sm line-clamp-2 mb-4">
                {post.excerpt || post.content?.substring(0, 120)}...
              </p>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <button
                    onClick={handleAuthorClick}
                    className="relative w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center hover:ring-2 hover:ring-white/50 transition-all cursor-pointer"
                    title={`查看 ${post.profiles?.username || "作者"} 的个人主页`}
                  >
                    {post.profiles?.avatar_url ? (
                      <Image
                        src={post.profiles.avatar_url}
                        alt={post.profiles.username}
                        fill
                        sizes="24px"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.fallback-author')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <User className={`h-3 w-3 text-white/70 ${post.profiles?.avatar_url ? 'hidden fallback-author' : ''}`} />
                  </button>
                  {post.profiles?.username || "匿名作者"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {displayDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime} 分钟
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {viewCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </LoadingLink>
    );
  }

  if (variant === "compact") {
    return (
      <LoadingLink href={`/posts/${post.slug}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
        {post.featured_image && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="80px"
              aspectRatio="1/1"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {post.categories && (
            <CategoryButton
              name={post.categories.name}
              slug={post.categories.slug}
              className="text-xs text-muted-foreground hover:text-foreground"
            />
          )}
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors mt-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{displayDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </span>
          </div>
        </div>
      </LoadingLink>
    );
  }

  return (
    <LoadingLink href={`/posts/${post.slug}`} className="block group card overflow-hidden hover-lift-card cursor-pointer">
      <div className="flex flex-row items-stretch">
        {post.featured_image && (
          <div className="w-1/3 flex-shrink-0 relative">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              priority={priority}
            />
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-3 sm:mb-3">
            {post.categories && (
              <CategoryButton
                name={post.categories.name}
                slug={post.categories.slug}
                className="text-xs px-2.5 py-1 sm:px-2.5 sm:py-1 bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
              />
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {displayDate}
            </span>
          </div>

          <h2 className="text-sm sm:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-4 flex-1">
            {post.excerpt || post.content?.substring(0, 100)}...
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <button
                onClick={handleAuthorClick}
                className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                title={`查看 ${post.profiles?.username || "作者"} 的个人主页`}
              >
                {post.profiles?.avatar_url ? (
                  <Image
                    src={post.profiles.avatar_url}
                    alt={post.profiles.username}
                    fill
                    sizes="24px"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.querySelector('.fallback-author')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground ${post.profiles?.avatar_url ? 'hidden fallback-author' : ''}`} />
              </button>
              <span>{post.profiles?.username || "匿名作者"}</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {readingTime}分钟
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                {commentCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                {viewCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </LoadingLink>
  );
});

export default ArticleCard;