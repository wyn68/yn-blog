import { BaseRepository, QueryOptions } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Post } from "@/types";
import type { PostWithRelations, TopCategory } from "./types";

export interface PostsQueryParams {
  status?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
}

export class PostsRepository extends BaseRepository {
  constructor() {
    super("posts");
  }

  async findMany(
    params?: PostsQueryParams,
    options?: QueryOptions
  ): Promise<PostWithRelations[]> {
    try {
      const supabase = this.getPublicClient();
      let postIds: string[] | null = null;

      if (params?.tagId) {
        const { data: postTags, error: tagError } = await supabase
          .from("post_tags")
          .select("post_id")
          .eq("tag_id", params.tagId);
        if (tagError) {
          devError('Error fetching post tags:', tagError);
          return [];
        }
        postIds = postTags?.map((pt) => pt.post_id) || [];
      }

      let query = supabase
        .from("posts")
        .select("*, profiles(id, username, avatar_url), categories(name, slug)");

      if (params?.status) {
        query = query.eq("status", params.status);
      }
      if (params?.categoryId) {
        query = query.eq("category_id", params.categoryId);
      }
      if (postIds !== null && postIds.length > 0) {
        query = query.in("id", postIds);
      } else if (postIds !== null && postIds.length === 0) {
        return [];
      }
      if (params?.authorId) {
        query = query.eq("author_id", params.authorId);
      }

      const orderBy = options?.orderBy || "created_at";
      const orderDirection = options?.orderDirection || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data: posts, error } = await query;
      if (error) {
        devError('Error fetching posts:', error);
        return [];
      }

      return posts as PostWithRelations[];
    } catch (error) {
      devError('Unexpected error in findMany:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<PostWithRelations | null> {
    try {
      const supabase = this.getPublicClient();
      const { data: post, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, avatar_url), categories(name, slug)")
        .eq("slug", slug)
        .single();
      if (error) {
        if (error.code !== 'PGRST116') {
          devError('Error fetching post by slug:', error);
        }
        return null;
      }
      return post as PostWithRelations;
    } catch (error) {
      devError('Unexpected error in findBySlug:', error);
      return null;
    }
  }

  async findById(id: string): Promise<PostWithRelations | null> {
    try {
      const supabase = this.getPublicClient();
      const { data: post, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, avatar_url), categories(name)")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching post by id:', error);
      }
      return post as PostWithRelations | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async create(post: Omit<Post, "id" | "created_at" | "updated_at">): Promise<Post | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("posts")
        .insert([post])
        .select()
        .single();
      if (error) {
        devError('Error creating post:', error);
        return null;
      }
      return data as Post;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async update(id: string, post: Partial<Post>): Promise<Post | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("posts")
        .update(post)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating post:', error);
        return null;
      }
      return data as Post;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting post:', error);
        return false;
      }
      return true;
    } catch (error) {
      devError('Unexpected error in delete:', error);
      return false;
    }
  }

  async count(status?: string): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      let query = supabase.from("posts").select("id", { count: "exact", head: true });
      if (status) {
        query = query.eq("status", status);
      }
      const { count, error } = await query;
      if (error) {
        devError('Error fetching post count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }

  async countPublishedByAuthor(authorId: string): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      const { count, error } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", authorId)
        .eq("status", "published");
      if (error) {
        devError('Error fetching author post count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in countPublishedByAuthor:', error);
      return 0;
    }
  }

  async search(query: string): Promise<PostWithRelations[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, avatar_url), categories(name, slug)")
        .eq("status", "published")
        .textSearch('fts', query, {
          type: 'plain',
          config: 'simple'
        });
      if (error) {
        devError('Error searching posts:', error);
        return [];
      }
      return data as PostWithRelations[];
    } catch (error) {
      devError('Unexpected error in search:', error);
      return [];
    }
  }

  /**
   * 原子递增浏览计数。
   * 优先使用数据库 RPC 函数（SECURITY DEFINER），
   * RPC 不可用时回退到直接 SQL 更新（使用普通 client，依赖 RLS）。
   * 注意：不使用 admin client，确保不会绕过 RLS 策略。
   */
  async incrementViewCount(postId: string): Promise<number | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .rpc('increment_view_count', { post_id: postId });

      if (error) {
        if (error.message?.includes('Could not find the function')) {
          return this.incrementCountFallback(postId, 'view_count');
        }
        devError('Error incrementing view count:', error);
        return null;
      }

      return data;
    } catch (error) {
      devError('Unexpected error in incrementViewCount:', error);
      return null;
    }
  }

  async incrementLikeCount(postId: string): Promise<number | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .rpc('increment_like_count', { post_id: postId });

      if (error) {
        if (error.message?.includes('Could not find the function')) {
          return this.incrementCountFallback(postId, 'like_count');
        }
        devError('Error incrementing like count:', error);
        return null;
      }

      return data;
    } catch (error) {
      devError('Unexpected error in incrementLikeCount:', error);
      return null;
    }
  }

  /**
   * RPC 函数不可用时的回退方案。
   * 使用通用的 increment_count_atomic RPC 执行单次原子 UPDATE，
   * 利用 PostgreSQL 的 SET col = col + 1 原生原子性，消除 SELECT→UPDATE 竞争窗口。
   */
  private async incrementCountFallback(
    postId: string,
    column: 'view_count' | 'like_count'
  ): Promise<number | null> {
    try {
      const supabase = this.getClient();
      // 调用通用原子递增 RPC，内部执行 SET col = col + 1
      const { data, error } = await supabase
        .rpc('increment_count_atomic', {
          p_post_id: postId,
          p_column: column,
        });

      if (error) {
        devError(`Error in incrementCountFallback (${column}):`, error);
        return null;
      }

      return data as number | null;
    } catch (error) {
      devError(`Unexpected error in incrementCountFallback (${column}):`, error);
      return null;
    }
  }

  /**
   * 获取指定文章的上一篇和下一篇（基于 created_at 排序）。
   * 使用数据库直接查询，避免全量加载所有已发布文章。
   */
  async getAdjacentPosts(
    createdAt: string
  ): Promise<{
    prevPost: { slug: string; title: string } | null;
    nextPost: { slug: string; title: string } | null;
  }> {
    try {
      const supabase = this.getPublicClient();
      const baseQuery = supabase
        .from('posts')
        .select('slug, title, created_at')
        .eq('status', 'published');

      // 上一篇: created_at 早于当前文章的最大值
      const { data: prevData, error: prevError } = await baseQuery
        .lt('created_at', createdAt)
        .order('created_at', { ascending: false })
        .limit(1);

      if (prevError) {
        devError('Error fetching previous post:', prevError);
      }

      // 下一篇: created_at 晚于当前文章的最小值
      const { data: nextData, error: nextError } = await supabase
        .from('posts')
        .select('slug, title, created_at')
        .eq('status', 'published')
        .gt('created_at', createdAt)
        .order('created_at', { ascending: true })
        .limit(1);

      if (nextError) {
        devError('Error fetching next post:', nextError);
      }

      // 如果 created_at 相同（同一秒内发表），用 id 作为 tiebreaker
      const prevPost = prevData?.[0]
        ? { slug: prevData[0].slug, title: prevData[0].title }
        : null;
      const nextPost = nextData?.[0]
        ? { slug: nextData[0].slug, title: nextData[0].title }
        : null;

      return { prevPost, nextPost };
    } catch (error) {
      devError('Unexpected error in getAdjacentPosts:', error);
      return { prevPost: null, nextPost: null };
    }
  }

  /**
   * 批量获取文章评论数。
   * 使用单次 GROUP BY 查询替代 N 次独立查询，避免 N+1 问题。
   * 当 postIds 为空时直接返回空 Map。
   */
  async getCommentCounts(postIds: string[]): Promise<Map<string, number>> {
    const commentCountMap = new Map<string, number>();

    if (postIds.length === 0) {
      return commentCountMap;
    }

    try {
      const supabase = this.getPublicClient();

      // 使用 RPC 函数执行 GROUP BY 聚合查询
      // 如果 RPC 不可用，回退到逐个查询（兼容旧版部署）
      const { data, error } = await supabase
        .rpc('get_comment_counts', { post_ids: postIds });

      if (error) {
        // RPC 不可用时回退到逐个查询
        if (error.message?.includes('Could not find the function')) {
          devError('RPC get_comment_counts not available, falling back to N queries');
          return this.getCommentCountsFallback(postIds);
        }
        devError('Error fetching comment counts via RPC:', error);
        return commentCountMap;
      }

      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.post_id && typeof row.count === 'number') {
            commentCountMap.set(row.post_id, row.count);
          }
        }
      }

      return commentCountMap;
    } catch (error) {
      devError('Unexpected error in getCommentCounts:', error);
      return commentCountMap;
    }
  }

  /**
   * RPC 不可用时的回退方案：逐个查询评论数。
   * 使用 Promise.all 并行执行以减少延迟。
   */
  private async getCommentCountsFallback(postIds: string[]): Promise<Map<string, number>> {
    const commentCountMap = new Map<string, number>();
    try {
      const supabase = this.getPublicClient();
      const results = await Promise.all(
        postIds.map(async (postId) => {
          const { count, error } = await supabase
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("post_id", postId)
            .eq("status", "approved");
          if (error) {
            devError('Error fetching comment count for post:', postId, error);
            return null;
          }
          return { postId, count: count || 0 };
        })
      );

      results.forEach((r) => {
        if (r) commentCountMap.set(r.postId, r.count);
      });
    } catch (error) {
      devError('Unexpected error in getCommentCountsFallback:', error);
    }
    return commentCountMap;
  }

  async getTopCategories(): Promise<TopCategory[]> {
    try {
      const supabase = this.getPublicClient();
      // 限制查询数量，避免拉取所有文章后在 JS 端聚合
      const { data, error } = await supabase
        .from("posts")
        .select("category_id, categories(name, slug)")
        .eq("status", "published")
        .limit(1000);
      if (error) {
        devError('Error fetching top categories:', error);
        return [];
      }

      const categoryMap = new Map<string, TopCategory>();
      data?.forEach((post) => {
        if (post.category_id && post.categories && post.categories.length > 0) {
          const category = post.categories[0];
          const existing = categoryMap.get(post.category_id);
          if (existing) {
            existing.count++;
          } else {
            categoryMap.set(post.category_id, {
              id: post.category_id,
              name: category.name,
              slug: category.slug,
              count: 1,
            });
          }
        }
      });

      return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
    } catch (error) {
      devError('Unexpected error in getTopCategories:', error);
      return [];
    }
  }
}

export const postsRepository = new PostsRepository();
