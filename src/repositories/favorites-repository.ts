import { BaseRepository } from "./base-repository";
import { createClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";

export interface Favorite {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FavoriteWithPost extends Favorite {
  posts?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    created_at: string;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export class FavoritesRepository extends BaseRepository {
  constructor() {
    super("favorites");
  }

  async add(postId: string, userId: string): Promise<Favorite | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .insert([{ post_id: postId, user_id: userId }])
        .select()
        .single();
      
      if (error) {
        devError('Error adding favorite:', error);
        throw error;
      }
      
      return data as Favorite;
    } catch (error) {
      devError('Unexpected error in add:', error);
      throw error;
    }
  }

  async remove(postId: string, userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      
      if (error) {
        devError('Error removing favorite:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      devError('Unexpected error in remove:', error);
      throw error;
    }
  }

  async check(postId: string, userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        return false;
      }
      
      if (error) {
        devError('Error checking favorite:', error);
        throw error;
      }
      
      return !!data;
    } catch (error) {
      devError('Unexpected error in check:', error);
      return false;
    }
  }

  async findByUser(userId: string): Promise<FavoriteWithPost[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          post_id,
          posts(*, categories(name, slug))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        devError('Error fetching user favorites:', error);
        throw error;
      }
      
      return (data as unknown as FavoriteWithPost[]) || [];
    } catch (error) {
      devError('Unexpected error in findByUser:', error);
      return [];
    }
  }

  async countByUser(userId: string): Promise<number> {
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      
      if (error) {
        devError('Error counting user favorites:', error);
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      devError('Unexpected error in countByUser:', error);
      return 0;
    }
  }
}

export const favoritesRepository = new FavoritesRepository();
