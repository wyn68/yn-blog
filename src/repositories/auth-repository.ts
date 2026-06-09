import { createClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";
import type { Profile } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SessionInfo {
  session: Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>["data"]["session"];
  profile: Profile | null;
}

export class AuthRepository {
  private getClient(): SupabaseClient {
    return createClient();
  }

  async getSession(): Promise<SessionInfo["session"]> {
    try {
      const supabase = this.getClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      devError('Error getting session:', error);
      return null;
    }
  }

  async getSessionWithProfile(): Promise<SessionInfo> {
    try {
      const supabase = this.getClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { session: null, profile: null };
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) {
        devError('Error fetching profile:', profileError);
        return { session, profile: null };
      }

      return { session, profile: profile as Profile };
    } catch (error) {
      devError('Unexpected error in getSessionWithProfile:', error);
      return { session: null, profile: null };
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          devError('Error fetching profile by user id:', error);
        }
        return null;
      }

      return data as Profile;
    } catch (error) {
      devError('Unexpected error in getProfileByUserId:', error);
      return null;
    }
  }

  /**
   * 通过 profile id（非 user_id）查询用户资料。
   * 用于作者页面等通过 profile id 访问的场景。
   */
  async getProfileById(id: string): Promise<Profile | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          devError('Error fetching profile by id:', error);
        }
        return null;
      }
      return data as Profile;
    } catch (error) {
      devError('Unexpected error in getProfileById:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      const supabase = this.getClient();
      await supabase.auth.signOut();
    } catch (error) {
      devError('Error signing out:', error);
      throw error;
    }
  }

  async signInWithPassword(email: string, password: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    } catch (error) {
      devError('Unexpected error in signInWithPassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async signUp(email: string, password: string) {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      devError('Unexpected error in signUp:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export const authRepository = new AuthRepository();
