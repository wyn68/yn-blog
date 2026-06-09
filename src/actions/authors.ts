"use server";

import { authRepository } from "@/repositories/auth-repository";
import { postsRepository } from "@/repositories/posts-repository";
import type { Profile, Post } from "@/types";

export interface AuthorData {
  profile: Profile | null;
  posts: (Post & { comment_count: number })[];
  totalPosts: number;
}

/**
 * 获取作者页面数据（服务端执行，使用 Repository 层）。
 * 替代客户端直调 Supabase，确保数据访问遵循项目架构。
 */
export async function fetchAuthorData(
  profileId: string,
  page: number = 1,
  pageSize: number = 6
): Promise<AuthorData> {
  const profile = await authRepository.getProfileById(profileId);

  if (!profile) {
    return { profile: null, posts: [], totalPosts: 0 };
  }

  const offset = (page - 1) * pageSize;

  const [posts, totalPosts] = await Promise.all([
    postsRepository.findMany(
      { authorId: profileId, status: "published" },
      {
        limit: pageSize,
        offset,
        orderBy: "created_at",
        orderDirection: "desc",
      }
    ),
    postsRepository.countPublishedByAuthor(profileId),
  ]);

  // 批量获取评论数
  const postIds = posts.map((p) => p.id);
  const commentCountMap = await postsRepository.getCommentCounts(postIds);

  const postsWithCounts = posts.map((post) => ({
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
  }));

  return { profile, posts: postsWithCounts as (Post & { comment_count: number })[], totalPosts };
}
