import { BaseRepository } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Link } from "@/types";

export class LinksRepository extends BaseRepository {
  constructor() {
    super("links");
  }

  async findAll(): Promise<Link[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) {
        devError('Error fetching links:', error);
        return [];
      }
      return (data as Link[]) || [];
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      return [];
    }
  }

  async findActive(): Promise<Link[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) {
        devError('Error fetching active links:', error);
        return [];
      }
      return (data as Link[]) || [];
    } catch (error) {
      devError('Unexpected error in findActive:', error);
      return [];
    }
  }

  async findById(id: string): Promise<Link | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching link by id:', error);
      }
      return data as Link | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async findByUrl(url: string): Promise<Link | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("url", url)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching link by url:', error);
      }
      return data as Link | null;
    } catch (error) {
      devError('Unexpected error in findByUrl:', error);
      return null;
    }
  }

  async create(link: Omit<Link, "id" | "created_at" | "updated_at">): Promise<Link | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("links")
        .insert([link])
        .select()
        .single();
      if (error) {
        devError('Error creating link:', error);
        return null;
      }
      return data as Link;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async update(id: string, link: Partial<Link>): Promise<Link | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("links")
        .update(link)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating link:', error);
        return null;
      }
      return data as Link;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting link:', error);
        return false;
      }
      return true;
    } catch (error) {
      devError('Unexpected error in delete:', error);
      return false;
    }
  }

  async count(): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      const { count, error } = await supabase
        .from("links")
        .select("id", { count: "exact", head: true });
      if (error) {
        devError('Error counting links:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }

  async findManyPaginated(offset: number, limit: number): Promise<Link[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("sort_order", { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) {
        devError('Error fetching links:', error);
        return [];
      }
      return (data as Link[]) || [];
    } catch (error) {
      devError('Unexpected error in findManyPaginated:', error);
      return [];
    }
  }
}

export const linksRepository = new LinksRepository();