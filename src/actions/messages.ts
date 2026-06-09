"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { devError, devLog } from "@/lib/dev";

export interface Message {
  id: string;
  user_id: string;
  content: string;
  status: "unread" | "read";
  created_at: string;
  updated_at: string;
}

export interface MessageWithUser extends Message {
  username: string | null;
  email: string;
}

export async function submitMessage(content: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { success: false, error: "请先登录" };
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { success: false, error: "请先登录" };
  }

  if (!content || content.trim().length < 1) {
    return { success: false, error: "留言内容不能为空" };
  }

  if (content.length > 2000) {
    return { success: false, error: "留言内容不能超过2000字" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "获取用户信息失败" };
  }

  try {
    const sanitizedContent = sanitizeHtml(content.trim());
    // 使用普通 client（携带用户 JWT），依赖 RLS 策略确保用户只能创建自己的留言
    const { error } = await supabase
      .from("messages")
      .insert({
        user_id: profile.id,
        content: sanitizedContent,
        status: "unread",
      });

    if (error) {
      devError("Error inserting message:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    devError("Error submitting message:", err);
    return { success: false, error: "提交留言失败，请稍后重试" };
  }
}

export async function getMessages(): Promise<MessageWithUser[]> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data: messages, error } = await adminClient
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      devError("Error fetching messages:", error);
      return [];
    }
    
    if (!messages || messages.length === 0) {
      return [];
    }
    
    const { data: users } = await adminClient.auth.admin.listUsers();
    const emailMap = new Map(users?.users?.map(u => [u.id, u.email]) || []);
    
    const userIds = messages.map(m => m.user_id);
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, user_id")
      .in("id", userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    return messages.map(msg => {
      const profile = profileMap.get(msg.user_id);
      return {
        ...msg,
        username: profile?.username || null,
        email: profile?.user_id ? emailMap.get(profile.user_id) || "" : "",
      };
    });
  } catch (err) {
    devError("Error fetching messages:", err);
    return [];
  }
}

export async function getUnreadMessageCount(): Promise<number> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return 0;
  }
  
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    return 0;
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();
  
  if (!profile || profile.role !== "admin") {
    return 0;
  }
  
  const adminClient = createAdminClient();
  
  try {
    const { count, error } = await adminClient
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "unread");
    
    if (error) {
      devError("Error counting unread messages:", error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    devError("Error counting unread messages:", err);
    return 0;
  }
}

export async function markMessageAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { error } = await adminClient
      .from("messages")
      .update({ status: "read" })
      .eq("id", messageId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    devError("Error marking message as read:", err);
    return { success: false, error: "操作失败，请稍后重试" };
  }
}

export async function deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { error } = await adminClient
      .from("messages")
      .delete()
      .eq("id", messageId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    devError("Error deleting message:", err);
    return { success: false, error: "删除失败，请稍后重试" };
  }
}

export async function deleteMessages(messageIds: string[]): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { error } = await adminClient
      .from("messages")
      .delete()
      .in("id", messageIds);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    devError("Error deleting messages:", err);
    return { success: false, error: "批量删除失败，请稍后重试" };
  }
}