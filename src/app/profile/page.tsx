"use client";

import { useState, useEffect, useCallback } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { User, Mail, Calendar, Globe, BookOpen, Clock, Eye, ArrowRight, BookmarkMinus } from "lucide-react";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import LoadingLink from "@/components/LoadingLink";
import type { Profile } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fetchCurrentProfile } from "@/actions/profile";
import { fetchMyFavorites, toggleFavorite, type FavoritePost } from "@/actions/favorites";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritePost[]>([]);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const MAX_VISIBLE_FAVORITES = 2;
  const visibleFavorites = showAllFavorites ? favorites : favorites.slice(0, MAX_VISIBLE_FAVORITES);
  const hasMoreFavorites = favorites.length > MAX_VISIBLE_FAVORITES;

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);

      // 通过 server action 获取 profile（走 Repository 层）
      const profileData = await fetchCurrentProfile();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData.profile);
      setEmail(profileData.email);

      // 通过 server action 获取收藏（走 Repository 层，过滤已删除文章）
      setLoadingFavorites(true);
      const favPosts = await fetchMyFavorites();
      setFavorites(favPosts);
      setLoadingFavorites(false);

      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  const refreshFavorites = useCallback(async () => {
    const favPosts = await fetchMyFavorites();
    setFavorites(favPosts);
    // 如果当前展开但刷新后收藏数 <= MAX_VISIBLE_FAVORITES，自动收起
    if (favPosts.length <= MAX_VISIBLE_FAVORITES && showAllFavorites) {
      setShowAllFavorites(false);
    }
  }, [showAllFavorites]);

  if (loading) {
    return <LoadingSpinner text="加载中..." />;
  }

  // profile 已在上方 loading 检查后处理，无需重复判断

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

  return (
    <div className="container mx-auto px-4 sm:px-0 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-3 sm:mb-4 shadow-lg overflow-hidden">
            {profile?.avatar_url ? (
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{profile?.username || "用户"}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{profile?.bio || "暂无个人简介"}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 sm:gap-6">
          <div className="space-y-4">
            <div className="card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">基本信息</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">邮箱</p>
                    <p className="font-medium text-sm sm:text-base whitespace-nowrap">{email || "未绑定邮箱"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">注册时间</p>
                    <p className="font-medium text-sm sm:text-base whitespace-nowrap">{formatDate(profile?.created_at)}</p>
                  </div>
                </div>
                {profile?.website && (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">个人网站</p>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline text-sm sm:text-base whitespace-nowrap"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">账户角色</h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleClass(profile?.role || '')}`}>
                  {getRoleLabel(profile?.role || '')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                我的收藏
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">({favorites.length})</span>
              </h2>

              {loadingFavorites ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <LoadingSpinner text="加载收藏..." />
                </div>
              ) : favorites.length > 0 ? (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {visibleFavorites.map((post) => (
                      <div key={post.id} className="flex items-center gap-3 sm:gap-4 group">
                        <LoadingLink
                          href={`/posts/${post.slug}`}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-secondary/50 transition-colors flex-1 min-w-0"
                        >
                          {post.featured_image && (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <OptimizedImage
                                src={post.featured_image}
                                alt={post.title}
                                fill={true}
                                sizes="80px"
                                className="object-cover"
                                aspectRatio="1/1"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {post.categories && (
                              <span className="text-xs text-primary hover:underline mb-1 inline-block">
                                {post.categories.name}
                              </span>
                            )}
                            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors mt-1 text-sm sm:text-base">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {calculateReadingTime(post.content || '')}分钟
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.view_count || 0}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </LoadingLink>
                        <button
                          onClick={async () => {
                            await toggleFavorite(post.id);
                            await refreshFavorites();
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0 group/btn"
                          title="取消收藏"
                        >
                          <BookmarkMinus className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {hasMoreFavorites && (
                    <button
                      onClick={() => setShowAllFavorites(!showAllFavorites)}
                      className="mt-4 w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                      {showAllFavorites
                        ? '收起'
                        : `查看全部 (${favorites.length})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base">暂无收藏文章</p>
                  <LoadingLink 
                    href="/" 
                    className="inline-flex items-center gap-2 mt-3 sm:mt-4 text-primary hover:underline text-sm sm:text-base"
                  >
                    去浏览文章
                  </LoadingLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
