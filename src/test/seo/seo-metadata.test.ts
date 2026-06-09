import { describe, it, expect, beforeAll } from 'vitest';
import {
  SEOTagParser,
  SEOValidator,
  type SEOMetadata,
  type JSONLDData,
} from './seo-helpers';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface TestPage {
  path: string;
  name: string;
  expectedMetadata?: Partial<SEOMetadata>;
  expectedJSONLDTypes?: string[];
  shouldHaveCanonical?: boolean;
  shouldBeIndexed?: boolean;
}

const testPages: TestPage[] = [
  {
    path: '/',
    name: '首页',
    expectedMetadata: {
      title: 'YN Blog - Modern Blog Platform',
      description: 'A modern blog platform built with Next.js and Supabase',
    },
    expectedJSONLDTypes: ['WebSite', 'Organization'],
    shouldHaveCanonical: true,
    shouldBeIndexed: true,
  },
  {
    path: '/posts',
    name: '文章列表',
    expectedMetadata: {
      title: expect.stringContaining('文章'),
      description: expect.stringContaining(''),
    },
    shouldHaveCanonical: true,
    shouldBeIndexed: true,
  },
  {
    path: '/categories',
    name: '分类列表',
    expectedMetadata: {
      title: expect.stringContaining('分类'),
    },
    shouldHaveCanonical: true,
    shouldBeIndexed: true,
  },
  {
    path: '/tags',
    name: '标签列表',
    expectedMetadata: {
      title: expect.stringContaining('标签'),
    },
    shouldHaveCanonical: true,
    shouldBeIndexed: true,
  },
  {
    path: '/about',
    name: '关于我们',
    expectedMetadata: {
      title: expect.stringContaining('关于'),
    },
    shouldHaveCanonical: true,
    shouldBeIndexed: true,
  },
];

