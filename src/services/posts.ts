import { cacheWithLog } from "@/lib/cache-with-log";
import { devError } from "@/lib/dev";
import { NotFoundError } from "@/lib/errors";
import { calculateReadingTime } from "@/lib/utils";
import { postsRepository } from "@/repositories/posts-repository";
import type { Post } from "@/types";

export const getPosts = cacheWithLog(async (params?: {
  status?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const posts = await postsRepository.findMany(
      {
        status: params?.status,
        categoryId: params?.categoryId,
        tagId: params?.tagId,
        authorId: params?.authorId,
      },
      {
        limit: params?.limit,
        offset: params?.offset,
        orderBy: "created_at",
        orderDirection: "desc",
      }
    );

    if (!posts || posts.length === 0) {
      return [];
    }

    const postIdsList = posts.map((p) => p.id);
    const commentCountMap = await postsRepository.getCommentCounts(postIdsList);

    return posts.map((post: Post) => ({
      ...post,
      comment_count: commentCountMap.get(post.id) || 0,
    }));
  } catch (error) {
    devError('Unexpected error in getPosts:', error);
    return [];
  }
}, 'posts.getPosts');

export async function getPostsWithPagination(params?: {
  status?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
}, page: number = 1, pageSize: number = 10) {
  try {
    const offset = (page - 1) * pageSize;
    
    const [posts, total] = await Promise.all([
      postsRepository.findMany(
        {
          status: params?.status,
          categoryId: params?.categoryId,
          tagId: params?.tagId,
          authorId: params?.authorId,
        },
        {
          limit: pageSize,
          offset,
          orderBy: "created_at",
          orderDirection: "desc",
        }
      ),
      postsRepository.count(params?.status),
    ]);

    const postIdsList = posts.map((p) => p.id);
    const commentCountMap = await postsRepository.getCommentCounts(postIdsList);

    const postsWithCounts = posts.map((post: Post) => ({
      ...post,
      comment_count: commentCountMap.get(post.id) || 0,
    }));

    return {
      data: postsWithCounts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    devError('Unexpected error in getPostsWithPagination:', error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

/**
 * 检查 slug 是否已被占用（不抛异常，返回 boolean）。
 * 用于 slug 唯一性验证，不适合获取完整文章数据。
 */
export async function isSlugTaken(slug: string): Promise<boolean> {
  const post = await postsRepository.findBySlug(slug);
  return post !== null;
}

export const getPostBySlug = cacheWithLog(async (slug: string) => {
  const post = await postsRepository.findBySlug(slug);
  
  if (!post) {
    throw new NotFoundError('文章不存在');
  }

  const commentCountMap = await postsRepository.getCommentCounts([post.id]);
  
  return {
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
  };
}, 'posts.getPostBySlug');

export const getPostById = cacheWithLog(async (id: string) => {
  return await postsRepository.findById(id);
}, 'posts.getPostById');

export async function createPost(post: Omit<Post, "id" | "created_at" | "updated_at">) {
  const result = await postsRepository.create(post);
  if (!result) {
    throw new Error('创建文章失败');
  }
  return result;
}

export async function updatePost(id: string, post: Partial<Post>) {
  const result = await postsRepository.update(id, post);
  if (!result) {
    throw new NotFoundError('文章不存在');
  }
  return result;
}

export async function deletePost(id: string) {
  const success = await postsRepository.delete(id);
  if (!success) {
    throw new NotFoundError('文章不存在');
  }
}

export async function getPostCount(status?: string) {
  return await postsRepository.count(status);
}

export async function searchPosts(query: string) {
  return await postsRepository.search(query);
}

export async function incrementViewCount(postId: string) {
  const count = await postsRepository.incrementViewCount(postId);
  return count || 0;
}

export async function incrementLikeCount(postId: string) {
  const count = await postsRepository.incrementLikeCount(postId);
  return count || 0;
}

export const getPopularPosts = cacheWithLog(async (limit: number = 5) => {
  try {
    const posts = await postsRepository.findMany(
      { status: "published" },
      { limit, orderBy: "view_count", orderDirection: "desc" }
    );

    if (!posts || posts.length === 0) {
      return [];
    }

    const postIdsList = posts.map((p) => p.id);
    const commentCountMap = await postsRepository.getCommentCounts(postIdsList);

    const postsWithCounts = posts.map((post) => ({
      ...post,
      comment_count: commentCountMap.get(post.id) || 0,
      reading_time: calculateReadingTime(post.content || '')
    }));

    return postsWithCounts;
  } catch (error) {
    devError('Unexpected error in getPopularPosts:', error);
    return [];
  }
}, 'posts.getPopularPosts');

export async function getTopCategories() {
  return await postsRepository.getTopCategories();
}

export async function getAdjacentPosts(createdAt: string) {
  return await postsRepository.getAdjacentPosts(createdAt);
}
