/* eslint-disable @typescript-eslint/no-explicit-any */
import { emailWhitelistRepository } from "@/repositories/email-whitelist-repository";
import { validateEmail, EmailValidationResult } from "@/lib/email-validation";

export interface EmailDomain {
  id: string;
  domain: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getWhitelistedDomains(): Promise<string[]> {
  return await emailWhitelistRepository.findActiveDomains();
}

export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  const basicValidation = validateEmail(email);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const whitelist = await getWhitelistedDomains();
  
  if (whitelist.length === 0) {
    return { valid: true, message: "" };
  }
  
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!whitelist.includes(domain)) {
    return { valid: false, message: `邮箱域名不在允许列表中。支持的邮箱包括：${whitelist.join('、')}` };
  }
  
  return { valid: true, message: "" };
}

export async function getAllDomains(): Promise<EmailDomain[]> {
  const domains = await emailWhitelistRepository.findAll();
  return domains as EmailDomain[];
}

export async function addDomain(domain: string, description?: string) {
  return await emailWhitelistRepository.create(domain, description);
}

export async function updateDomain(id: string, updates: Partial<EmailDomain>) {
  return await emailWhitelistRepository.update(id, updates as unknown as { [key: string]: any });
}

export async function deleteDomain(id: string) {
  await emailWhitelistRepository.delete(id);
}
