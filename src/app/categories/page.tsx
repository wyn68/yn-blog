import type { Metadata } from "next";
import LoadingLink from "@/components/LoadingLink";
import JsonLd from "@/components/JsonLd";
import { Folder, ArrowRight } from "lucide-react";
import { getCategoriesWithPostCount } from "@/services/categories";
import { getSiteConfig } from "@/services/settings";
import type { Category } from "@/types";
import { 
  generateSEOMetadata, 
  generateCollectionPageJSONLD 
} from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [categories, siteConfig] = await Promise.all([
    getCategoriesWithPostCount(),
    getSiteConfig(),
  ]);

  const title = "文章分类";
  const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : `${title} - ${siteConfig.siteTitle}`;
  const description = `浏览 ${categories.length} 个文章分类。${siteConfig.seoDescription || siteConfig.siteDescription || "YN Blog 提供多种分类，方便您快速找到感兴趣的内容。"}`;

  return generateSEOMetadata({
    title: fullTitle,
    description,
    keywords: ["分类", "分类列表", "博客分类", "文章分类"],
    url: `${baseUrl}/categories`,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

export default async function CategoriesPage() {
  const [categories, siteConfig] = await Promise.all([
    getCategoriesWithPostCount(),
    getSiteConfig(),
  ]);

  if (!categories) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载分类失败</p>
      </div>
    );
  }

  const title = "分类";
  const description = `浏览 ${categories.length} 个文章分类。${siteConfig.siteDescription || "YN Blog 提供多种分类，方便您快速找到感兴趣的内容。"}`;

  const categoriesPageJsonLd = generateCollectionPageJSONLD({
    name: title,
    description,
    url: `${baseUrl}/categories`,
    items: categories.map((category: Category & { count?: number }) => ({ 
      name: category.name, 
      url: `${baseUrl}/categories/${category.slug}` 
    })),
    breadcrumbItems: [
      { name: "首页", item: baseUrl },
      { name: title, item: `${baseUrl}/categories` },
    ],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <JsonLd data={categoriesPageJsonLd} />
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">分类</h1>
        <p className="text-muted-foreground text-base sm:text-lg">浏览博客文章分类</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories?.map((category: Category & { count?: number }) => (
          <LoadingLink
            key={category.id}
            href={`/categories/${category.slug}`}
            className="card p-4 sm:p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{category.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-2 line-clamp-2">
                  {category.description || "暂无描述"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {category.count || 0} 篇文章
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </LoadingLink>
        ))}
      </div>

      {(!categories || categories.length === 0) && (
        <div className="text-center py-8 sm:py-12">
          <Folder className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">暂无分类</p>
        </div>
      )}
    </div>
  );
}