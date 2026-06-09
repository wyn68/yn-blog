import type { Metadata } from "next";
import type { Post } from "@/types";
import { Suspense } from "react";
import { getPosts, getPopularPosts } from "@/services/posts";
import { getCategories } from "@/services/categories";
import { getTags } from "@/services/tags";
import { getHeroBannerConfig, getSiteConfig, getSiteStats } from "@/services/settings";
import LoadingLink from "@/components/LoadingLink";
import ArticleCardServer from "@/components/ui/ArticleCardServer";
import { HeroBannerClientWrapper } from "@/components/hero/HeroBannerClientWrapper";
import FadeInServer from "@/components/FadeInServer";
import AnnouncementToast from "@/components/AnnouncementToast";
import JsonLd from "@/components/JsonLd";
import { ArrowUpRight, FileText, FolderOpen, Tag, TrendingUp } from "lucide-react";
import { ArticleListSkeleton, SidebarSkeleton } from "@/components/ui/Skeleton";
import { generateSEOMetadata, generateBreadcrumbJSONLD } from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const title = siteConfig.seoTitle || siteConfig.siteTitle || "YN Blog - 现代化博客平台";
  const description = siteConfig.seoDescription || siteConfig.siteDescription || 
    "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。提供高质量的技术文章、教程和最佳实践。";

  return generateSEOMetadata({
    title,
    description,
    keywords: [
      "YN Blog",
      "博客",
      "技术博客",
      "Next.js",
      "React",
      "Supabase",
      "TypeScript",
      "前端开发",
      "Web 开发",
      "编程教程",
    ],
    url: baseUrl,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

// 延迟加载的组件
async function PopularPostsSection() {
  const popularPosts = await getPopularPosts(3) as (Post & { comment_count: number; reading_time: number })[];
  
  return (
    <div className="mt-16">
      <FadeInServer delay={0.4}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            热门文章
          </h2>
        </div>
      </FadeInServer>
      <div className="space-y-6">
        {popularPosts.length > 0 ? (
          popularPosts.map((post, index) => (
            <FadeInServer key={post.id} delay={0.5 + index * 0.1}>
              <ArticleCardServer post={post} variant="compact" />
            </FadeInServer>
          ))
        ) : (
          <FadeInServer>
            <div className="rounded-2xl p-12 text-center bg-muted border border-border">
              <div className="text-muted-foreground">暂无热门文章</div>
            </div>
          </FadeInServer>
        )}
      </div>
    </div>
  );
}

async function PopularPostsSidebar() {
  const popularPosts = await getPopularPosts(3) as (Post & { comment_count: number; reading_time: number })[];
  
  return (
    <FadeInServer delay={0.1}>
      <div className="rounded-2xl p-6 bg-card border border-border shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            热门文章
          </h3>
        </div>
        <div className="space-y-4">
          {popularPosts.length > 0 ? (
            popularPosts.map((post, index) => (
              <LoadingLink
                key={post.id}
                href={`/posts/${post.slug}`}
                className="flex items-center gap-3 group"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                  {post.title}
                </span>
              </LoadingLink>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              暂无热门文章
            </div>
          )}
        </div>
      </div>
    </FadeInServer>
  );
}

async function SiteStatsSidebar() {
  // 使用 getSiteStats() 获取聚合统计数据，避免全量加载已发布文章
  const stats = await getSiteStats();
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <FadeInServer delay={0.3}>
      <div className="rounded-2xl p-6 bg-card border border-border shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            博客数据
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-3xl font-bold text-card-foreground mb-1">
              {stats.posts}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              文章
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-3xl font-bold text-card-foreground mb-1">
              {categories.length}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              分类
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-3xl font-bold text-card-foreground mb-1">
              {tags.length}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              标签
            </div>
          </div>
        </div>
      </div>
    </FadeInServer>
  );
}

async function CategoriesSidebar() {
  const categories = await getCategories();
  const limitedCategories = categories.slice(0, 12);
  
  return (
    <FadeInServer delay={0.4}>
      <div className="rounded-2xl p-6 bg-card border border-border shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">
              分类
            </h3>
          </div>
          {categories.length > 12 && (
            <LoadingLink
              href="/categories"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              查看全部
            </LoadingLink>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {limitedCategories.map((category) => (
            <LoadingLink
              key={category.id}
              href={`/categories/${category.slug}`}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {category.name}
            </LoadingLink>
          ))}
        </div>
      </div>
    </FadeInServer>
  );
}

async function TagsSidebar() {
  const tags = await getTags();
  const popularTags = tags.slice(0, 12);
  
  return (
    <FadeInServer delay={0.5}>
      <div className="rounded-2xl p-6 bg-card border border-border shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Tag className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">
              热门标签
            </h3>
          </div>
          <LoadingLink
            href="/tags"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            查看全部
          </LoadingLink>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <LoadingLink
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105"
            >
              {tag.name}
            </LoadingLink>
          ))}
        </div>
      </div>
    </FadeInServer>
  );
}

export default async function HomePage() {
  // 先获取立即渲染需要的数据
  const [posts, bannerConfig, siteStats, siteConfig] = await Promise.all([
    getPosts({ status: "published", limit: 6 }) as Promise<(Post & { comment_count: number })[]>,
    getHeroBannerConfig(),
    getSiteStats(),
    getSiteConfig(),
  ]);

  const siteName = siteConfig.siteTitle || "YN Blog";
  const siteDescription = siteConfig.siteDescription || 
    "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。";

  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: siteName,
    description: siteDescription,
    url: baseUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/posts/${post.slug}`,
        name: post.title,
      })),
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "首页", item: baseUrl },
    ]),
  };

  return (
    <>
      <JsonLd data={homePageJsonLd} />
      <AnnouncementToast />
      <div className="min-h-screen text-foreground">
        <div className="container mx-auto px-4 xs:px-5 sm:px-6 py-8 xs:py-10 sm:py-12 md:py-14">
          {/* Hero Section - 立即显示 */}
          <section className="mb-16 xs:mb-20 sm:mb-24">
            <HeroBannerClientWrapper config={bannerConfig} stats={siteStats} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Latest Posts - 立即显示 */}
              <div>
                <FadeInServer>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-foreground">
                      最新文章
                    </h2>
                    <LoadingLink
                      href="/posts"
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      查看全部
                      <ArrowUpRight className="w-4 h-4" />
                    </LoadingLink>
                  </div>
                </FadeInServer>
                <div className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map((post, index) => (
                      <FadeInServer key={post.id} delay={index * 0.1}>
                        <ArticleCardServer post={post} />
                      </FadeInServer>
                    ))
                  ) : (
                    <FadeInServer>
                      <div className="rounded-2xl p-12 text-center bg-muted border border-border">
                        <div className="text-muted-foreground">暂无文章</div>
                      </div>
                    </FadeInServer>
                  )}
                </div>
              </div>

              {/* Popular Posts - 延迟显示 */}
              <Suspense fallback={<ArticleListSkeleton count={3} />}>
                <PopularPostsSection />
              </Suspense>
            </div>

            {/* Sidebar - 延迟显示 */}
            <div className="lg:col-span-4 space-y-5">
              <Suspense fallback={<SidebarSkeleton />}>
                <PopularPostsSidebar />
              </Suspense>
              
              <Suspense fallback={<SidebarSkeleton />}>
                <SiteStatsSidebar />
              </Suspense>
              
              <Suspense fallback={<SidebarSkeleton />}>
                <CategoriesSidebar />
              </Suspense>
              
              <Suspense fallback={<SidebarSkeleton />}>
                <TagsSidebar />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}