describe('SEO Metadata Tests', () => {
  const fetchHtml = async (path: string): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}${path}`);
      return await response.text();
    } catch (error) {
      console.warn(`Failed to fetch ${path}:`, error);
      return '';
    }
  };

  describe('Common SEO Elements', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have a title tag', async () => {
          const html = await fetchHtml(page.path);
          const title = SEOTagParser.extractTitle(html);
          expect(title).not.toBeNull();
          expect(title?.length).toBeGreaterThan(0);
        });

        it('should have a meta description', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['description']).toBeDefined();
        });

        it('should have a viewport meta tag', async () => {
          const html = await fetchHtml(page.path);
          const viewport = SEOTagParser.extractViewport(html);
          expect(viewport).toBeDefined();
          expect(viewport).toContain('width=device-width');
        });

        it('should have a charset meta tag', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          const charset = metaTags['charset'] || html.match(/<meta\s+charset=["']([^"']+)["']/i)?.[1];
          expect(['UTF-8', 'utf-8']).toContain(charset);
        });

        if (page.shouldHaveCanonical) {
          it('should have a canonical tag', async () => {
            const html = await fetchHtml(page.path);
            const canonical = SEOTagParser.extractCanonical(html);
            expect(canonical).toBeDefined();
            expect(canonical).toContain(page.path);
          });
        }

        if (page.shouldBeIndexed) {
          it('should not have noindex meta tag', async () => {
            const html = await fetchHtml(page.path);
            const metaTags = SEOTagParser.parseMetaTags(html);
            const robots = metaTags['robots'] || '';
            expect(robots.toLowerCase()).not.toContain('noindex');
          });
        }

        if (page.expectedMetadata?.title) {
          it('should have correct title format', async () => {
            const html = await fetchHtml(page.path);
            const title = SEOTagParser.extractTitle(html);
            if (typeof page.expectedMetadata.title === 'function') {
              expect(title).toMatch(page.expectedMetadata.title);
            } else {
              expect(title).toBe(page.expectedMetadata.title);
            }
          });
        }
      });
    });
  });

  describe('Open Graph Tags', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have og:title', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:title']).toBeDefined();
        });

        it('should have og:description', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:description']).toBeDefined();
        });

        it('should have og:type', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:type']).toBeDefined();
        });

        it('should have og:url', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:url']).toBeDefined();
          expect(metaTags['og:url']).toContain(BASE_URL);
        });

        it('should have og:site_name', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:site_name']).toBeDefined();
        });

        it('should have og:locale', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['og:locale']).toBeDefined();
          expect(metaTags['og:locale']).toContain('zh');
        });

        it('should have og:image for social sharing', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          const ogImage = metaTags['og:image'];
          expect(ogImage).toBeDefined();
          expect(ogImage).toMatch(/\.(jpg|jpeg|png|gif|webp)$/i);
        });
      });
    });
  });

  describe('Twitter Card Tags', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have twitter:card', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['twitter:card']).toBeDefined();
          expect(['summary', 'summary_large_image', 'app', 'player']).toContain(
            metaTags['twitter:card']
          );
        });

        it('should have twitter:title', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['twitter:title']).toBeDefined();
        });

        it('should have twitter:description', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          expect(metaTags['twitter:description']).toBeDefined();
        });

        it('should have twitter:image when card is summary_large_image', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          if (metaTags['twitter:card'] === 'summary_large_image') {
            expect(metaTags['twitter:image']).toBeDefined();
          }
        });
      });
    });
  });

  describe('JSON-LD Structured Data', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have at least one JSON-LD script', async () => {
          const html = await fetchHtml(page.path);
          const jsonldData = SEOTagParser.parseJSONLD(html);
          expect(jsonldData.length).toBeGreaterThan(0);
        });

        if (page.expectedJSONLDTypes && page.expectedJSONLDTypes.length > 0) {
          it(`should include expected JSON-LD types: ${page.expectedJSONLDTypes.join(', ')}`, async () => {
            const html = await fetchHtml(page.path);
            const jsonldData = SEOTagParser.parseJSONLD(html);
            const foundTypes = jsonldData.map(data => data['@type']);
            page.expectedJSONLDTypes?.forEach(expectedType => {
              expect(foundTypes).toContain(expectedType);
            });
          });
        }
      });
    });
  });

  describe('Image SEO', () => {
    it('all images should have alt attributes', async () => {
      const html = await fetchHtml('/');
      const imgRegex = /<img\s+([^>]*?)>/gi;
      const imageMatches = html.matchAll(imgRegex);
      const images = Array.from(imageMatches);
      
      images.forEach((match, index) => {
        const attributes = match[1];
        const hasAlt = /alt=["'][^"']*["']/i.test(attributes);
        if (!hasAlt) {
          console.warn(`Image #${index + 1} missing alt attribute`);
        }
      });

      const allImagesHaveAlt = images.every(match => 
        /alt=["'][^"']*["']/i.test(match[1])
      );
      expect(allImagesHaveAlt).toBe(true);
    });

    it('should use Next.js Image component for optimization', async () => {
      const html = await fetchHtml('/');
      const nextImageRegex = /<image[^>]*>/gi;
      const nextImages = html.match(nextImageRegex) || [];
      expect(nextImages.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile SEO', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have proper viewport meta tag', async () => {
          const html = await fetchHtml(page.path);
          const viewport = SEOTagParser.extractViewport(html);
          expect(viewport).toContain('width=device-width');
          expect(viewport).toContain('initial-scale=1');
        });

        it('should have theme-color for mobile browsers', async () => {
          const html = await fetchHtml(page.path);
          const themeColor = SEOTagParser.extractThemeColor(html);
          expect(themeColor).toBeDefined();
          expect(themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        it('should not have fixed width elements', async () => {
          const html = await fetchHtml(page.path);
          const fixedWidthRegex = /width:\s*\d+px(?!\s*;)/gi;
          const fixedWidthElements = html.match(fixedWidthRegex);
          if (fixedWidthElements && fixedWidthElements.length > 0) {
            console.warn(`Found ${fixedWidthElements.length} fixed-width elements`);
          }
        });
      });
    });
  });

  describe('Accessibility and Performance SEO', () => {
    testPages.forEach((page) => {
      describe(`${page.name} (${page.path})`, () => {
        it('should have lang attribute on html tag', async () => {
          const html = await fetchHtml(page.path);
          const langMatch = html.match(/<html[^>]*\slang=["']([^"']+)["'][^>]*>/i);
          expect(langMatch).not.toBeNull();
          expect(langMatch?.[1]).toContain('zh');
        });

        it('should have meta robots or robots.txt should allow crawling', async () => {
          const html = await fetchHtml(page.path);
          const metaTags = SEOTagParser.parseMetaTags(html);
          const robots = metaTags['robots'];
          if (robots) {
            expect(robots.toLowerCase()).not.toContain('noindex');
          }
        });

        it('should have proper heading hierarchy', async () => {
          const html = await fetchHtml(page.path);
          const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
          expect(h1Count).toBeGreaterThan(0);
          expect(h1Count).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('Sitemap Tests', () => {
    it('should have a valid sitemap.xml', async () => {
      const response = await fetch(`${BASE_URL}/sitemap.xml`);
      expect(response.status).toBe(200);

      const sitemap = await response.text();
      expect(sitemap).toContain('<?xml');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('<loc>');

      const validation = SEOValidator.validateSitemap(sitemap);
      if (!validation.passed) {
        console.warn('Sitemap validation issues:', validation.issues);
      }
      expect(validation.passed).toBe(true);
    });

    it('sitemap should include all important pages', async () => {
      const response = await fetch(`${BASE_URL}/sitemap.xml`);
      const sitemap = await response.text();

      const importantPages = [
          { path: '/', name: 'homepage' },
          { path: '/posts', name: 'posts' },
          { path: '/categories', name: 'categories' },
          { path: '/tags', name: 'tags' },
          { path: '/about', name: 'about' },
        ];

        importantPages.forEach(({ path }) => {
        const pattern = new RegExp(`<loc>[^<]*${path.replace('/', '\\/')}</loc>`);
        expect(sitemap).toMatch(pattern);
      });
    });

    it('sitemap URLs should have proper format', async () => {
      const response = await fetch(`${BASE_URL}/sitemap.xml`);
      const sitemap = await response.text();

      const locRegex = /<loc>([^<]+)<\/loc>/g;
      const urls: string[] = [];
      let match;

      while ((match = locRegex.exec(sitemap)) !== null) {
        urls.push(match[1]);
      }

      urls.forEach((url) => {
        expect(url).toMatch(/^https?:\/\//);
        expect(url).toContain(BASE_URL.replace('http://', '').replace('https://', ''));
      });
    });
  });

  describe('RSS Feed Tests', () => {
    it('should have a valid rss.xml', async () => {
      const response = await fetch(`${BASE_URL}/rss.xml`);
      expect(response.status).toBe(200);

      const rss = await response.text();
      expect(rss).toContain('<?xml');
      expect(rss).toContain('<rss');
      expect(rss).toContain('<channel>');

      const validation = SEOValidator.validateRSS(rss);
      if (!validation.passed) {
        console.warn('RSS validation issues:', validation.issues);
      }
    });

    it('RSS should have proper channel metadata', async () => {
      const response = await fetch(`${BASE_URL}/rss.xml`);
      const rss = await response.text();

      expect(rss).toContain('<title>');
      expect(rss).toContain('<link>');
      expect(rss).toContain('<description>');
      expect(rss).toContain('<language>zh-CN</language>');
    });

    it('RSS items should have required elements', async () => {
      const response = await fetch(`${BASE_URL}/rss.xml`);
      const rss = await response.text();

      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      const itemMatches = rss.matchAll(itemRegex);
      const items = Array.from(itemMatches);

      if (items.length > 0) {
        const firstItem = items[0][1];
        expect(firstItem).toContain('<title>');
        expect(firstItem).toContain('<link>');
        expect(firstItem).toContain('<description>');
        expect(firstItem).toContain('<pubDate>');
      }
    });
  });

  describe('Robots.txt Tests', () => {
    it('should have a robots.txt file', async () => {
      const response = await fetch(`${BASE_URL}/robots.txt`);
      expect(response.status).toBe(200);
    });

    it('robots.txt should allow crawling of public pages', async () => {
      const response = await fetch(`${BASE_URL}/robots.txt`);
      const robotsTxt = await response.text();

      expect(robotsTxt).toContain('Allow: /');

      const importantPaths = ['/posts', '/categories', '/tags', '/about'];
      importantPaths.forEach((path) => {
        expect(robotsTxt).toContain(path);
      });
    });

    it('robots.txt should disallow admin pages', async () => {
      const response = await fetch(`${BASE_URL}/robots.txt`);
      const robotsTxt = await response.text();

      expect(robotsTxt).toContain('/admin');
    });

    it('robots.txt should reference sitemap', async () => {
      const response = await fetch(`${BASE_URL}/robots.txt`);
      const robotsTxt = await response.text();

      expect(robotsTxt).toContain('Sitemap:');
      expect(robotsTxt).toContain('/sitemap.xml');
    });
  });
});

describe('SEO Validation Helper Tests', () => {
  describe('SEOTagParser', () => {
    it('should parse meta tags correctly', () => {
      const html = `
        <html>
          <meta name="description" content="Test description">
          <meta property="og:title" content="Test OG Title">
          <meta name="keywords" content="test, keywords">
        </html>
      `;

      const metaTags = SEOTagParser.parseMetaTags(html);

      expect(metaTags['description']).toBe('Test description');
      expect(metaTags['og:title']).toBe('Test OG Title');
      expect(metaTags['keywords']).toBe('test, keywords');
    });

    it('should extract title correctly', () => {
      const html = '<html><head><title>Test Page Title</title></head></html>';

      const title = SEOTagParser.extractTitle(html);

      expect(title).toBe('Test Page Title');
    });

    it('should extract canonical URL correctly', () => {
      const html = '<html><head><link rel="canonical" href="https://example.com/page"></head></html>';

      const canonical = SEOTagParser.extractCanonical(html);

      expect(canonical).toBe('https://example.com/page');
    });

    it('should parse JSON-LD correctly', () => {
      const html = `
        <html>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Test Site"
            }
          </script>
        </html>
      `;

      const jsonld = SEOTagParser.parseJSONLD(html);

      expect(jsonld.length).toBe(1);
      expect(jsonld[0]['@type']).toBe('WebSite');
      expect(jsonld[0]['name']).toBe('Test Site');
    });
  });

  describe('SEOValidator', () => {
    it('should validate complete metadata', () => {
      const metadata: SEOMetadata = {
        title: 'Test Page Title - Website Name',
        description: 'This is a test description that is between 150-160 characters long for optimal SEO performance.',
        openGraph: {
          title: 'Test Page Title',
          description: 'This is a test description that is between 150-160 characters long for optimal SEO performance.',
          images: [{ url: 'https://example.com/image.jpg' }],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Test Page Title',
          description: 'This is a test description that is between 150-160 characters long for optimal SEO performance.',
        },
        alternates: {
          canonical: 'https://example.com/page',
        },
      };

      const result = SEOValidator.validateMetadata(metadata, '/page');

      expect(result.passed).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should detect missing title', () => {
      const metadata = {
        description: 'Test description',
      } as SEOMetadata;

      const result = SEOValidator.validateMetadata(metadata, '/page');

      expect(result.passed).toBe(false);
      expect(result.issues.some(i => i.field === 'title')).toBe(true);
    });

    it('should detect missing description', () => {
      const metadata = {
        title: 'Test Title',
      } as SEOMetadata;

      const result = SEOValidator.validateMetadata(metadata, '/page');

      expect(result.passed).toBe(false);
      expect(result.issues.some(i => i.field === 'description')).toBe(true);
    });

    it('should warn about missing canonical', () => {
      const metadata: SEOMetadata = {
        title: 'Test Title',
        description: 'Test description',
      };

      const result = SEOValidator.validateMetadata(metadata, '/page');

      expect(result.warnings.some(w => w.field === 'canonical')).toBe(true);
    });

    it('should validate JSON-LD types', () => {
      const jsonld: JSONLDData[] = [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Test Site',
        },
      ];

      const result = SEOValidator.validateJSONLD(jsonld, ['WebSite', 'Organization']);

      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Organization'))).toBe(true);
    });

    it('should validate sitemap', () => {
      const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://example.com/</loc>
            <lastmod>2024-01-15</lastmod>
          </url>
          <url>
            <loc>https://example.com/posts</loc>
          </url>
        </urlset>
      `;

      const result = SEOValidator.validateSitemap(sitemap);

      expect(result.passed).toBe(true);
    });

    it('should validate RSS feed', () => {
      const rss = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Site</title>
            <link>https://example.com</link>
            <description>Test description</description>
            <language>zh-CN</language>
            <item>
              <title>Test Post</title>
              <link>https://example.com/post</link>
              <description>Post description</description>
              <pubDate>Wed, 15 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>
      `;

      const result = SEOValidator.validateRSS(rss);

      expect(result.passed).toBe(true);
    });
  });
});

describe('Performance SEO Tests', () => {
  testPages.forEach((page) => {
    describe(`${page.name} (${page.path})`, () => {
      it('should have optimized font loading', async () => {
        const response = await fetch(`${BASE_URL}${page.path}`);
        const html = await response.text();

        const hasFontDisplay = html.includes('font-display:');
        expect(hasFontDisplay).toBe(true);
      });

      it('should preload critical resources', async () => {
        const response = await fetch(`${BASE_URL}${page.path}`);
        const html = await response.text();

        const hasPreload = html.includes('<link rel="preload"');
        const hasPreconnect = html.includes('<link rel="preconnect"');

        expect(hasPreload || hasPreconnect).toBe(true);
      });
    });
  });
});
