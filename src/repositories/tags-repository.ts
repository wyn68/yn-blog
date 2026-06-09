import { BaseRepository } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Tag } from "@/types";
import type { TagWithPostCount } from "./types";

export class TagsRepository extends BaseRepository {
  constructor() {
    super("tags");
  }

  async findAll(): Promise<Tag[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        devError('Error fetching tags:', error);
        return [];
      }
      return (data as Tag[]) || [];
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) {
        if (error.code !== 'PGRST116') {
          devError('Error fetching tag by slug:', error);
        }
        return null;
      }
      return data as Tag;
    } catch (error) {
      devError('Unexpected error in findBySlug:', error);
      return null;
    }
  }

  async findById(id: string): Promise<Tag | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching tag by id:', error);
      }
      return data as Tag | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async create(tag: Omit<Tag, "id" | "created_at" | "updated_at">): Promise<Tag | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("tags")
        .insert([tag])
        .select()
        .single();
      if (error) {
        devError('Error creating tag:', error);
        return null;
      }
      return data as Tag;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async createBulk(tags: Omit<Tag, "id" | "created_at" | "updated_at">[]): Promise<Tag[] | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("tags")
        .insert(tags)
        .select();
      if (error) {
        devError('Error creating tags bulk:', error);
        return null;
      }
      return data as Tag[];
    } catch (error) {
      devError('Unexpected error in createBulk:', error);
      return null;
    }
  }

  async update(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("tags")
        .update(tag)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating tag:', error);
        return null;
      }
      return data as Tag;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting tag:', error);
        return false;
      }
      return true;
    } catch (error) {
      devError('Unexpected error in delete:', error);
      return false;
    }
  }

  async findAllWithPostCount(): Promise<TagWithPostCount[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("tags")
        .select("*, post_tags(post_id)")
        .order("name", { ascending: true });
      if (error) {
        devError('Error fetching tags with post count:', error);
        return [];
      }
      
      return (data || []).map((tag) => ({
        ...tag,
        count: tag.post_tags?.length || 0,
      })) as TagWithPostCount[];
    } catch (error) {
      devError('Unexpected error in findAllWithPostCount:', error);
      return [];
    }
  }

  async findManyWithPostCount(offset: number, limit: number): Promise<TagWithPostCount[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("tags")
        .select("*, post_tags(post_id)")
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) {
        devError('Error fetching tags with post count:', error);
        return [];
      }
      
      return (data || []).map((tag) => ({
        ...tag,
        count: tag.post_tags?.length || 0,
      })) as TagWithPostCount[];
    } catch (error) {
      devError('Unexpected error in findManyWithPostCount:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      const { count, error } = await supabase
        .from("tags")
        .select("id", { count: "exact", head: true });
      if (error) {
        devError('Error counting tags:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }

  async getPostTags(postId: string): Promise<string[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("post_tags")
        .select("tag_id")
        .eq("post_id", postId);
      if (error) {
        devError('Error fetching post tags:', error);
        return [];
      }
      return data.map((pt) => pt.tag_id);
    } catch (error) {
      devError('Unexpected error in getPostTags:', error);
      return [];
    }
  }

  async addPostTags(postId: string, tagIds: string[]): Promise<void> {
    try {
      const supabase = this.getClient();
      const postTags = tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }));
      const { error } = await supabase.from("post_tags").insert(postTags);
      if (error) {
        devError('Error adding post tags:', error);
        throw error;
      }
    } catch (error) {
      devError('Unexpected error in addPostTags:', error);
      throw error;
    }
  }

  async removePostTags(postId: string, tagIds: string[]): Promise<void> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("post_tags")
        .delete()
        .eq("post_id", postId)
        .in("tag_id", tagIds);
      if (error) {
        devError('Error removing post tags:', error);
        throw error;
      }
    } catch (error) {
      devError('Unexpected error in removePostTags:', error);
      throw error;
    }
  }
}

export const tagsRepository = new TagsRepository();
