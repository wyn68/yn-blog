import { cacheWithLog } from "@/lib/cache-with-log";
import { postsRepository } from "@/repositories/posts-repository";
import { categoriesRepository } from "@/repositories/categories-repository";
import { tagsRepository } from "@/repositories/tags-repository";
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
    const isEditorOrHigher = ["admin", "editor"].includes(params.role);
    const isAdmin = params.role === "admin";
    const isAuthorOnly = params.role === "author";
    const adminClient = createAdminClient();

    // 预取文章数据（作者只取自己的）
    const [publishedPosts, categories, tags, recentPosts] =
      await Promise.all([
        isAuthorOnly && params.authorId
          ? postsRepository.countPublishedByAuthor(params.authorId)
          : postsRepository.count("published"),
        categoriesRepository.count(),
        tagsRepository.count(),
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

    // 评论统计：使用 admin client 绕过 RLS
    const [approvedComments, pendingComments, linkApps, roleApps, messages] =
      await Promise.all([
        // 已通过评论
        isAuthorOnly && params.authorId
          ? adminClient
              .from("posts")
              .select("id")
              .eq("author_id", params.authorId)
              .then(({ data: posts }) => {
                if (!posts || posts.length === 0) return 0;
                const postIds = posts.map((p) => p.id);
                return adminClient
                  .from("comments")
                  .select("id", { count: "exact", head: true })
                  .in("post_id", postIds)
                  .eq("status", "approved")
                  .then(({ count }) => count || 0);
              })
          : adminClient
              .from("comments")
              .select("id", { count: "exact", head: true })
              .eq("status", "approved")
              .then(({ count }) => count || 0),
        // 待审核评论（仅 editor+）
        isEditorOrHigher
          ? adminClient
              .from("comments")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending")
              .then(({ count }) => count || 0)
          : 0,
        // 待处理友链申请（仅 editor+）
        isEditorOrHigher
          ? adminClient
              .from("link_applications")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending")
              .then(({ count }) => count || 0)
          : 0,
        // 待处理角色申请（仅 admin）
        isAdmin
          ? adminClient
              .from("role_applications")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending")
              .then(({ count }) => count || 0)
          : 0,
        // 未读用户留言（仅 admin）
        isAdmin
          ? adminClient
              .from("messages")
              .select("id", { count: "exact", head: true })
              .eq("status", "unread")
              .then(({ count }) => count || 0)
          : 0,
      ]);

    return {
      publishedPosts,
      categories: isEditorOrHigher ? categories : 0,
      tags: isEditorOrHigher ? tags : 0,
      approvedComments,
      pendingComments,
      pendingLinkApplications: linkApps,
      pendingRoleApplications: roleApps,
      unreadMessages: messages,
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
