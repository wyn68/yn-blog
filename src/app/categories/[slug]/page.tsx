/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import LoadingLink from "@/components/LoadingLink";
import JsonLd from "@/components/JsonLd";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/services/categories";
import { getPosts } from "@/services/posts";
import { getSiteConfig } from "@/services/settings";
import { 
  generateSEOMetadata, 
  generateCollectionPageJSONLD 
} from "@/lib/seo";
import type { Category, Post } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = await getSiteConfig();

  try {
    const category = await getCategoryBySlug(decodedSlug) as Category;
    // metadata 生成只需少量文章用于描述统计
    const posts = await getPosts({ categoryId: category.id, status: "published", limit: 10 }) as (Post & { comment_count: number })[];
    const categoryUrl = `${baseUrl}/categories/${category.slug}`;
    const title = `${category.name}分类`;
    const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : `${title} - ${siteConfig.siteTitle}`;
    const description = category.description ||
      `浏览 ${posts.length} 篇 ${category.name} 分类文章。${siteConfig.seoDescription || siteConfig.siteDescription || "YN Blog 提供高质量的技术文章、教程和最佳实践。"}`;

    return generateSEOMetadata({
      title: fullTitle,
      description,
      keywords: [category.name, "分类", "博客分类", "文章分类"],
      url: categoryUrl,
      image: "/og-image.png",
      imageAlt: title,
      type: "website",
    });
  } catch {
    return {
      title: "分类未找到",
      description: siteConfig.siteDescription,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = await getSiteConfig();

  let category;
  try {
    category = await getCategoryBySlug(decodedSlug) as Category;
  } catch {
    notFound();
    return;
  }

  // 限制最大加载数量，避免分类下有大量文章时性能问题
  const MAX_CATEGORY_POSTS = 200;
  const posts = await getPosts({
    categoryId: (category as Category).id,
    status: "published",
    limit: MAX_CATEGORY_POSTS,
  }) as any[];
  const categoryUrl = `${baseUrl}/categories/${(category as Category).slug}`;
  const title = `分类: ${(category as Category).name}`;
  const description = (category as Category).description ||
    `浏览 ${posts.length} 篇 ${(category as Category).name} 分类文章。${siteConfig.siteDescription || "YN Blog 提供高质量的技术文章、教程和最佳实践。"}`;

  const categoryPageJsonLd = generateCollectionPageJSONLD({
    name: title,
    description,
    url: categoryUrl,
    items: posts.map(post => ({ name: post.title, url: `${baseUrl}/posts/${post.slug}` })),
    breadcrumbItems: [
      { name: "首页", item: baseUrl },
      { name: "分类", item: `${baseUrl}/categories` },
      { name: category.name, item: categoryUrl },
    ],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <JsonLd data={categoryPageJsonLd} />
      <LoadingLink
        href="/categories"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 sm:mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回分类列表
      </LoadingLink>

        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">{category.name}</h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            {category.description || `共 ${posts.length} 篇文章`}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {posts?.map((post: any) => (
            <article key={post.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 hover:text-primary transition-colors">
                  <LoadingLink href={`/posts/${post.slug}`}>{post.title}</LoadingLink>
                </h2>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt || post.content.substring(0, 150)}...
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        {post.profiles?.avatar_url ? (
                          <OptimizedImage
                            src={post.profiles.avatar_url}
                            alt={post.profiles.username}
                            className="w-full h-full object-cover"
                            fill={true}
                            aspectRatio="1/1"
                            sizes="24px"
                          />
                        ) : (
                          <User className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      {post.profiles?.username || "匿名作者"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
                      {new Date(post.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <LoadingLink
                    href={`/posts/${post.slug}`}
                    className="flex items-center gap-1 text-primary hover:gap-2 transition-all text-xs sm:text-sm"
                  >
                    阅读更多
                    <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4" />
                  </LoadingLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        {(!posts || posts.length === 0) && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-sm sm:text-base">该分类暂无文章</p>
          </div>
        )}
      </div>
    );
}