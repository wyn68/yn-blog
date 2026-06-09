import type { Metadata } from "next";
import LoadingLink from "@/components/LoadingLink";
import JsonLd from "@/components/JsonLd";
import { Tag } from "lucide-react";
import { getTagsWithPostCount } from "@/services/tags";
import { getSiteConfig } from "@/services/settings";
import type { Tag as TagType } from "@/types";
import { 
  generateSEOMetadata, 
  generateCollectionPageJSONLD 
} from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [tags, siteConfig] = await Promise.all([
    getTagsWithPostCount(),
    getSiteConfig(),
  ]);

  const title = "标签云";
  const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : `${title} - ${siteConfig.siteTitle}`;
  const description = `浏览 ${tags.length} 个标签分类。${siteConfig.seoDescription || siteConfig.siteDescription || "YN Blog 提供多种标签分类，方便您快速找到感兴趣的内容。"}`;

  return generateSEOMetadata({
    title: fullTitle,
    description,
    keywords: ["标签", "标签列表", "博客标签", "分类标签"],
    url: `${baseUrl}/tags`,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

export default async function TagsPage() {
  const [tags, siteConfig] = await Promise.all([
    getTagsWithPostCount(),
    getSiteConfig(),
  ]);

  if (!tags) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载标签失败</p>
      </div>
    );
  }

  const title = "标签";
  const description = `浏览 ${tags.length} 个标签分类。${siteConfig.siteDescription || "YN Blog 提供多种标签分类，方便您快速找到感兴趣的内容。"}`;

  const tagsPageJsonLd = generateCollectionPageJSONLD({
    name: title,
    description,
    url: `${baseUrl}/tags`,
    items: tags.map((tag: TagType & { count?: number }) => ({ 
      name: tag.name, 
      url: `${baseUrl}/tags/${tag.slug}` 
    })),
    breadcrumbItems: [
      { name: "首页", item: baseUrl },
      { name: title, item: `${baseUrl}/tags` },
    ],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <JsonLd data={tagsPageJsonLd} />
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">标签</h1>
        <p className="text-muted-foreground text-base sm:text-lg">浏览博客文章标签</p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tags?.map((tag: TagType & { count?: number }) => (
          <LoadingLink
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 text-sm sm:text-base"
          >
            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{tag.name}</span>
            <span className="text-xs opacity-70">({tag.count || 0})</span>
          </LoadingLink>
        ))}
      </div>

      {(!tags || tags.length === 0) && (
        <div className="text-center py-8 sm:py-12">
          <Tag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">暂无标签</p>
        </div>
      )}
    </div>
  );
}