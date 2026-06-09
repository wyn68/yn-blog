"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LoadingLink from "@/components/LoadingLink";
import { useRouter } from "next/navigation";
import { useRouterState } from "@/lib/router-state";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Calendar, ArrowLeft, MessageCircle, Clock, Tag, Share2, Bookmark, ChevronLeft, ChevronRight, Eye, AlertCircle, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { calculateReadingTime } from "@/lib/utils";
import { handleIncrementViewCount } from "@/actions/posts";
import { toggleFavorite, getFavoriteStatus } from "@/actions/favorites";
import TableOfContents from "@/components/TableOfContents";
import LazyCommentSection from "@/components/LazyCommentSection";
import { AuthorAvatar } from "@/components/ui/Avatar";
import type { Tag as TagType } from "@/types";
import type { Post } from "@/types";

const strictSanitizeSchema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames || []).filter(
    (tag: string) => !['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'].includes(tag)
  ),
  attributes: {
    ...defaultSchema.attributes,
    '*': ['className', 'id', 'title', 'lang', 'dir'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    td: ['align', 'colspan', 'rowspan'],
    th: ['align', 'colspan', 'rowspan', 'scope'],
  },
};

interface PostDetailClientProps {
  post: Post & {
    profiles?: { id?: string; username: string; avatar_url?: string };
    categories?: { name: string; slug: string };
  };
  postTags: TagType[];
  prevPost?: { slug: string; title: string } | null;
  nextPost?: { slug: string; title: string } | null;
}
export default function PostDetailClient({
  post,
  postTags,
  prevPost,
  nextPost,
}: PostDetailClientProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  
  const [isCopied, setIsCopied] = useState(false);
  const [viewCount, setViewCount] = useState(post.view_count || 0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const hasIncrementedView = useRef(false);

  const readingTime = calculateReadingTime(post.content);

  useEffect(() => {
    if (hasIncrementedView.current) return;
    
    hasIncrementedView.current = true;
    
    const incrementView = async () => {
      const result = await handleIncrementViewCount(post.id);
      if (result.success && result.viewCount) {
        setViewCount(result.viewCount);
      }
    };

    incrementView();
  }, [post.id]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const result = await getFavoriteStatus(post.id);
      setIsFavorite(result.isFavorite);
    };
    fetchFavoriteStatus();
  }, [post.id]);

  const handleFavorite = async () => {
    setIsFavoriteLoading(true);
    const result = await toggleFavorite(post.id);
    
    if (result.success) {
      setIsFavorite(result.isFavorite);
      setFavoriteMessage(result.message);
      setTimeout(() => setFavoriteMessage(null), 2000);
    } else {
      if (result.message === "请先登录") {
        setShowLoginAlert(true);
        setTimeout(() => setShowLoginAlert(false), 3000);
      }
    }
    
    setIsFavoriteLoading(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.content.substring(0, 150),
          url,
        });
      } catch {
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const router = useRouter();
  const { startLoading } = useRouterState();

  const handleAuthorClick = () => {
    if (post.profiles?.id) {
      startLoading();
      router.push(`/authors/${post.profiles.id}`);
    }
  };

  return (
    <>
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      <article className="max-w-4xl mx-auto pb-12 sm:pb-16">
        <header className="mb-6 sm:mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
            返回首页
          </Link>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
            {post.categories && (
              <Link
                href={`/categories/${post.categories.slug}`}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-secondary hover:bg-secondary/80 rounded-full text-xs sm:text-sm font-medium transition-colors"
              >
                {post.categories.name}
              </Link>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AuthorAvatar
                profileId={post.profiles?.id || ""}
                src={post.profiles?.avatar_url}
                alt={post.profiles?.username || "作者头像"}
                size="sm"
                onAuthorClick={handleAuthorClick}
              />
              <span
                onClick={handleAuthorClick}
                className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
              >
                {post.profiles?.username || "匿名作者"}
              </span>
            </div>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
              {new Date(post.created_at).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
              {readingTime}分钟
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <MessageCircle className="h-3 sm:h-4 w-3 sm:w-4" />
              {post.comment_count || 0}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
              {viewCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="btn btn-outline text-xs sm:text-sm px-3 sm:px-4 py-1.5"
            >
              <Share2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-1.5" />
              {isCopied ? "已复制" : "分享"}
            </button>
            <button
              onClick={handleFavorite}
              disabled={isFavoriteLoading}
              className={`btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 transition-colors ${
                isFavorite 
                  ? "btn-primary" 
                  : "btn-outline hover:bg-accent"
              }`}
            >
              <Bookmark className={`h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-1.5 ${isFavorite ? "fill-current" : ""}`} />
              {isFavoriteLoading ? "处理中..." : isFavorite ? "已收藏" : "收藏"}
            </button>
          </div>

          {favoriteMessage && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-green-600">
              <Check className="h-3 sm:h-4 w-3 sm:w-4" />
              {favoriteMessage}
            </div>
          )}

          {showLoginAlert && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-yellow-600">
              <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4" />
              请先登录以收藏文章
            </div>
          )}
        </header>

        {post.featured_image && (
          <div className="relative w-full h-[160px] sm:h-[220px] md:h-[280px] lg:h-[360px] xl:h-[450px] rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 md:mb-10 animate-fade-in">
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose-custom animate-fade-in-up">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, strictSanitizeSchema]]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {postTags.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Tag className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
              <span className="font-semibold text-sm sm:text-base">标签</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {postTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-full bg-secondary hover:bg-secondary/80 text-xs sm:text-sm font-medium transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="card p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <AuthorAvatar
                profileId={post.profiles?.id || ""}
                src={post.profiles?.avatar_url}
                alt={post.profiles?.username || "作者头像"}
                size="lg"
                onAuthorClick={handleAuthorClick}
              />
              <div className="flex-1">
                <h3 
                  onClick={handleAuthorClick}
                  className="font-semibold text-base sm:text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
                >
                  {post.profiles?.username || "匿名作者"}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  一名热爱技术、专注于分享知识的开发者。如果您喜欢我的文章，欢迎关注并订阅 RSS。
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {prevPost ? (
            <LoadingLink
              href={`/posts/${prevPost.slug}`}
              className="card p-3 sm:p-4 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                <ChevronLeft className="h-3 sm:h-4 w-3 sm:w-4" />
                上一篇
              </div>
              <p className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {prevPost.title}
              </p>
            </LoadingLink>
          ) : (
            <div />
          )}
          {nextPost && (
            <LoadingLink
              href={`/posts/${nextPost.slug}`}
              className="card p-3 sm:p-4 hover:bg-secondary/50 transition-colors group text-right"
            >
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                下一篇
                <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4" />
              </div>
              <p className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {nextPost.title}
              </p>
            </LoadingLink>
          )}
        </nav>

        <LazyCommentSection postId={post.id} commentCount={post.comment_count || 0} />
      </article>
      <TableOfContents />
    </>
  );
}