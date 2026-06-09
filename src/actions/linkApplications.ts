"use server";

import { revalidatePath } from "next/cache";
import { createLinkApplication, approveLinkApplication, rejectLinkApplication, deleteLinkApplication } from "@/services/linkApplications";
import { createLink } from "@/services/links";
import { requireAuth, requireEditorOrHigher, getCurrentUserProfile } from "@/lib/auth";
import { clearCacheByPrefix } from "@/lib/cache-with-log";

/** 禁止的 URL 协议，防止恶意链接注入 */
const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;

/** 有效的 URL 协议 */
const VALID_PROTOCOLS = /^https?:\/\//i;

function validateUrl(url: string): string {
  const trimmed = url.trim();
  
  if (!trimmed) {
    throw new Error("网站地址不能为空");
  }
  
  // 检测禁止的协议
  if (BLOCKED_PROTOCOLS.test(trimmed)) {
    throw new Error("网站地址包含不安全的协议");
  }
  
  // 确保以 http:// 或 https:// 开头
  if (!VALID_PROTOCOLS.test(trimmed)) {
    throw new Error("网站地址必须以 http:// 或 https:// 开头");
  }
  
  // 防止过长的 URL（可能用于 DoS 或缓冲区溢出）
  if (trimmed.length > 2048) {
    throw new Error("网站地址过长");
  }
  
  return trimmed;
}

export async function handleCreateLinkApplication(formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string | null;
  const avatar = formData.get("avatar") as string | null;
  const applicant_name = formData.get("applicant_name") as string | null;
  const applicant_email = formData.get("applicant_email") as string | null;

  if (!name || !name.trim()) {
    throw new Error("网站名称不能为空");
  }

  const validatedUrl = validateUrl(url);

  await createLinkApplication({
    name: name.trim(),
    url: validatedUrl,
    description: description?.trim() || null,
    avatar: avatar?.trim() || null,
    applicant_name: applicant_name?.trim() || null,
    applicant_email: applicant_email?.trim() || null,
    status: "pending",
    reviewed_by: null,
    review_note: null,
  });

  revalidatePath("/links");
  revalidatePath("/admin/link-applications");
  clearCacheByPrefix("linkApplications");
}

export async function handleApproveLinkApplication(applicationId: string) {
  await requireEditorOrHigher();

  const profile = await getCurrentUserProfile();
  const reviewerId = profile!.id;

  const result = await approveLinkApplication(applicationId, reviewerId);

  await createLink({
    name: result.name,
    url: result.url,
    description: result.description,
    avatar: result.avatar,
    is_active: true,
    sort_order: 0,
  });

  revalidatePath("/links");
  revalidatePath("/admin/links");
  revalidatePath("/admin/link-applications");
  clearCacheByPrefix("links");
  clearCacheByPrefix("linkApplications");
}

export async function handleRejectLinkApplication(applicationId: string, reviewNote?: string) {
  await requireEditorOrHigher();

  const profile = await getCurrentUserProfile();
  const reviewerId = profile!.id;

  await rejectLinkApplication(applicationId, reviewerId, reviewNote);

  revalidatePath("/admin/link-applications");
  clearCacheByPrefix("linkApplications");
}

export async function handleDeleteLinkApplication(applicationId: string) {
  await requireEditorOrHigher();

  await deleteLinkApplication(applicationId);

  revalidatePath("/admin/link-applications");
  clearCacheByPrefix("linkApplications");
}