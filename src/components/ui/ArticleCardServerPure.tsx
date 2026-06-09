import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Calendar, User, Clock, MessageCircle, ArrowRight, Eye } from "lucide-react";
import { calculateReadingTime } from "@/lib/utils";
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

export function ArticleCardServerPure({
  post,
  variant = "default",
  priority = false,
}: ArticleCardProps) {
  const readingTime = post.reading_time || calculateReadingTime(post.content || '');
  const commentCount = post.comment_count || 0;
  const viewCount = post.view_count || 0;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知日期";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "未知日期" : date.toLocaleDateString("zh-CN");
  };

  const displayDate = formatDate(post.created_at);

  if (variant === "featured") {
    return (
      <div className="block group relative card overflow-hidden hover-lift-card cursor-pointer">
        {post.featured_image && (
          <div className="relative h-64 overflow-hidden">
            <Link
              href={`/posts/${post.slug}`}
              className="absolute inset-0"
            >
              <OptimizedImage
                src={post.featured_image}
                alt={post.title}
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </Link>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {post.categories && (
                <Link
                  href={`/categories/${post.categories.slug}`}
                  className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full mb-3 hover:bg-primary hover:transition-colors relative z-10"
                >
                  {post.categories.name}
                </Link>
              )}
              <Link
                href={`/posts/${post.slug}`}
                className="relative z-10 block"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary-foreground hover:transition-colors">
                  {post.title}
                </h2>
                <p className="text-foreground/80 text-sm line-clamp-2 mb-4">
                  {post.excerpt || post.content?.substring(0, 120)}...
                </p>
              </Link>
              <div className="flex items-center gap-4 text-foreground/70 text-sm relative z-10">
                <span className="flex items-center gap-1.5">
                  {post.profiles?.avatar_url ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-foreground/20 flex items-center justify-center">
                      <OptimizedImage
                        src={post.profiles.avatar_url}
                        alt={post.profiles.username}
                        className="w-full h-full object-cover"
                        fill={true}
                        aspectRatio="1/1"
                        sizes="24px"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center">
                      <User className="h-3 w-3 text-foreground/70" />
                    </div>
                  )}
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
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 hover:transition-colors cursor-pointer group">
        {post.featured_image && (
          <Link
            href={`/posts/${post.slug}`}
            className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
          >
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill={true}
              sizes="80px"
              className="object-cover"
              aspectRatio="1/1"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {post.categories && (
            <Link
              href={`/categories/${post.categories.slug}`}
              className="text-xs text-muted-foreground hover:text-foreground hover:transition-colors"
            >
              {post.categories.name}
            </Link>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="block"
          >
            <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary hover:transition-colors mt-1">
              {post.title}
            </h3>
          </Link>
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
      </div>
    );
  }

  return (
    <div className="block group card overflow-hidden hover-lift-card cursor-pointer">
      <div className="flex flex-row items-stretch">
        {post.featured_image && (
          <div className="w-1/3 flex-shrink-0 relative">
            <Link
              href={`/posts/${post.slug}`}
              className="absolute inset-0 z-10"
            >
              <span className="absolute inset-0" />
            </Link>
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill={true}
              sizes="(max-width: 640px) 100vw, 33vw"
              priority={priority}
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            {post.categories && (
              <Link
                href={`/categories/${post.categories.slug}`}
                className="text-xs px-2.5 py-1 bg-secondary hover:bg-secondary/80 rounded-full hover:transition-colors"
              >
                {post.categories.name}
              </Link>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {displayDate}
            </span>
          </div>

          <Link
            href={`/posts/${post.slug}`}
            className="block"
          >
            <h2 className="text-sm sm:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary hover:transition-colors">
              {post.title}
            </h2>

            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-4 flex-1">
              {post.excerpt || post.content?.substring(0, 100)}...
            </p>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {post.profiles?.avatar_url ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  <OptimizedImage
                    src={post.profiles.avatar_url}
                    alt={post.profiles.username}
                    className="w-full h-full object-cover"
                    fill={true}
                    aspectRatio="1/1"
                    sizes="24px"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                </div>
              )}
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
    </div>
  );
}

export function ArticleCardHorizontalServerPure({ post }: { post: ArticleCardProps["post"] }) {
  const readingTime = post.reading_time || calculateReadingTime(post.content || '');
  const viewCount = post.view_count || 0;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知日期";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "未知日期" : date.toLocaleDateString("zh-CN");
  };

  const displayDate = formatDate(post.created_at);

  return (
    <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-secondary/50 hover:transition-colors cursor-pointer group">
      {post.featured_image && (
        <Link
            href={`/posts/${post.slug}`}
            className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
          >
          <OptimizedImage
            src={post.featured_image}
            alt={post.title}
            fill={true}
            sizes="96px"
            className="object-cover"
            aspectRatio="1/1"
          />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        {post.categories && (
          <Link
            href={`/categories/${post.categories.slug}`}
            className="text-xs text-primary hover:underline hover:transition-colors"
          >
            {post.categories.name}
          </Link>
        )}
        <Link
            href={`/posts/${post.slug}`}
            className="block"
          >
            <h3 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary hover:transition-colors mt-1">
              {post.title}
            </h3>
          </Link>
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
      <Link
        href={`/posts/${post.slug}`}
        className="flex-shrink-0"
      >
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}

export default ArticleCardServerPure;
