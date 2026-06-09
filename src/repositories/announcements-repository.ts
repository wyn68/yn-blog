import { BaseRepository, QueryOptions } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Announcement } from "@/types";

export class AnnouncementsRepository extends BaseRepository {
  constructor() {
    super("announcements");
  }

  async findMany(
    params?: { isPublished?: boolean },
    options?: QueryOptions
  ): Promise<Announcement[]> {
    try {
      const supabase = this.getPublicClient();
      let query = supabase.from("announcements").select("*");

      if (params?.isPublished !== undefined) {
        query = query.eq("is_published", params.isPublished);
      }

      const orderBy = options?.orderBy || "is_pinned";
      const orderDirection = options?.orderDirection || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });
      query = query.order("created_at", { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data: announcements, error } = await query;
      if (error) {
        devError('Error fetching announcements:', error);
        return [];
      }

      return announcements as Announcement[];
    } catch (error) {
      devError('Unexpected error in findMany:', error);
      return [];
    }
  }

  async findById(id: string): Promise<Announcement | null> {
    try {
      const supabase = this.getPublicClient();
      const { data: announcement, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching announcement by id:', error);
      }
      return announcement as Announcement | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async create(
    announcement: Omit<Announcement, "id" | "created_at" | "updated_at">
  ): Promise<Announcement | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("announcements")
        .insert([announcement])
        .select()
        .single();
      if (error) {
        devError('Error creating announcement:', error);
        return null;
      }
      return data as Announcement;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async update(id: string, announcement: Partial<Announcement>): Promise<Announcement | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("announcements")
        .update(announcement)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating announcement:', error);
        return null;
      }
      return data as Announcement;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting announcement:', error);
        return false;
      }
      return true;
    } catch (error) {
      devError('Unexpected error in delete:', error);
      return false;
    }
  }

  async count(isPublished?: boolean): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      let query = supabase.from("announcements").select("id", { count: "exact", head: true });
      if (isPublished !== undefined) {
        query = query.eq("is_published", isPublished);
      }
      const { count, error } = await query;
      if (error) {
        devError('Error fetching announcement count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }

  async getLatestPublished(): Promise<Announcement | null> {
    try {
      const supabase = this.getPublicClient();
      const { data: announcements, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) {
        devError('Error fetching latest announcement:', error);
        return null;
      }
      return announcements?.[0] || null;
    } catch (error) {
      devError('Unexpected error in getLatestPublished:', error);
      return null;
    }
  }
}

export const announcementsRepository = new AnnouncementsRepository();