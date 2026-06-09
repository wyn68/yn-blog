import { cacheWithLog } from "@/lib/cache-with-log";
import { postsRepository } from "@/repositories/posts-repository";
import { categoriesRepository } from "@/repositories/categories-repository";
import { tagsRepository } from "@/repositories/tags-repository";
import { commentsRepository } from "@/repositories/comments-repository";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardStats {
  publishedPosts: number;
  categories: number;
  tags: number;
  approvedComments: number;
  pendingComments: number;
  pendingLinkApplications: number;
  pendingRoleApplications: number;
  unreadMessages: number;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    created_at: string;
  }>;
}

/**
 * 获取管理后台仪表盘统计数据。
 * 使用 service/repository 层，不直接操作 Supabase client。
 */
export const getDashboardStats = cacheWithLog(
  async (params: {
    role: string;
    authorId?: string;
  }): Promise<DashboardStats> => {
    const isEditorOrHigher = ['admin', 'editor'].includes(params.role);
    const isAdmin = params.role === 'admin';
    const isAuthorOnly = params.role === 'author';

    const [
      publishedPosts,
      categories,
      tags,
      approvedComments,
      recentPosts,
    ] = await Promise.all([
      // 作者角色只统计自己的文章
      isAuthorOnly && params.authorId
        ? postsRepository.countPublishedByAuthor(params.authorId)
        : postsRepository.count("published"),
      categoriesRepository.count(),
      tagsRepository.count(),
      // 作者角色只统计自己文章的评论
      isAuthorOnly && params.authorId
        ? commentsRepository.countByAuthorId(params.authorId, "approved")
        : commentsRepository.countByPostId(undefined, "approved"),
      postsRepository.findMany(
        {
          status: "published",
          ...(params.authorId && isAuthorOnly
            ? { authorId: params.authorId }
            : {}),
        },
        { limit: 2, orderBy: "created_at", orderDirection: "desc" }
      ),
    ]);

    // 以下统计仅 editor+ 可见，使用 admin client
    let pendingComments = 0;
    let pendingLinkApplications = 0;
    let pendingRoleApplications = 0;
    let unreadMessages = 0;

    if (isEditorOrHigher) {
      const adminClient = createAdminClient();
      const [pendingCommentCount, linkApps, roleApps, messages] = await Promise.all([
        adminClient
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        adminClient
          .from("link_applications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        isAdmin
          ? adminClient
              .from("role_applications")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending")
          : Promise.resolve({ count: 0 }),
        isAdmin
          ? adminClient
              .from("messages")
              .select("id", { count: "exact", head: true })
              .eq("status", "unread")
          : Promise.resolve({ count: 0 }),
      ]);

      pendingComments = pendingCommentCount.count || 0;
      pendingLinkApplications = linkApps.count || 0;
      pendingRoleApplications = roleApps.count || 0;
      unreadMessages = messages.count || 0;
    }

    return {
      publishedPosts,
      categories: isEditorOrHigher ? categories : 0,
      tags: isEditorOrHigher ? tags : 0,
      approvedComments,
      pendingComments,
      pendingLinkApplications,
      pendingRoleApplications,
      unreadMessages,
      recentPosts: recentPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        created_at: p.created_at,
      })),
    };
  },
  "dashboard.getStats"
);
