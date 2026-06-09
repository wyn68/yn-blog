"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { User, Calendar, Globe, BookOpen, Eye, Clock, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import type { Profile, Post } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { fetchAuthorData } from "@/actions/authors";
import { calculateReadingTime } from "@/lib/utils";

interface AuthorPost extends Post {
  profiles?: { username: string; avatar_url?: string };
  categories?: { name: string; slug: string };
  reading_time?: number;
  comment_count?: number;
}

export default function AuthorProfilePage() {
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<AuthorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const postsPerPage = 6;

  const loadData = useCallback(async (page: number) => {
    if (page === 1) setLoading(true);
    else setLoadingPosts(true);

    try {
      const data = await fetchAuthorData(profileId, page, postsPerPage);

      if (!data.profile) {
        setError("未找到该作者");
        return;
      }

      setProfile(data.profile);
      setTotalPosts(data.totalPosts);
      setPosts(data.posts.map(p => ({
        ...p,
        reading_time: calculateReadingTime(p.content || ''),
      })) as AuthorPost[]);
    } catch (err) {
      setError("加载作者信息失败");
      console.error("Error fetching author data:", err);
    } finally {
      setLoading(false);
      setLoadingPosts(false);
    }
  }, [profileId]);

  useEffect(() => {
    setError(null);
    loadData(1);
  }, [profileId, loadData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知日期";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "未知日期" : date.toLocaleDateString("zh-CN");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "管理员";
      case "editor": return "编辑";
      case "author": return "作者";
      default: return "普通用户";
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "editor": return "bg-orange-100 text-orange-700";
      case "author": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <LoadingSpinner text="加载作者信息..." />;
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">{error || "作者不存在"}</h1>
          <LoadingLink href="/" className="text-primary hover:underline">
            返回首页
          </LoadingLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
            返回上一页
          </button>
        </div>
        <div className="card p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <OptimizedImage
                  src={profile.avatar_url}
                  alt={profile.username || "用户头像"}
                  className="w-full h-full object-cover"
                  fill={true}
                  aspectRatio="1/1"
                  sizes="96px"
                />
              ) : (
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                {profile.username || "匿名作者"}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
                {profile.bio || "暂无个人简介"}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleClass(profile.role)}`}>
                  {getRoleLabel(profile.role)}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 sm:h-4 w-3 sm:w-4" />
                  {totalPosts} 篇文章
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">注册时间</p>
                <p className="font-medium text-xs sm:text-sm">{formatDate(profile.created_at)}</p>
              </div>
            </div>
            {profile.website && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">个人网站</p>
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-xs sm:text-sm text-primary hover:underline truncate block"
                    title={profile.website}
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <BookOpen className="h-4 sm:h-5 w-4 sm:w-5" />
            发布文章
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({totalPosts})
            </span>
          </h2>

          {loadingPosts ? (
            <LoadingSpinner text="加载文章列表..." />
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {posts.map((post) => (
                  <LoadingLink
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="card overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {post.featured_image && (
                      <div className="relative h-32 sm:h-40 overflow-hidden">
                        <OptimizedImage
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fill={true}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          aspectRatio="16/9"
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      {post.categories && (
                        <span className="text-xs text-primary hover:underline mb-2 inline-block">
                          {post.categories.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.reading_time || 1} 分钟
                        </span>
                      </div>
                    </div>
                  </LoadingLink>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="上一页"
                  >
                    <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                              page === currentPage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="下一页"
                  >
                    <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="h-10 sm:h-12 w-10 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">暂无文章</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
