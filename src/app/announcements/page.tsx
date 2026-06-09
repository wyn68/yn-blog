import type { Metadata } from "next";
import { FileText, Pin, Calendar } from "lucide-react";
import { getAnnouncements } from "@/services/announcements";
import { generateSEOMetadata } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitize";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const title = "公告";
  const description = "YN Blog 站点公告，包含网站更新信息和重要通知";

  return generateSEOMetadata({
    title,
    description,
    keywords: ["公告", "通知", "网站更新", "YN Blog"],
    url: `${baseUrl}/announcements`,
    image: "/og-image.png",
    imageAlt: title,
    type: "website",
  });
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements({ isPublished: true });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">公告</h1>
        <p className="text-muted-foreground text-base sm:text-lg">查看网站的最新公告和重要通知</p>
      </div>

      {announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">暂无公告</p>
          <p className="text-muted-foreground mt-2">当前没有发布的公告</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="card p-4 sm:p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  announcement.is_pinned 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {announcement.is_pinned ? (
                    <Pin className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {sanitizeHtml(announcement.title)}
                    </h2>
                    {announcement.is_pinned && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        置顶
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-2">
                    {sanitizeHtml(announcement.excerpt || announcement.content.substring(0, 150))}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(announcement.created_at).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {sanitizeHtml(announcement.content)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}