/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import LoadingLink from "@/components/LoadingLink";
import JsonLd from "@/components/JsonLd";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getTagBySlug } from "@/services/tags";
import { getPosts } from "@/services/posts";
import { getSiteConfig } from "@/services/settings";
import { 
  generateSEOMetadata, 
  generateCollectionPageJSONLD 
} from "@/lib/seo";
import type { Tag, Post } from "@/types";

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
    const tag = await getTagBySlug(decodedSlug) as Tag;
    // metadata 生成只需少量文章用于描述统计
    const posts = await getPosts({ tagId: tag.id, status: "published", limit: 10 }) as (Post & { comment_count: number })[];
    const tagUrl = `${baseUrl}/tags/${tag.slug}`;
    const title = `${tag.name}标签`;
    const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : `${title} - ${siteConfig.siteTitle}`;
    const description = `浏览 ${posts.length} 篇 ${tag.name} 标签相关文章。${siteConfig.seoDescription || siteConfig.siteDescription || "YN Blog 提供高质量的技术文章、教程和最佳实践。"}`;

    return generateSEOMetadata({
      title: fullTitle,
      description,
      keywords: [tag.name, "标签", "博客标签", "文章标签"],
      url: tagUrl,
      image: "/og-image.png",
      imageAlt: title,
      type: "website",
    });
  } catch {
    return {
      title: "标签未找到",
      description: siteConfig.siteDescription,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = await getSiteConfig();

  let tag;
  try {
    tag = await getTagBySlug(decodedSlug) as Tag;
  } catch {
    notFound();
    return;
  }

  // 限制最大加载数量，避免标签下有大量文章时性能问题
  const MAX_TAG_POSTS = 200;
  const posts = await getPosts({
    tagId: (tag as Tag).id,
    status: "published",
    limit: MAX_TAG_POSTS,
  }) as (Post & { comment_count: number })[];
  const tagUrl = `${baseUrl}/tags/${(tag as Tag).slug}`;
  const title = `标签: ${tag.name}`;
  const description = `浏览 ${posts.length} 篇 ${tag.name} 标签相关文章。${siteConfig.siteDescription || "YN Blog 提供高质量的技术文章、教程和最佳实践。"}`;

  const tagPageJsonLd = generateCollectionPageJSONLD({
    name: title,
    description,
    url: tagUrl,
    items: posts.map(post => ({ name: post.title, url: `${baseUrl}/posts/${post.slug}` })),
    breadcrumbItems: [
      { name: "首页", item: baseUrl },
      { name: "标签", item: `${baseUrl}/tags` },
      { name: tag.name, item: tagUrl },
    ],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <JsonLd data={tagPageJsonLd} />
      <LoadingLink
        href="/tags"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 sm:mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回标签列表
      </LoadingLink>

        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">#{tag.name}</h1>
          <p className="text-muted-foreground text-sm sm:text-lg">共 {posts.length} 篇相关文章</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {posts?.map((post) => (
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
            <p className="text-muted-foreground text-sm sm:text-base">该标签暂无文章</p>
          </div>
        )}
      </div>
    );
}