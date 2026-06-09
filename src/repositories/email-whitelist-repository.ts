import { BaseRepository } from "./base-repository";
import { createClient, createPublicClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";

export interface EmailDomain {
  id: string;
  domain: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class EmailWhitelistRepository extends BaseRepository {
  constructor() {
    super("email_whitelist");
  }

  async findActiveDomains(): Promise<string[]> {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("email_whitelist")
        .select("domain")
        .eq("is_active", true);
      
      if (error) {
        devError('Error fetching active domains:', error);
        throw error;
      }
      
      return data?.map((item: { domain: string }) => item.domain.toLowerCase()) || [];
    } catch (error) {
      devError('Unexpected error in findActiveDomains:', error);
      return [];
    }
  }

  async findAll(): Promise<EmailDomain[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("email_whitelist")
        .select("*")
        .order("domain", { ascending: true });
      
      if (error) {
        devError('Error fetching all domains:', error);
        throw error;
      }
      
      return data as EmailDomain[];
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      return [];
    }
  }

  async create(domain: string, description?: string): Promise<EmailDomain | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("email_whitelist")
        .insert([{ domain: domain.toLowerCase().trim(), description }])
        .select()
        .single();
      
      if (error) {
        devError('Error creating domain:', error);
        throw error;
      }
      
      return data as EmailDomain;
    } catch (error) {
      devError('Unexpected error in create:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<EmailDomain>): Promise<EmailDomain | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("email_whitelist")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        devError('Error updating domain:', error);
        throw error;
      }
      
      return data as EmailDomain;
    } catch (error) {
      devError('Unexpected error in update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("email_whitelist")
        .delete()
        .eq("id", id);
      
      if (error) {
        devError('Error deleting domain:', error);
        throw error;
      }
    } catch (error) {
      devError('Unexpected error in delete:', error);
      throw error;
    }
  }

  async checkDomainExists(domain: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("email_whitelist")
        .select("id")
        .eq("domain", domain.toLowerCase().trim())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        devError('Error checking domain exists:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      devError('Unexpected error in checkDomainExists:', error);
      return false;
    }
  }
}

export const emailWhitelistRepository = new EmailWhitelistRepository();
