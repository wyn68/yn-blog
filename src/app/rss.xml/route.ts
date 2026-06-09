import { getPosts } from "@/services/posts";
import { getSiteConfig } from "@/services/settings";
import type { Post } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [posts, siteConfig] = await Promise.all([
    getPosts({ status: "published", limit: 50 }) as Promise<(Post & { comment_count: number })[]>,
    getSiteConfig(),
  ]);

  const siteTitle = siteConfig.siteTitle || "YN Blog";
  const siteDescription = siteConfig.siteDescription || "A modern blog platform built with Next.js and Supabase";
  const siteAuthor = siteConfig.siteAuthor || "YN Blog Team";

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/posts/${post.slug}`;
      const contentPreview = post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 300);
      const categories = post.categories?.name ? `<category>${escapeXml(post.categories.name)}</category>` : "";
      
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(contentPreview)}</description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <lastBuildDate>${new Date(post.updated_at).toUTCString()}</lastBuildDate>
      <author>${escapeXml(post.profiles?.username || siteAuthor)}</author>
      ${categories}
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg" length="0"/>` : ""}
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <copyright>Copyright ${new Date().getFullYear()} ${escapeXml(siteTitle)}</copyright>
    <managingEditor>${escapeXml(siteAuthor)} (YN Blog Team)</managingEditor>
    <webMaster>admin@ynpro.top (YN Blog Team)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <atom:link href="${baseUrl}" rel="alternate" type="text/html"/>
    <image>
      <url>${baseUrl}/favicon-32x32.png</url>
      <title>${escapeXml(siteTitle)}</title>
      <link>${baseUrl}</link>
      <width>32</width>
      <height>32</height>
    </image>
    <generator>YN Blog - Next.js RSS Generator</generator>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}