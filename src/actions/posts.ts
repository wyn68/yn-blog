"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPost, updatePost, deletePost, incrementViewCount, incrementLikeCount, isSlugTaken, getPostById } from "@/services/posts";
import { syncPostTags } from "@/services/tags";
import { generateSlug } from "@/lib/utils";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { requireAuthorOrHigher, getCurrentUserProfile } from "@/lib/auth";
import { hasRole, type Role } from "@/lib/role";
import { authRepository } from "@/repositories/auth-repository";
import { clearCacheByPrefix } from "@/lib/cache-with-log";
import { redisViewRateLimiter as viewRateLimiter } from "@/lib/redis-rate-limiter";
import { getRedisClientSafe } from "@/lib/redis";
import { headers } from "next/headers";
import type { Post } from "@/types";
import { devError, devLog } from "@/lib/dev";

const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;
const VALID_PROTOCOLS = /^https?:\/\//i;

function validateUrlProtocol(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) return;
  if (BLOCKED_PROTOCOLS.test(trimmed)) {
    throw new BadRequestError("URL包含不安全的协议");
  }
  if (!VALID_PROTOCOLS.test(trimmed)) {
    throw new BadRequestError("URL必须以 http:// 或 https:// 开头");
  }
}

/** 验证当前用户是否有权操作指定文章 */
async function verifyPostOwnership(postId: string): Promise<Post> {
  const profile = await getCurrentUserProfile();
  const post = await getPostById(postId);
  if (!post) {
    throw new NotFoundError("文章不存在");
  }
  // admin 和 editor 拥有 manage_posts 权限，可以操作所有文章
  if (hasRole(profile!.role as Role, "editor")) {
    return post;
  }
  // author 只能操作自己的文章
  if (post.author_id !== profile!.id) {
    throw new ForbiddenError("无权操作他人文章");
  }
  return post;
}

/** IP 去重时间窗口配置 */
const VIEW_DEDUP_WINDOW_MS = 30_000;  // 浏览：30 秒
const LIKE_DEDUP_WINDOW_MS = 60_000;  // 点赞：60 秒

/** 内存级去重 Map（单实例 fallback） */
const recentViews = new Map<string, number>();
const recentLikes = new Map<string, number>();

/**
 * 通用去重检查，优先使用 Redis，不可用时回退到内存 Map。
 * 返回 true 表示重复（应跳过），false 表示首次（应处理）。
 */
async function isDuplicate(
  redisKey: string,
  memoryMap: Map<string, number>,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();

  // 1) 先检查内存 Map（快速路径）
  const lastTime = memoryMap.get(redisKey);
  if (lastTime && now - lastTime < windowMs) {
    return true;
  }

  // 2) 尝试 Redis 去重（分布式环境）
  const redis = getRedisClientSafe();
  if (redis) {
    try {
      const redisFullKey = `dedup:${redisKey}`;
      const result = await redis.set(redisFullKey, String(now), 'PX', windowMs, 'NX');
      if (result === null) {
        // Key 已存在 = 重复
        return true;
      }
    } catch {
      // Redis 异常，继续使用内存 Map
    }
  }

  // 3) 更新内存 Map
  memoryMap.set(redisKey, now);
  return false;
}

async function generateUniqueSlug(title: string, existingSlug?: string): Promise<string> {
  let slug = existingSlug || generateSlug(title);

  // 先快速检查初始 slug 是否可用
  if (!await isSlugTaken(slug)) {
    return slug;
  }

  // 冲突时添加递增后缀
  const baseSlug = generateSlug(title);
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidateSlug = `${baseSlug}-${attempt}`;
    if (!await isSlugTaken(candidateSlug)) {
      return candidateSlug;
    }
  }

  // 所有尝试均冲突，使用时间戳后缀作为最终后备
  return `${baseSlug}-${Date.now()}`;
}

/**
 * 服务端获取文章详情（供客户端组件使用）。
 * 确保数据在服务端获取，避免客户端暴露查询逻辑。
 */
export async function fetchPostById(postId: string): Promise<Post | null> {
  return await getPostById(postId);
}

