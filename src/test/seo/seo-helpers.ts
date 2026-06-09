export interface SEOMetadata {
  title?: string | undefined;
  description?: string | undefined;
  keywords?: string[] | undefined;
  authors?: { name: string; url?: string }[] | undefined;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    type?: string;
    images?: { url: string; width?: number; height?: number; alt?: string }[];
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
    site?: string;
    creator?: string;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
    googleBot?: {
      index?: boolean;
      follow?: boolean;
      'max-video-preview'?: number | string;
      'max-image-preview'?: 'none' | 'small' | 'large';
      'max-snippet'?: number;
    };
  };
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  themeColor?: string;
}

export interface JSONLDData {
  '@context': string;
  '@type': string;
  [key: string]: string | number | boolean | object | null | undefined;
}

export interface SEOValidationResult {
  page: string;
  passed: boolean;
  issues: SEOIssue[];
  warnings: SEOWarning[];
}

export interface SEOIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  expected?: string;
  actual?: string;
}

export interface SEOWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  language?: string;
  items: RSSItem[];
}

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  guid?: string;
  category?: string[];
}

export class SEOTagParser {
  static parseMetaTags(html: string): Record<string, string> {
    const metaTags: Record<string, string> = {};
    const metaRegex = /<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi;
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      metaTags[match[1]] = match[2];
    }
    
    return metaTags;
  }

  static parseLinkTags(html: string): Record<string, string> {
    const linkTags: Record<string, string> = {};
    const linkRegex = /<link\s+(?:rel|href)=["']([^"']+)["']\s+(?:rel|href)=["']([^"']+)["']/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const rel = match[1] === 'rel' ? match[2] : match[1];
      const href = match[1] === 'href' ? match[2] : match[1];
      if (rel) linkTags[rel] = href;
    }
    
    return linkTags;
  }

  static parseJSONLD(html: string): JSONLDData[] {
    const jsonldData: JSONLDData[] = [];
    const jsonldRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = jsonldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        jsonldData.push(data);
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e);
      }
    }
    
    return jsonldData;
  }

  static extractTitle(html: string): string | null {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  static extractCanonical(html: string): string | null {
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    return canonicalMatch ? canonicalMatch[1] : null;
  }

  static extractViewport(html: string): string | null {
    const viewportMatch = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
    return viewportMatch ? viewportMatch[1] : null;
  }

  static extractThemeColor(html: string): string | null {
    const themeColorMatch = html.match(/<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i);
    return themeColorMatch ? themeColorMatch[1] : null;
  }
}

export class SEOValidator {
  static validateMetadata(metadata: SEOMetadata, page: string): SEOValidationResult {
    const issues: SEOIssue[] = [];
    const warnings: SEOWarning[] = [];

    if (!metadata.title) {
      issues.push({
        field: 'title',
        message: `${page} 缺少 title 标签`,
        severity: 'error',
        expected: '应该有一个描述性的 title',
      });
    } else if (metadata.title.length < 10) {
      warnings.push({
        field: 'title',
        message: `Title 可能太短: ${metadata.title.length} 字符`,
        suggestion: '建议 title 长度在 50-60 字符之间',
      });
    } else if (metadata.title.length > 60) {
      warnings.push({
        field: 'title',
        message: `Title 可能太长: ${metadata.title.length} 字符`,
        suggestion: '建议 title 长度在 50-60 字符之间',
      });
    }

    if (!metadata.description) {
      issues.push({
        field: 'description',
        message: `${page} 缺少 meta description`,
        severity: 'error',
        expected: '应该有一个 150-160 字符的描述',
      });
    } else if (metadata.description.length < 120) {
      warnings.push({
        field: 'description',
        message: `Description 可能太短: ${metadata.description.length} 字符`,
        suggestion: '建议 description 长度在 150-160 字符之间',
      });
    } else if (metadata.description.length > 160) {
      warnings.push({
        field: 'description',
        message: `Description 可能太长: ${metadata.description.length} 字符`,
        suggestion: '建议 description 长度在 150-160 字符之间',
      });
    }

    if (!metadata.alternates?.canonical) {
      warnings.push({
        field: 'canonical',
        message: `${page} 缺少 canonical 标签`,
        suggestion: '添加 canonical 标签可以防止重复内容问题',
      });
    }

    if (!metadata.openGraph) {
      warnings.push({
        field: 'openGraph',
        message: `${page} 缺少 Open Graph 标签`,
        suggestion: '添加 OG 标签以优化社交分享',
      });
    } else {
      if (!metadata.openGraph.title) {
        issues.push({
          field: 'openGraph.title',
          message: `${page} 缺少 OG title`,
          severity: 'error',
        });
      }
      if (!metadata.openGraph.description) {
        issues.push({
          field: 'openGraph.description',
          message: `${page} 缺少 OG description`,
          severity: 'error',
        });
      }
      if (!metadata.openGraph.images || metadata.openGraph.images.length === 0) {
        warnings.push({
          field: 'openGraph.images',
          message: `${page} 缺少 OG 图片`,
          suggestion: '添加至少一张 OG 图片以优化社交分享预览',
        });
      }
    }

    if (!metadata.twitter) {
      warnings.push({
        field: 'twitter',
        message: `${page} 缺少 Twitter Card 标签`,
        suggestion: '添加 Twitter Card 标签以优化 Twitter 分享',
      });
    } else {
      if (!metadata.twitter.card) {
        issues.push({
          field: 'twitter.card',
          message: `${page} 缺少 Twitter Card type`,
          severity: 'error',
        });
      }
    }

    return {
      page,
      passed: issues.length === 0,
      issues,
      warnings,
    };
  }

