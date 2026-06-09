"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { devError, devLog } from "@/lib/dev";

export interface UnverifiedUser {
  id: string;
  email: string;
  created_at: string;
  days_unverified: number;
}

export async function getUnverifiedUsers(): Promise<UnverifiedUser[]> {
  await requireAdmin();
  
  const supabase = createAdminClient();
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    const unverifiedUsers = data.users
      .filter(user => !user.email_confirmed_at)
      .map(user => {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at,
          days_unverified: diffDays,
        };
      })
      .sort((a, b) => b.days_unverified - a.days_unverified);
    
    return unverifiedUsers;
  } catch (err) {
    devError("Error fetching unverified users:", err);
    return [];
  }
}

export async function deleteUnverifiedUser(userId: string): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      throw error;
    }
    
    devLog(`[${new Date().toISOString()}] Deleted unverified user: ${userId}`);
    return { success: true, message: "用户删除成功" };
  } catch (err) {
    devError("Error deleting unverified user:", err);
    return { success: false, message: err instanceof Error ? err.message : "删除失败" };
  }
}

export async function getCleanupLogs(): Promise<{ id: string; deleted_count: number; deleted_user_ids: string[]; cleanup_time: string }[]> {
  await requireAdmin();
  
  const supabase = createAdminClient();
  
  try {
    const { data, error } = await supabase
      .from("user_cleanup_logs")
      .select("*")
      .order("cleanup_time", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err) {
    devError("Error fetching cleanup logs:", err);
    return [];
  }
}

export async function cleanupAllUnverifiedUsers(): Promise<{ deletedCount: number }> {
  await requireAdmin();
  
  const supabase = createAdminClient();
  
  try {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const unverifiedUsers = users.users.filter(user => !user.email_confirmed_at);
    let deletedCount = 0;
    
    for (const user of unverifiedUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (!error) {
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      const deletedIds = unverifiedUsers.map(u => u.id);
      await supabase.rpc("insert_cleanup_log", {
        deleted_count: deletedCount,
        deleted_user_ids: deletedIds,
      });
    }
    
    try {
      await supabase.rpc("cleanup_expired_logs");
    } catch (logError) {
      devError("Error cleaning up expired logs:", logError);
    }
    
    devLog(`[${new Date().toISOString()}] Cleaned up ${deletedCount} unverified users`);
    return { deletedCount };
  } catch (err) {
    devError("Error cleaning up unverified users:", err);
    return { deletedCount: 0 };
  }
}