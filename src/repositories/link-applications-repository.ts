import { BaseRepository } from "./base-repository";
import { devError } from "@/lib/dev";
import type { LinkApplication } from "@/types";

export class LinkApplicationsRepository extends BaseRepository {
  constructor() {
    super("link_applications");
  }

  async findAll(): Promise<LinkApplication[]> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("link_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        devError('Error fetching link applications:', error);
        return [];
      }
      return (data as LinkApplication[]) || [];
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      return [];
    }
  }

  async findPending(): Promise<LinkApplication[]> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("link_applications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) {
        devError('Error fetching pending link applications:', error);
        return [];
      }
      return (data as LinkApplication[]) || [];
    } catch (error) {
      devError('Unexpected error in findPending:', error);
      return [];
    }
  }

  async findById(id: string): Promise<LinkApplication | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("link_applications")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching link application by id:', error);
      }
      return data as LinkApplication | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async create(application: Omit<LinkApplication, "id" | "created_at" | "updated_at">): Promise<LinkApplication | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("link_applications")
        .insert([application])
        .select()
        .single();
      if (error) {
        devError('Error creating link application:', error);
        return null;
      }
      return data as LinkApplication;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async update(id: string, application: Partial<LinkApplication>): Promise<LinkApplication | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("link_applications")
        .update(application)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating link application:', error);
        return null;
      }
      return data as LinkApplication;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("link_applications")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting link application:', error);
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
      const supabase = this.getClient();
      const { count, error } = await supabase
        .from("link_applications")
        .select("id", { count: "exact", head: true });
      if (error) {
        devError('Error counting link applications:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }

  async countByStatus(status: string): Promise<number> {
    try {
      const supabase = this.getClient();
      const { count, error } = await supabase
        .from("link_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) {
        devError('Error counting link applications by status:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in countByStatus:', error);
      return 0;
    }
  }
}

export const linkApplicationsRepository = new LinkApplicationsRepository();