  static validateJSONLD(jsonld: JSONLDData[], expectedTypes: string[]): SEOValidationResult {
    const issues: SEOIssue[] = [];
    const warnings: SEOWarning[] = [];
    const foundTypes = jsonld.map(data => data['@type']);

    for (const expectedType of expectedTypes) {
      if (!foundTypes.includes(expectedType)) {
        warnings.push({
          field: 'jsonld',
          message: `缺少 ${expectedType} Schema 类型`,
          suggestion: `添加 ${expectedType} 结构化数据以增强搜索结果展示`,
        });
      }
    }

    return {
      page: 'JSON-LD',
      passed: issues.length === 0,
      issues,
      warnings,
    };
  }

  static validateSitemap(sitemap: string): SEOValidationResult {
    const issues: SEOIssue[] = [];
    const warnings: SEOWarning[] = [];

    const urlCount = (sitemap.match(/<loc>/g) || []).length;
    if (urlCount === 0) {
      issues.push({
        field: 'sitemap',
        message: 'Sitemap 中没有找到 URL',
        severity: 'error',
      });
    }

    const homePageIncluded = sitemap.includes('<loc>') && 
      sitemap.match(/<loc>[^<]*\/<\/loc>/);
    if (!homePageIncluded) {
      warnings.push({
        field: 'sitemap',
        message: 'Sitemap 可能缺少首页',
        suggestion: '确保首页包含在 sitemap 中',
      });
    }

    const staticPages = ['/categories', '/tags', '/about'];
    for (const page of staticPages) {
      if (!sitemap.includes(`<loc>[^<]*${page}</loc>`)) {
        warnings.push({
          field: 'sitemap',
          message: `Sitemap 可能缺少静态页面: ${page}`,
          suggestion: `添加 ${page} 到 sitemap`,
        });
      }
    }

    return {
      page: 'Sitemap',
      passed: issues.length === 0,
      issues,
      warnings,
    };
  }

  static validateRSS(rss: string): SEOValidationResult {
    const issues: SEOIssue[] = [];
    const warnings: SEOWarning[] = [];

    if (!rss.includes('<title>')) {
      issues.push({
        field: 'rss',
        message: 'RSS feed 缺少 title',
        severity: 'error',
      });
    }

    if (!rss.includes('<language>zh')) {
      warnings.push({
        field: 'rss',
        message: 'RSS feed 缺少中文语言标签',
        suggestion: '添加 <language>zh-CN</language> 以明确内容语言',
      });
    }

    const itemCount = (rss.match(/<item>/g) || []).length;
    if (itemCount === 0) {
      warnings.push({
        field: 'rss',
        message: 'RSS feed 中没有文章',
        suggestion: 'RSS feed 应该包含最新文章',
      });
    }

    if (!rss.includes('atom:link')) {
      warnings.push({
        field: 'rss',
        message: 'RSS feed 缺少 atom:link self 引用',
        suggestion: '添加 atom:link href="..." rel="self" type="application/rss+xml"',
      });
    }

    return {
      page: 'RSS',
      passed: issues.length === 0,
      issues,
      warnings,
    };
  }
}
