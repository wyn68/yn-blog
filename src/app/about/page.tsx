import type { Metadata } from "next";
import { User, Mail, MessageCircle, Globe } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import JsonLd from "@/components/JsonLd";
import { getSiteConfig } from "@/services/settings";
import { 
  generateSEOMetadata, 
  generateAboutPageJSONLD 
} from "@/lib/seo";
import MessageForm from "@/components/MessageForm";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const title = "关于我们";
  const fullTitle = siteConfig.seoTitle ? `${title} - ${siteConfig.seoTitle}` : title;
  const description = siteConfig.seoDescription || siteConfig.siteDescription || "了解 YN Blog 的故事、使命和技术栈。YN Blog 是一个现代化的博客平台，致力于分享技术、生活与思考。";

  return generateSEOMetadata({
    title: fullTitle,
    description,
    keywords: ["关于我们", "博客介绍", "技术博客"],
    url: `${baseUrl}/about`,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

export default async function AboutPage() {
  const siteConfig = await getSiteConfig();

  const aboutPageJsonLd = generateAboutPageJSONLD({
    name: "关于我们",
    description: "了解 YN Blog 的故事、使命和技术栈。YN Blog 是一个现代化的博客平台，致力于分享技术、生活与思考。",
    url: `${baseUrl}/about`,
    siteName: siteConfig.siteTitle || "YN Blog",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <JsonLd data={aboutPageJsonLd} />
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">关于我们</h1>
        <p className="text-muted-foreground text-base sm:text-lg">了解 YN Blog 的故事</p>
      </div>

        <div className="card p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-accent flex items-center justify-center">
              <User className="h-8 w-8 sm:h-12 sm:w-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {siteConfig.siteTitle || "YN Blog"}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
                {siteConfig.siteDescription ||
                  "一个现代化的博客平台，致力于分享技术、生活与思考。"}
              </p>
              <div className="flex justify-center md:justify-start gap-3 sm:gap-4">
                <ShareButton
                  title={siteConfig.siteTitle || "YN Blog"}
                  description={siteConfig.siteDescription || "一个现代化的博客平台"}
                  url={`${baseUrl}/about`}
                />
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="评论"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href={baseUrl}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="网站"
                >
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
          <div className="card p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">我们的使命</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              我们相信知识分享的力量。通过这个博客平台，我们希望能够连接志同道合的人，
              分享有价值的内容，促进思想的交流与碰撞。
            </p>
          </div>

          <div className="card p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">技术栈</h3>
            <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></span>
                Next.js 14 + App Router
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></span>
                TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></span>
                Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></span>
                Supabase
              </li>
            </ul>
          </div>
        </div>

        <div className="card p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">联系我们</h3>
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <a
              href="mailto:admin@ynpro.top"
              className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              admin@ynpro.top
            </a>
          </div>
        </div>

        <MessageForm />
      </div>
    );
}