export async function handleIncrementViewCount(postId: string) {
  try {
    const headersList = await headers();
    const clientIp = headersList.get("x-forwarded-for") ||
                     headersList.get("x-real-ip") ||
                     "unknown";

    const rateLimitKey = `view:${clientIp}`;
    const { allowed } = await viewRateLimiter.check(rateLimitKey);
    if (!allowed) {
      return { success: false, error: "Too many requests" };
    }

    // 去重：优先 Redis，回退内存 Map
    const dedupKey = `view:${clientIp}:${postId}`;
    const duplicate = await isDuplicate(dedupKey, recentViews, VIEW_DEDUP_WINDOW_MS);
    if (duplicate) {
      return { success: true, viewCount: null, deduplicated: true };
    }

    const newViewCount = await incrementViewCount(postId);
    return { success: true, viewCount: newViewCount };
  } catch {
    return { success: false, error: "Failed to increment view count" };
  }
}

export async function handleIncrementLikeCount(postId: string) {
  try {
    const headersList = await headers();
    const clientIp = headersList.get("x-forwarded-for") ||
                     headersList.get("x-real-ip") ||
                     "unknown";

    const rateLimitKey = `like:${clientIp}`;
    const { allowed } = await viewRateLimiter.check(rateLimitKey);
    if (!allowed) {
      return { success: false, error: "Too many requests" };
    }

    // 去重：优先 Redis，回退内存 Map
    const dedupKey = `like:${clientIp}:${postId}`;
    const duplicate = await isDuplicate(dedupKey, recentLikes, LIKE_DEDUP_WINDOW_MS);
    if (duplicate) {
      return { success: true, likeCount: null, deduplicated: true };
    }

    const newLikeCount = await incrementLikeCount(postId);
    return { success: true, likeCount: newLikeCount };
  } catch {
    return { success: false, error: "Failed to increment like count" };
  }
}

export async function handleCreatePost(formData: FormData) {
  const { session, profile } = await authRepository.getSessionWithProfile();
  
  if (!session || !profile) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const featuredImage = formData.get("featured_image") as string;
  const status = formData.get("status") as string;
  const categoryId = formData.get("category_id") as string;
  const tagIds = formData.getAll("tags") as string[];

  if (!title || !content) {
    throw new BadRequestError("标题和内容不能为空");
  }

  const post = await createPost({
    title,
    slug: await generateUniqueSlug(title, slug || undefined),
    content,
    excerpt: excerpt || content.substring(0, 150),
    featured_image: featuredImage || null,
    status: status as Post["status"],
    author_id: profile.id,
    category_id: categoryId || null,
    view_count: 0,
    like_count: 0,
  });

  if (!post) {
    throw new Error("创建文章失败");
  }

  if (tagIds.length > 0) {
    try {
      await syncPostTags(post.id, tagIds);
    } catch (tagError) {
      // Tag sync failure should not prevent post creation from succeeding
      devError('Failed to sync tags for post:', post.id, tagError);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  clearCacheByPrefix("posts");
}

export async function handleUpdatePost(postId: string, formData: FormData) {
  await requireAuthorOrHigher();

  await verifyPostOwnership(postId);

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const featuredImage = formData.get("featured_image") as string;
  const status = formData.get("status") as string;
  const categoryId = formData.get("category_id") as string;
  const tagIds = formData.getAll("tags") as string[];

  if (!title || !content) {
    throw new BadRequestError("标题和内容不能为空");
  }

  // 服务端校验 URL 协议，防止 javascript: 等 XSS 注入
  if (featuredImage?.trim()) {
    validateUrlProtocol(featuredImage);
  }

  await updatePost(postId, {
    title,
    slug: slug || generateSlug(title),
    content,
    excerpt: excerpt || content.substring(0, 150),
    featured_image: featuredImage || null,
    status: status as Post["status"],
    category_id: categoryId || null,
  });

  try {
    await syncPostTags(postId, tagIds);
  } catch (tagError) {
    // Tag sync failure should not prevent post update from succeeding
    devError('Failed to sync tags for post:', postId, tagError);
  }

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/posts");
  clearCacheByPrefix("posts");
}

export async function handleDeletePost(postId: string) {
  await requireAuthorOrHigher();

  await verifyPostOwnership(postId);

  await deletePost(postId);

  revalidatePath("/");
  revalidatePath("/admin/posts");
  clearCacheByPrefix("posts");
}
