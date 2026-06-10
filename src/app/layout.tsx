import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import BackToTop from "@/components/ui/BackToTop";
import PageLoader from "@/components/PageLoader";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/CookieConsent";
import { generateWebsiteJSONLD, generateOrganizationJSONLD } from "@/lib/seo";
import { getSiteConfig } from "@/services/settings";
import JsonLd from "@/components/JsonLd";
import MonitoringInitializer from "@/components/MonitoringInitializer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  
  const siteTitle = siteConfig.seoTitle || siteConfig.siteTitle || "YN Blog";
  const siteDescription = siteConfig.seoDescription || siteConfig.siteDescription || 
    "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: [
      siteTitle,
      "博客",
      "技术博客",
      "Next.js",
      "React",
      "Supabase",
      "TypeScript",
      "前端开发",
      "Web 开发",
      "编程教程",
    ],
    authors: [{ name: siteConfig.siteAuthor || "YN Blog Team", url: baseUrl }],
    creator: siteConfig.siteAuthor || "YN Blog Team",
    publisher: siteTitle,
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
    icons: {
      icon: [
        { rel: "icon", url: "/favicon.ico", sizes: "any" },
        { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
      ],
      other: [
        { rel: "manifest", url: "/site.webmanifest" },
      ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: baseUrl,
      siteName: siteTitle,
      title: {
        default: siteTitle,
        template: `%s | ${siteTitle}`,
      },
      description: siteDescription,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.socialTwitter || "@ynblog",
      creator: siteConfig.socialTwitter || "@ynblog",
      title: {
        default: siteTitle,
        template: `%s | ${siteTitle}`,
      },
      description: siteDescription,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: baseUrl,
      types: {
        "application/rss+xml": [{ url: `${baseUrl}/rss.xml`, title: `${siteTitle} RSS Feed` }],
      },
    },
    category: "technology",
    classification: "Blog",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    appLinks: {
      web: { url: baseUrl, should_fallback: true },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();
  const siteTitle = siteConfig.seoTitle || siteConfig.siteTitle || "YN Blog";
  const siteDescription = siteConfig.seoDescription || siteConfig.siteDescription || 
    "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。";
  
  const websiteJsonLd = generateWebsiteJSONLD(siteTitle, siteDescription);
  const organizationJsonLd = generateOrganizationJSONLD(siteTitle);

  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var t=localStorage.getItem('theme');
                  if(!t){
                    t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
                  }
                  document.documentElement.classList.toggle('dark',t==='dark');
                  document.documentElement.style.colorScheme=t;
                }catch(e){}
              })();
            `,
          }}
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteTitle} />
        <meta name="application-name" content={siteTitle} />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
      </head>
      <body className={`min-h-screen bg-background text-foreground ${inter.className}`} suppressHydrationWarning>
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
        <MonitoringInitializer />
        <PageLoader />
        <ToastProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <BackToTop />
          <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  );
}