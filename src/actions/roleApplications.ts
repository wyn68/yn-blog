"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { devError, devLog } from "@/lib/dev";

export interface RoleApplication {
  id: string;
  user_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleApplicationWithUser extends RoleApplication {
  username: string | null;
  email: string;
}

export async function submitRoleApplication(reason: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return { success: false, error: "请先登录" };
  }
  
  if (!reason || reason.length < 1) {
    return { success: false, error: "申请理由不能为空" };
  }
  
  if (reason.length > 500) {
    return { success: false, error: "申请理由不能超过500字" };
  }
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, role_application_status")
    .eq("user_id", session.user.id)
    .single();
  
  if (profileError || !profile) {
    return { success: false, error: "获取用户信息失败" };
  }
  
  if (profile.role !== "user") {
    return { success: false, error: "只有普通用户才能申请成为作者" };
  }
  
  if (profile.role_application_status === "pending") {
    return { success: false, error: "您已有待处理的申请，请耐心等待审核" };
  }
  
  const adminClient = createAdminClient();
  
  try {
    const { error } = await adminClient
      .from("role_applications")
      .insert({
        user_id: profile.id,
        reason,
        status: "pending",
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    await adminClient
      .from("profiles")
      .update({ role_application_status: "pending", role_application_notified: false })
      .eq("id", profile.id);
    
    return { success: true };
  } catch (err) {
    devError("Error submitting role application:", err);
    return { success: false, error: "提交申请失败，请稍后重试" };
  }
}

export async function getPendingRoleApplications(): Promise<RoleApplicationWithUser[]> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data: applications, error } = await adminClient
      .from("role_applications")
      .select(`
        id,
        user_id,
        reason,
        status,
        reviewed_by,
        review_note,
        created_at,
        updated_at,
        profiles!role_applications_user_id_fkey (username, user_id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) {
      devError("Error fetching role applications:", error);
      return [];
    }
    
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    interface ProfileData {
      username?: string;
      user_id?: string;
    }
    
    const getProfileData = (profiles: unknown): ProfileData | undefined => {
      if (!profiles) return undefined;
      if (Array.isArray(profiles)) return profiles[0];
      return profiles as ProfileData;
    };
    
    if (usersError) {
      devError("Error fetching users:", usersError);
      return applications.map(app => ({
        ...app,
        email: "",
        username: getProfileData(app.profiles)?.username || null,
      }));
    }
    
    const emailMap = new Map(users.users?.map(u => [u.id, u.email]) || []);
    
    return applications.map(app => {
      const profileData = getProfileData(app.profiles);
      return {
        ...app,
        email: profileData?.user_id ? emailMap.get(profileData.user_id) || "" : "",
        username: profileData?.username || null,
      };
    });
  } catch (err) {
    devError("Error fetching role applications:", err);
    return [];
  }
}

export async function getRoleApplicationCount(): Promise<number> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { count, error } = await adminClient
      .from("role_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    
    if (error) {
      devError("Error counting role applications:", error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    devError("Error counting role applications:", err);
    return 0;
  }
}

export async function handleRoleApplication(
  applicationId: string,
  action: "approve" | "reject",
  reviewNote?: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data: application, error: fetchError } = await adminClient
      .from("role_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();
    
    if (fetchError || !application) {
      return { success: false, error: "申请不存在" };
    }
    
    const status = action === "approve" ? "approved" : "rejected";
    
    const { error: updateError } = await adminClient
      .from("role_applications")
      .update({
        status,
        review_note: reviewNote || null,
        reviewed_by: null,
      })
      .eq("id", applicationId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    if (action === "approve") {
      const { error: roleError } = await adminClient
        .from("profiles")
        .update({ role: "author" })
        .eq("id", application.user_id);
      
      if (roleError) {
        devError("Error updating user role:", roleError);
      }
    }
    
    await adminClient
      .from("profiles")
      .update({ 
        role_application_status: status, 
        role_application_notified: false 
      })
      .eq("id", application.user_id);
    
    return { success: true };
  } catch (err) {
    devError("Error handling role application:", err);
    return { success: false, error: "处理申请失败，请稍后重试" };
  }
}

export async function getUserRoleApplicationStatus(userId: string): Promise<{
  status: "pending" | "approved" | "rejected" | null;
  notified: boolean;
}> {
  const adminClient = createAdminClient();
  
  try {
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("role_application_status, role_application_notified")
      .eq("user_id", userId)
      .single();
    
    if (error || !profile) {
      return { status: null, notified: true };
    }
    
    return {
      status: profile.role_application_status || null,
      notified: profile.role_application_notified || false,
    };
  } catch (err) {
    devError("Error fetching role application status:", err);
    return { status: null, notified: true };
  }
}

export async function markRoleApplicationNotified(userId: string): Promise<void> {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    await adminClient
      .from("profiles")
      .update({ role_application_notified: true })
      .eq("user_id", userId);
  } catch (err) {
    devError("Error marking role application as notified:", err);
  }
}