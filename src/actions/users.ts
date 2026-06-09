"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/actions/auditLogs";
import { devError, devLog } from "@/lib/dev";

export async function getUserEmails(userIds: string[]) {
  const adminClient = createAdminClient();
  
  try {
    const emailMap = new Map<string, string>();
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });
      
      if (error) {
        devError("Error fetching user emails:", error);
        return new Map<string, string>();
      }
      
      const users = data.users || [];
      for (const user of users) {
        if (user.id && user.email && userIds.includes(user.id)) {
          emailMap.set(user.id, user.email);
        }
      }
      
      if (users.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    return emailMap;
  } catch (err) {
    devError("Error fetching user emails:", err);
    return new Map<string, string>();
  }
}

export async function updateUserRole(profileId: string, role: string) {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  if (role === "admin") {
    throw new Error("不允许将用户设置为管理员");
  }
  
  const validRoles = ["user", "author", "editor"];
  if (!validRoles.includes(role)) {
    throw new Error("无效的角色");
  }
  
  try {
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("id", profileId)
      .single();
    
    if (profileError || !profile) {
      throw new Error("用户不存在");
    }
    
    const updateData: Record<string, string | boolean | null> = { role };
    
    if (role === "user") {
      updateData.role_application_status = null;
      updateData.role_application_notified = false;
    }
    
    const { error } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);
    
    if (error) {
      throw error;
    }
    
    const { error: authError } = await adminClient.auth.admin.updateUserById(profile.user_id, {
      app_metadata: { role },
    });
    
    if (authError) {
      devError("Error updating user app_metadata:", authError);
    }
    
    await createAuditLog({
      action: "update_user_role",
      target: `profile:${profileId},role:${role}`,
      check_type: "user_management",
    });
    
    return { success: true };
  } catch (err) {
    devError("Error updating user role:", err);
    throw err;
  }
}

export async function updateUserInfo(profileId: string, updates: { username?: string; bio?: string; avatar_url?: string; website?: string }) {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", profileId)
      .single();
    
    if (profileError || !profile) {
      throw new Error("用户不存在");
    }
    
    if (profile.role === "admin") {
      throw new Error("不允许修改管理员账户信息");
    }
    
    const { error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", profileId);
    
    if (error) {
      throw error;
    }
    
    await createAuditLog({
      action: "update_user_info",
      target: `profile:${profileId}`,
      check_type: "user_management",
    });
    
    return { success: true };
  } catch (err) {
    devError("Error updating user info:", err);
    throw err;
  }
}

export async function deleteUser(profileId: string) {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("id", profileId)
      .single();
    
    if (profileError || !profile) {
      throw new Error("用户不存在");
    }
    
    // 检查目标用户角色
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", profileId)
      .single();
    
    if (targetProfile?.role === "admin") {
      throw new Error("不允许删除管理员账户");
    }

    // 先删除 profiles 记录（失败则终止，避免产生孤儿 auth user）
    const { error: deleteProfileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (deleteProfileError) {
      devError("Error deleting profile:", deleteProfileError);
      throw new Error("删除用户资料失败");
    }

    // 再删除 Supabase Auth 用户
    const { error: authError } = await adminClient.auth.admin.deleteUser(profile.user_id);

    if (authError) {
      // profiles 已删除但 auth 删除失败：记录错误并尝试恢复 profile
      devError(
        `[CRITICAL] Auth user deletion failed for ${profile.user_id}, profile already deleted. ` +
        `Manual cleanup may be required. Error: ${authError.message}`
      );
      throw new Error(`删除认证用户失败: ${authError.message}`);
    }

    await createAuditLog({
      action: "delete_user",
      target: `profile:${profileId}`,
      check_type: "user_management",
    });

    return { success: true };
  } catch (err) {
    devError("Error deleting user:", err);
    throw err;
  }
}