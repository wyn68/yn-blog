"use server";

import { createPublicClient } from "@/lib/supabase";
import { validateEmail, EmailValidationResult } from "@/lib/email-validation";
import { devError, devLog } from "@/lib/dev";

/**
 * 服务端邮箱域名验证（用于注册时校验白名单）。
 * 使用 public client，不暴露 Service Role Key。
 * email_whitelist 表需要配置 RLS 允许公开读取 is_active=true 的域名。
 */
export async function validateEmailDomainServer(email: string): Promise<EmailValidationResult> {
  const basicValidation = validateEmail(email);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // 使用 public client 读取（依赖 RLS 策略允许公开读取白名单）
  const supabase = createPublicClient();

  try {
    const { data, error } = await supabase
      .from("email_whitelist")
      .select("domain")
      .eq("is_active", true);

    if (error) {
      devError("Error checking email whitelist:", error);
      return { valid: false, message: "邮箱验证服务暂时不可用，请稍后再试" };
    }

    const domain = email.trim().toLowerCase().split("@")[1];
    if (!domain) {
      return { valid: false, message: "邮箱格式无效" };
    }

    const allowedDomains = data?.map((d: { domain: string }) => d.domain.toLowerCase()) || [];

    if (allowedDomains.length === 0) {
      return { valid: true, message: "" };
    }

    if (!allowedDomains.includes(domain)) {
      return {
        valid: false,
        message: `邮箱域名不在允许列表中。支持的邮箱包括：${allowedDomains.join('、')}`
      };
    }

    return { valid: true, message: "" };
  } catch (err) {
    devError("Error validating email domain:", err);
    return { valid: false, message: "邮箱验证服务暂时不可用，请稍后再试" };
  }
}