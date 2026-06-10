"use server";

import { revalidatePath } from "next/cache";
import { updateProfile, checkUsernameAvailable } from "@/services/profile";
import { requireAuth } from "@/lib/auth";
import { authRepository } from "@/repositories/auth-repository";
import { BadRequestError } from "@/lib/errors";
import type { Profile } from "@/types";

export interface CurrentUserData {
  profile: Profile;
  email: string | null;
}

/**
 * 获取当前登录用户的完整 profile + email。
 * 供客户端组件（/profile、/settings）通过 server action 获取数据，
 * 避免客户端直接查询 Supabase。
 */
export async function fetchCurrentProfile(): Promise<CurrentUserData | null> {
  try {
    const profile = await requireAuth();
    const { session } = await authRepository.getSessionWithProfile();
    return {
      profile,
      email: session?.user?.email ?? null,
    };
  } catch {
    return null;
  }
}

const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;
const VALID_PROTOCOLS = /^https?:\/\//i;

function validateUrlProtocol(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) return;
  if (BLOCKED_PROTOCOLS.test(trimmed)) {
    throw new BadRequestError("URL包含不安全的协议");
  }
  if (!VALID_PROTOCOLS.test(trimmed)) {
    throw new BadRequestError("URL必须以 http:// 或 https:// 开头");
  }
}

export async function saveProfile(formData: FormData) {
  const profile = await requireAuth();

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatar_url = formData.get("avatar_url") as string;
  const website = formData.get("website") as string;

  if (!username || username.trim().length === 0) {
    throw new BadRequestError("用户名不能为空");
  }

  if (username.length > 50) {
    throw new BadRequestError("用户名不能超过50个字符");
  }

  const isAvailable = await checkUsernameAvailable(username.trim(), profile.user_id);
  if (!isAvailable) {
    throw new BadRequestError("用户名已被使用");
  }

  // 服务端校验 URL 协议，防止 javascript: 等 XSS 注入
  if (avatar_url?.trim()) {
    validateUrlProtocol(avatar_url);
  }
  if (website?.trim()) {
    validateUrlProtocol(website);
  }

  const result = await updateProfile(profile.user_id, {
    username: username.trim(),
    bio: bio?.trim() || null,
    avatar_url: avatar_url?.trim() || null,
    website: website.trim() || null,
  });

  if (!result.success) {
    throw new BadRequestError(result.error || "更新失败");
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return { success: true };
}
