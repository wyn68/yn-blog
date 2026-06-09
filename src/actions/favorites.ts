"use server";

import { createClient } from "@/lib/supabase";
import { favoritesRepository } from "@/repositories/favorites-repository";
import type { FavoriteWithPost } from "@/repositories/favorites-repository";
import { handleSupabaseError } from "@/lib/errors";
import { devError, devLog } from "@/lib/dev";

/**
 * 简单的服务端互斥锁，防止同一用户对同一文章的并发 toggle 请求。
 * 注意：仅在单实例有效，多实例部署建议在数据库添加 UNIQUE(post_id, user_id) 约束。
 */
const toggleLocks = new Map<string, Promise<unknown>>();

export async function toggleFavorite(postId: string) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "请先登录", isFavorite: false };
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { success: false, message: "请先登录", isFavorite: false };
  }

  const userId = userData.user.id;
  const lockKey = `${userId}:${postId}`;

  // 防止同一用户对同一文章的并发 toggle 请求
  const existingLock = toggleLocks.get(lockKey);
  if (existingLock) {
    await existingLock;
  }

  const promise = (async () => {
    try {
      const { data: existing, error: checkError } = await supabase
        .from("favorites")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        handleSupabaseError(checkError, '检查收藏状态');
        return { success: false, message: "操作失败", isFavorite: false };
      }

      if (existing) {
        // 取消收藏：使用 DELETE + WHERE 确保只删除自己的记录
        await supabase
          .from("favorites")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        return { success: true, message: "已取消收藏", isFavorite: false };
      } else {
        // 添加收藏：依赖数据库 UNIQUE 约束防止重复
        // 如果数据库未设置 UNIQUE(post_id, user_id)，重复请求会插入重复行
        const { error: insertError } = await supabase
          .from("favorites")
          .insert([{ post_id: postId, user_id: userId }]);

        // 如果插入失败（违反唯一约束），说明收藏已存在
        if (insertError) {
          if (insertError.code === '23505') {
            return { success: true, message: "已收藏", isFavorite: true };
          }
          devError("Error inserting favorite:", insertError);
          return { success: false, message: "操作失败", isFavorite: false };
        }

        return { success: true, message: "收藏成功", isFavorite: true };
      }
    } catch (error) {
      devError("Error toggling favorite:", error);
      return { success: false, message: "操作失败", isFavorite: false };
    } finally {
      toggleLocks.delete(lockKey);
    }
  })();

  toggleLocks.set(lockKey, promise);
  return promise;
}

export async function getFavoriteStatus(postId: string) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { isFavorite: false };
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { isFavorite: false };
  }

  try {
    const { data: existing, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userData.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return { isFavorite: false };
    }

    if (error) {
      handleSupabaseError(error, '检查收藏状态');
      return { isFavorite: false };
    }

    return { isFavorite: !!existing };
  } catch (error) {
    devError("Error getting favorite status:", error);
    return { isFavorite: false };
  }
}

export interface FavoritePost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  categories?: { name: string; slug: string } | null;
}

/**
 * 获取当前用户的收藏文章列表（走 Repository 层）。
 * 过滤掉已删除的文章（posts 为 null 的记录）。
 */
export async function fetchMyFavorites(): Promise<FavoritePost[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return [];
  }

  try {
    const favorites = await favoritesRepository.findByUser(userData.user.id);

    // 提取 posts 对象（非数组！），过滤 null（文章已删除），转为统一格式
    return favorites
      .map((f: FavoriteWithPost) => f.posts)
      .filter((post): post is NonNullable<typeof post> => post !== null && post !== undefined)
      .map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: (post as any).content || '',
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        view_count: (post as any).view_count || 0,
        like_count: (post as any).like_count || 0,
        created_at: post.created_at,
        categories: post.categories ?? null,
      }));
  } catch (error) {
    devError("Error fetching favorites:", error);
    return [];
  }
}
