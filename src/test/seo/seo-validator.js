#!/usr/bin/env node

/**
 * SEO Metadata Validation Script
 * 
 * This script validates SEO metadata for all pages in the blog.
 * It checks for common SEO issues and generates a report.
 * 
 * Usage:
 *   node src/test/seo/seo-validator.js
 *   node src/test/seo/seo-validator.js --url=http://localhost:3000
 *   node src/test/seo/seo-validator.js --verbose
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const VERBOSE = process.argv.includes('--verbose');

class SEOMetadataValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  async fetch(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, html: data }));
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  extractMetaTags(html) {
    const metaTags = {};
    const metaRegex = /<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi;
    let match;

    while ((match = metaRegex.exec(html)) !== null) {
      metaTags[match[1]] = match[2];
    }

    return metaTags;
  }

  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractCanonical(html) {
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    return canonicalMatch ? canonicalMatch[1] : null;
  }

  extractJSONLD(html) {
    const jsonldData = [];
    const jsonldRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = jsonldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        jsonldData.push(data);
      } catch (e) {
        console.warn('Failed to parse JSON-LD:', e.message);
      }
    }

    return jsonldData;
  }

  validatePage(path, html) {
    const issues = [];
    const warnings = [];

    const title = this.extractTitle(html);
    const metaTags = this.extractMetaTags(html);
    const canonical = this.extractCanonical(html);
    const jsonld = this.extractJSONLD(html);

    if (!title) {
      issues.push({ field: 'title', message: 'Missing <title> tag' });
    } else if (title.length < 10) {
      warnings.push({ field: 'title', message: `Title too short (${title.length} chars)` });
    } else if (title.length > 60) {
      warnings.push({ field: 'title', message: `Title too long (${title.length} chars)` });
    }

    if (!metaTags['description']) {
      issues.push({ field: 'description', message: 'Missing meta description' });
    } else if (metaTags['description'].length < 120) {
      warnings.push({ field: 'description', message: `Description too short (${metaTags['description'].length} chars)` });
    } else if (metaTags['description'].length > 160) {
      warnings.push({ field: 'description', message: `Description too long (${metaTags['description'].length} chars)` });
    }

    if (!canonical) {
      warnings.push({ field: 'canonical', message: 'Missing canonical URL' });
    }

    if (!metaTags['og:title']) {
      issues.push({ field: 'og:title', message: 'Missing Open Graph title' });
    }
    if (!metaTags['og:description']) {
      issues.push({ field: 'og:description', message: 'Missing Open Graph description' });
    }
    if (!metaTags['og:image']) {
      warnings.push({ field: 'og:image', message: 'Missing Open Graph image' });
    }
    if (!metaTags['og:type']) {
      warnings.push({ field: 'og:type', message: 'Missing Open Graph type' });
    }

    if (!metaTags['twitter:card']) {
      warnings.push({ field: 'twitter:card', message: 'Missing Twitter Card' });
    }
    if (!metaTags['twitter:title']) {
      warnings.push({ field: 'twitter:title', message: 'Missing Twitter title' });
    }
    if (!metaTags['twitter:description']) {
      warnings.push({ field: 'twitter:description', message: 'Missing Twitter description' });
    }

    if (jsonld.length === 0) {
      warnings.push({ field: 'jsonld', message: 'No JSON-LD structured data found' });
    }

    return {
      path,
      title,
      issues,
      warnings,
      jsonldCount: jsonld.length,
      passed: issues.length === 0,
    };
  }

  async validateSitemap() {
    try {
      const { html } = await this.fetch('/sitemap.xml');
      const issues = [];
      const warnings = [];

      if (!html.includes('<?xml')) {
        issues.push({ field: 'sitemap', message: 'Invalid XML' });
      }

      if (!html.includes('<urlset')) {
        issues.push({ field: 'sitemap', message: 'Missing urlset element' });
      }

      const urlCount = (html.match(/<loc>/g) || []).length;
      if (urlCount === 0) {
        issues.push({ field: 'sitemap', message: 'No URLs found' });
      } else {
        warnings.push({ field: 'sitemap', message: `${urlCount} URLs found` });
      }

      if (!html.includes('<loc>') || !html.match(/<loc>[^<]*\/<\/loc>/)) {
        warnings.push({ field: 'sitemap', message: 'Homepage may not be included' });
      }

      return {
        path: '/sitemap.xml',
        issues,
        warnings,
        passed: issues.length === 0,
        urlCount,
      };
    } catch (error) {
      return {
        path: '/sitemap.xml',
        issues: [{ field: 'sitemap', message: `Failed to fetch: ${error.message}` }],
        warnings: [],
        passed: false,
        urlCount: 0,
      };
    }
  }

  async validateRSS() {
    try {
      const { html } = await this.fetch('/rss.xml');
      const issues = [];
      const warnings = [];

      if (!html.includes('<?xml')) {
        issues.push({ field: 'rss', message: 'Invalid XML' });
      }

      if (!html.includes('<rss')) {
        issues.push({ field: 'rss', message: 'Missing rss element' });
      }

      if (!html.includes('<language>zh')) {
        warnings.push({ field: 'rss', message: 'Missing Chinese language tag' });
      }

      const itemCount = (html.match(/<item>/g) || []).length;
      warnings.push({ field: 'rss', message: `${itemCount} items found` });

      if (!html.includes('atom:link')) {
        warnings.push({ field: 'rss', message: 'Missing atom:link self reference' });
      }

      return {
        path: '/rss.xml',
        issues,
        warnings,
        passed: issues.length === 0,
        itemCount,
      };
    } catch (error) {
      return {
        path: '/rss.xml',
        issues: [{ field: 'rss', message: `Failed to fetch: ${error.message}` }],
        warnings: [],
        passed: false,
        itemCount: 0,
      };
    }
  }

  async validateRobots() {
    try {
      const { html } = await this.fetch('/robots.txt');
      const issues = [];
      const warnings = [];

      if (!html.includes('Allow: /')) {
        issues.push({ field: 'robots', message: 'Public pages not allowed' });
      }

      if (!html.includes('/admin')) {
        warnings.push({ field: 'robots', message: '/admin may not be blocked' });
      }

      if (!html.includes('Sitemap:')) {
        warnings.push({ field: 'robots', message: 'Sitemap not referenced' });
      }

      return {
        path: '/robots.txt',
        issues,
        warnings,
        passed: issues.length === 0,
      };
    } catch (error) {
      return {
        path: '/robots.txt',
        issues: [{ field: 'robots', message: `Failed to fetch: ${error.message}` }],
        warnings: [],
        passed: false,
      };
    }
  }

  async run() {
    const pages = [
      '/',
      '/posts',
      '/categories',
      '/tags',
      '/about',
    ];

    console.log('\n🔍 SEO Metadata Validation Report');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log('='.repeat(80));

    for (const path of pages) {
      try {
        if (VERBOSE) console.log(`\n📄 Validating ${path}...`);

        const { status, html } = await this.fetch(path);

        if (status !== 200) {
          this.results.push({
            path,
            issues: [{ field: 'http', message: `HTTP ${status}` }],
            warnings: [],
            passed: false,
          });
          continue;
        }

        const result = this.validatePage(path, html);
        this.results.push(result);

        this.stats.total++;
        if (result.passed) {
          this.stats.passed++;
        } else {
          this.stats.failed++;
        }
        this.stats.warnings += result.warnings.length;

        if (VERBOSE || !result.passed || result.warnings.length > 0) {
          console.log(`\n📄 ${path}`);
          console.log(`   Title: ${result.title || '❌ MISSING'}`);

          if (result.issues.length > 0) {
            console.log(`   ❌ Issues (${result.issues.length}):`);
            result.issues.forEach(issue => {
              console.log(`      - ${issue.field}: ${issue.message}`);
            });
          }

          if (result.warnings.length > 0) {
            console.log(`   ⚠️  Warnings (${result.warnings.length}):`);
            result.warnings.forEach(warning => {
              console.log(`      - ${warning.field}: ${warning.message}`);
            });
          }

          if (result.passed && result.warnings.length === 0) {
            console.log(`   ✅ All checks passed`);
          }
        }
      } catch (error) {
        console.error(`\n❌ Failed to validate ${path}: ${error.message}`);
        this.results.push({
          path,
          issues: [{ field: 'fetch', message: error.message }],
          warnings: [],
          passed: false,
        });
        this.stats.failed++;
      }
    }

    console.log('\n\n📊 Sitemap & Feeds');
    console.log('-'.repeat(80));

    const sitemapResult = await this.validateSitemap();
    this.results.push(sitemapResult);
    console.log(`\n📄 ${sitemapResult.path}`);
    console.log(`   URLs: ${sitemapResult.urlCount}`);
    if (sitemapResult.issues.length > 0) {
      sitemapResult.issues.forEach(issue => {
        console.log(`   ❌ ${issue.message}`);
      });
    }
    if (sitemapResult.warnings.length > 0) {
      sitemapResult.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning.message}`);
      });
    }

    const rssResult = await this.validateRSS();
    this.results.push(rssResult);
    console.log(`\n📄 ${rssResult.path}`);
    console.log(`   Items: ${rssResult.itemCount}`);
    if (rssResult.issues.length > 0) {
      rssResult.issues.forEach(issue => {
        console.log(`   ❌ ${issue.message}`);
      });
    }
    if (rssResult.warnings.length > 0) {
      rssResult.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning.message}`);
      });
    }

    const robotsResult = await this.validateRobots();
    this.results.push(robotsResult);
    console.log(`\n📄 ${robotsResult.path}`);
    if (robotsResult.issues.length > 0) {
      robotsResult.issues.forEach(issue => {
        console.log(`   ❌ ${issue.message}`);
      });
    }
    if (robotsResult.warnings.length > 0) {
      robotsResult.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning.message}`);
      });
    }

    console.log('\n\n📈 Summary');
    console.log('='.repeat(80));
    console.log(`Total Pages Checked: ${this.stats.total + 3}`);
    console.log(`✅ Passed: ${this.results.filter(r => r.passed).length}`);
    console.log(`❌ Failed: ${this.results.filter(r => !r.passed).length}`);
    console.log(`⚠️  Total Warnings: ${this.stats.warnings}`);
    console.log('='.repeat(80));

    const failedResults = this.results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      console.log('\n🚨 Critical Issues Found:');
      failedResults.forEach(result => {
        console.log(`  ${result.path}:`);
        result.issues.forEach(issue => {
          console.log(`    - ${issue.field}: ${issue.message}`);
        });
      });
      process.exit(1);
    } else {
      console.log('\n✅ All critical SEO checks passed!');
      process.exit(0);
    }
  }
}

const validator = new SEOMetadataValidator(BASE_URL);
validator.run().catch(console.error);
