import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export interface SEOMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  url = baseUrl,
  image = "/og-image.png",
  imageAlt = title,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
}: SEOMetadataParams): Metadata {
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;
  
  return {
    title,
    description,
    keywords: [...keywords, "YN Blog", "博客", "技术博客"],
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": [{ url: `${baseUrl}/rss.xml`, title: "YN Blog RSS Feed" }],
      },
    },
    openGraph: {
      type,
      locale: "zh_CN",
      url,
      siteName: "YN Blog",
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@ynblog",
      creator: "@ynblog",
      title,
      description,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export interface JSONLDWebsite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: {
      "@type": "ImageObject";
      url: string;
      width: number;
      height: number;
    };
  };
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
  inLanguage: string;
}

export function generateWebsiteJSONLD(
  siteName: string = "YN Blog",
  siteDescription: string = "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。"
): JSONLDWebsite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    description: siteDescription,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon-32x32.png`,
        width: 32,
        height: 32,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "zh-CN",
  };
}

export interface JSONLDOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: {
    "@type": "ImageObject";
    url: string;
    width: number;
    height: number;
  };
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    contactType: string;
    email: string;
    availableLanguage: string[];
  };
}

export function generateOrganizationJSONLD(
  siteName: string = "YN Blog"
): JSONLDOrganization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/favicon-32x32.png`,
      width: 32,
      height: 32,
    },
    sameAs: [
      "https://github.com/ynblog",
      "https://twitter.com/ynblog",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "admin@ynpro.top",
      availableLanguage: ["Chinese", "English"],
    },
  };
}

export interface JSONLDArticle {
  "@context": "https://schema.org";
  "@type": "Article" | "BlogPosting";
  headline: string;
  description: string;
  image: string | { "@type": "ImageObject"; url: string; width: number; height: number };
  url: string;
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: {
      "@type": "ImageObject";
      url: string;
      width: number;
      height: number;
    };
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  articleSection?: string;
  wordCount?: number;
  keywords?: string;
  inLanguage: string;
  thumbnailUrl?: string;
}

export function generateArticleJSONLD({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  siteName,
  section,
  wordCount,
  keywords,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  siteName: string;
  section?: string;
  wordCount?: number;
  keywords?: string;
}): JSONLDArticle {
  const fullImageUrl = image?.startsWith("http") ? image : image ? `${baseUrl}${image}` : `${baseUrl}/og-image.png`;
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: {
      "@type": "ImageObject",
      url: fullImageUrl,
      width: 1200,
      height: 630,
    },
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon-32x32.png`,
        width: 32,
        height: 32,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(section && { articleSection: section }),
    ...(wordCount && { wordCount }),
    ...(keywords && { keywords }),
    inLanguage: "zh-CN",
    thumbnailUrl: fullImageUrl,
  };
}

export interface JSONLDBreadcrumbList {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateBreadcrumbJSONLD(
  items: Array<{ name: string; item: string }>
): JSONLDBreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export interface JSONLDCollectionPage {
  "@context": "https://schema.org";
  "@type": "CollectionPage" | "Blog";
  name: string;
  description: string;
  url: string;
  mainEntity?: {
    "@type": "ItemList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      url: string;
      name: string;
    }>;
  };
  breadcrumb: JSONLDBreadcrumbList;
}

export function generateCollectionPageJSONLD({
  name,
  description,
  url,
  items = [],
  breadcrumbItems,
}: {
  name: string;
  description: string;
  url: string;
  items?: Array<{ name: string; url: string }>;
  breadcrumbItems: Array<{ name: string; item: string }>;
}): JSONLDCollectionPage {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    ...(items.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: item.url,
          name: item.name,
        })),
      },
    }),
    breadcrumb: generateBreadcrumbJSONLD(breadcrumbItems),
  };
}

export interface JSONLDAboutPage {
  "@context": "https://schema.org";
  "@type": "AboutPage";
  name: string;
  description: string;
  url: string;
  mainEntity: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
    contactPoint: {
      "@type": "ContactPoint";
      contactType: string;
      email: string;
    };
  };
  breadcrumb: JSONLDBreadcrumbList;
}

export function generateAboutPageJSONLD({
  name,
  description,
  url,
  siteName,
}: {
  name: string;
  description: string;
  url: string;
  siteName: string;
}): JSONLDAboutPage {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon-32x32.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "admin@ynpro.top",
      },
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "首页", item: baseUrl },
      { name, item: url },
    ]),
  };
}

export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const cleanContent = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
  const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
  return chineseChars + englishWords;
}

export function truncateDescription(description: string, maxLength: number = 160): string {
  if (!description || description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + "...";
}

export function generateKeywords(title: string, tags: string[] = [], category?: string): string[] {
  const keywords: string[] = [];
  if (title) keywords.push(title);
  if (category) keywords.push(category);
  keywords.push(...tags);
  keywords.push("YN Blog", "博客", "技术文章");
  const uniqueKeywords: string[] = [];
  const seen = new Set<string>();
  for (const keyword of keywords) {
    if (!seen.has(keyword)) {
      seen.add(keyword);
      uniqueKeywords.push(keyword);
    }
  }
  return uniqueKeywords;
}
