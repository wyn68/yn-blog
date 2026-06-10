import { createClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";
import type { Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) {
    devError('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

export async function updateProfile(
  userId: string,
  updates: { username?: string; bio?: string | null; avatar_url?: string | null; website?: string | null }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  
  if (!existingProfile) {
    return { success: false, error: "Profile not found" };
  }
  
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId);
  
  if (error) {
    devError('Error updating profile:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient();
  
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username);
  
  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    devError('Error checking username:', error);
    return false;
  }
  
  return data.length === 0;
}
