import { BaseRepository } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Comment } from "@/types";

export class CommentsRepository extends BaseRepository {
  constructor() {
    super("comments");
  }

  async findByPostId(postId?: string, status?: string) {
    try {
      const supabase = this.getPublicClient();
      let query = supabase
        .from("comments")
        .select("*, profiles(username, avatar_url)")
        .order("created_at", { ascending: true });

      if (postId) {
        query = query.eq("post_id", postId);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) {
        devError('Error fetching comments:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in findByPostId:', error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url)")
        .eq("id", id)
        .single();
      if (error) {
        devError('Error fetching comment by id:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      throw error;
    }
  }

  async create(comment: Omit<Comment, "id" | "created_at" | "updated_at">) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .insert([comment])
        .select()
        .single();
      if (error) {
        devError('Error creating comment:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in create:', error);
      throw error;
    }
  }

  async update(id: string, comment: Partial<Comment>) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .update(comment)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating comment:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in update:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting comment:', error);
        throw error;
      }
    } catch (error) {
      devError('Unexpected error in delete:', error);
      throw error;
    }
  }

  async approve(id: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .update({ status: "approved" })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error approving comment:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in approve:', error);
      throw error;
    }
  }

  async reject(id: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .update({ status: "rejected" })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error rejecting comment:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in reject:', error);
      throw error;
    }
  }

  async findByStatus(status: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username), posts(title, slug)")
        .eq("status", status)
        .order("created_at", { ascending: false });
      if (error) {
        devError('Error fetching comments by status:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in findByStatus:', error);
      throw error;
    }
  }

  async countByPostId(postId?: string, status?: string) {
    try {
      const supabase = this.getPublicClient();
      let query = supabase.from("comments").select("id", { count: "exact" });

      if (postId) {
        query = query.eq("post_id", postId);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { count, error } = await query;
      if (error) {
        devError('Error fetching comment count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in countByPostId:', error);
      return 0;
    }
  }
}

export const commentsRepository = new CommentsRepository();
