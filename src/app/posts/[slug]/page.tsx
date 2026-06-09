/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAdjacentPosts } from "@/services/posts";
import { getTags, getPostTags } from "@/services/tags";
import { getSiteConfig } from "@/services/settings";
import type { Tag, Post } from "@/types";
import PostDetailClient from "@/components/PostDetailClient";
import JsonLd from "@/components/JsonLd";
import { 
  generateSEOMetadata, 
  generateArticleJSONLD, 
  generateBreadcrumbJSONLD,
  calculateWordCount,
  truncateDescription
} from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

async function getPostData(slug: string) {
  let post = null;
  try {
    post = await getPostBySlug(slug) as (Post & { comment_count: number }) | null;
  } catch {
    post = null;
  }

  if (!post) {
    return { post: null, siteConfig: null, tags: [], postTags: [], postTagIds: [] };
  }

  const [siteConfig, tags, postTagIds] = await Promise.all([
    getSiteConfig(),
    getTags(),
    getPostTags((post as Post).id) as Promise<string[]>,
  ]);

  const postTags = tags.filter((tag: Tag) => (postTagIds as string[]).includes(tag.id));

  return { post, siteConfig, tags, postTags, postTagIds };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { post, siteConfig, postTags } = await getPostData(decodedSlug);

  if (!post || !siteConfig) {
    return {
      title: "文章未找到",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const postUrl = `${baseUrl}/posts/${post.slug}`;
  const description = truncateDescription(post.excerpt || post.content.substring(0, 160));
  const keywords = [
    post.title,
    post.categories?.name || "博客",
    ...postTags.map((tag: Tag) => tag.name),
  ];

  return generateSEOMetadata({
    title: `${post.title} - ${siteConfig.seoTitle || siteConfig.siteTitle}`,
    description,
    keywords,
    url: postUrl,
    image: post.featured_image || "/og-image.png",
    imageAlt: post.title,
    type: "article",
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    author: post.profiles?.username || siteConfig.siteAuthor,
    section: post.categories?.name,
    tags: postTags.map((tag: Tag) => tag.name),
  });
}

async function getPostDetailData(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const { post, siteConfig, tags, postTagIds } = await getPostData(decodedSlug);

  if (!post) {
    return { post: null, siteConfig: null, tags: [], prevPost: null, nextPost: null, postTagIds: [] };
  }

  // 使用定向数据库查询获取相邻文章，避免全量加载所有已发布文章
  const { prevPost, nextPost } = await getAdjacentPosts(post.created_at);

  return { post, siteConfig, tags, prevPost, nextPost, postTagIds };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post, siteConfig, tags, prevPost, nextPost, postTagIds } = await getPostDetailData(slug);

  if (!post || !siteConfig) {
    notFound();
  }

  const postTags = tags.filter((tag: Tag) => postTagIds.includes(tag.id));

  const postUrl = `${baseUrl}/posts/${post.slug}`;
  const siteName = siteConfig.siteTitle || "YN Blog";
  const authorName = post.profiles?.username || siteConfig.siteAuthor;
  const authorUrl = post.profiles?.id ? `${baseUrl}/authors/${post.profiles.id}` : baseUrl;
  const wordCount = calculateWordCount(post.content);
  const keywords = postTags.map((tag: Tag) => tag.name).join(", ");

  const articleJsonLd = generateArticleJSONLD({
    title: post.title,
    description: post.excerpt || post.content.substring(0, 150),
    image: post.featured_image || undefined,
    url: postUrl,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    authorName,
    authorUrl,
    siteName,
    section: post.categories?.name,
    wordCount,
    keywords,
  });

  const breadcrumbJsonLd = generateBreadcrumbJSONLD([
    { name: "首页", item: baseUrl },
    { name: "文章", item: `${baseUrl}/posts` },
    { name: post.title, item: postUrl },
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <PostDetailClient
        post={post as Post & { profiles?: { id?: string; username: string; avatar_url?: string }; categories?: { name: string; slug: string }; comment_count: number }}
        postTags={postTags}
        prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : null}
        nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : null}
      />
    </div>
  );
}