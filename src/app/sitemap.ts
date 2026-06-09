import { MetadataRoute } from 'next';
import { getPosts } from "@/services/posts";
import { getCategories } from "@/services/categories";
import { getTags } from "@/services/tags";
import type { Post } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ynpro.top";

/**
 * Sitemap 中单次拉取文章的最大数量。
 * Next.js sitemap 单个文件最多 50,000 URL，博客场景 5000 已非常充裕。
 * 如果文章超过此数量，将输出警告日志。
 */
const SITEMAP_POST_LIMIT = 5000;

const staticPages: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${baseUrl}/posts`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/categories`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/tags`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${baseUrl}/search`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([
    getPosts({ status: "published", limit: SITEMAP_POST_LIMIT }) as Promise<(Post & { comment_count: number })[]>,
    getCategories(),
    getTags(),
  ]);

  // 如果文章数量达到 limit，可能有文章未被收录，输出警告
  if (posts.length >= SITEMAP_POST_LIMIT) {
    console.warn(
      `[Sitemap] 文章数量已达拉取上限 ${SITEMAP_POST_LIMIT}，部分文章可能未被收录。` +
      `建议实现 sitemap index 分页以支持更多文章。`
    );
  }

  const postsSitemap: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoriesSitemap: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const tagsSitemap: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(tag.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...postsSitemap,
    ...categoriesSitemap,
    ...tagsSitemap,
  ];
}