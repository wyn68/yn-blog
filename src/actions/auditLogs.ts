"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile, requireAdmin } from "@/lib/auth";
import { devError, devLog } from "@/lib/dev";

interface CreateAuditLogParams {
  action: string;
  target?: string;
  check_type?: string;
}

/**
 * 内部审计日志记录函数。
 * 仅供其他 admin action 内部调用，不暴露给客户端。
 * 参数格式需严格控制以确保日志可审计性。
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  // 安全校验：action 不能为空，防止无意义日志
  if (!params.action || params.action.trim().length === 0) {
    devError("[AuditLog] Rejected: empty action");
    return;
  }

  // action 和 target 长度限制（防止日志表膨胀）
  const safeAction = params.action.substring(0, 200);
  const safeTarget = params.target?.substring(0, 500) ?? null;
  const safeCheckType = params.check_type?.substring(0, 100) ?? null;

  const adminClient = createAdminClient();

  try {
    let userId: string | null = null;
    let username: string | null = null;
    let role: string | null = null;

    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        userId = profile.user_id;
        username = profile.username;
        role = profile.role;
      }
    } catch {
      // 无法获取用户信息时仍记录日志（匿名操作审计）
    }

    const { error } = await adminClient.from("audit_logs").insert({
      user_id: userId,
      username: username,
      role: role,
      action: safeAction,
      target: safeTarget,
      check_type: safeCheckType,
    });

    if (error) {
      devError("Error creating audit log:", error);
    }
  } catch (err) {
    devError("Failed to create audit log:", err);
  }
}

export async function getAuditLogs(limit = 100, offset = 0) {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data, error } = await adminClient
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    devError("Error fetching audit logs:", err);
    throw err;
  }
}

export async function getUserAuditLogs(userId: string, limit = 50, offset = 0) {
  await requireAdmin();
  
  const adminClient = createAdminClient();
  
  try {
    const { data, error } = await adminClient
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    devError("Error fetching user audit logs:", err);
    throw err;
  }
}
