import type { Metadata } from "next";
import type { Post } from "@/types";
import { getPosts } from "@/services/posts";
import { getSiteConfig } from "@/services/settings";
import PostsList from "@/components/PostsList";
import JsonLd from "@/components/JsonLd";
import { 
  generateSEOMetadata, 
  generateCollectionPageJSONLD 
} from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 60;

const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const [posts, siteConfig] = await Promise.all([
    // 仅加载有限数量用于生成描述中的文章数
    getPosts({ status: "published", limit: 1 }) as Promise<(Post & { comment_count: number })[]>,
    getSiteConfig(),
  ]);

  const title = "全部文章";
  const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : `${title} - ${siteConfig.siteTitle}`;
  const description = siteConfig.seoDescription || siteConfig.siteDescription || "浏览 YN Blog 的精选文章、教程和最佳实践。";

  return generateSEOMetadata({
    title: fullTitle,
    description,
    keywords: ["文章列表", "博客文章", "技术文章", "教程", "最佳实践"],
    url: `${baseUrl}/posts`,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

export default async function PostsPage() {
  const [firstPagePosts, siteConfig] = await Promise.all([
    // 仅加载首页文章用于初始渲染，后续分页由客户端 PostsList 懒加载
    getPosts({ status: "published", limit: PAGE_SIZE }) as Promise<(Post & { comment_count: number })[]>,
    getSiteConfig(),
  ]);

  const title = "文章列表";
  const description = `浏览精选文章。${siteConfig.siteDescription || "YN Blog 提供高质量的技术文章、教程和最佳实践。"}`;
  const postsPerPage = siteConfig.postsPerPage || PAGE_SIZE;

  const postsPageJsonLd = generateCollectionPageJSONLD({
    name: title,
    description,
    url: `${baseUrl}/posts`,
    items: firstPagePosts.map(post => ({ name: post.title, url: `${baseUrl}/posts/${post.slug}` })),
    breadcrumbItems: [
      { name: "首页", item: baseUrl },
      { name: title, item: `${baseUrl}/posts` },
    ],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <JsonLd data={postsPageJsonLd} />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold mb-2">文章列表</h1>
        <p className="text-muted-foreground">浏览全部文章</p>
      </div>

      <PostsList initialPosts={firstPagePosts} postsPerPage={postsPerPage} />
    </div>
  );
}