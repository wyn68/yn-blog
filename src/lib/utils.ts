import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function generateSlug(name: string, maxLength: number = 100): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, maxLength);
}

export function calculateReadingTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = content.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word)).length;
  const chineseTime = Math.ceil(chineseChars / 500);
  const englishTime = Math.ceil(englishWords / 200);
  const totalTime = Math.max(chineseTime + englishTime, 1);
  return totalTime;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined, locale: string = "zh-CN"): string {
  if (!dateString) return "未知日期";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "未知日期";
  if (date.getFullYear() < 1900 || date.getFullYear() > 2100) return "未知日期";
  return date.toLocaleDateString(locale);
}

export function formatDateTime(dateString: string | null | undefined, locale: string = "zh-CN"): string {
  if (!dateString) return "未知日期";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "未知日期";
  if (date.getFullYear() < 1900 || date.getFullYear() > 2100) return "未知日期";
  return date.toLocaleString(locale);
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "未知日期";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "未知日期";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 30) return `${diffDays} 天前`;
  
  return formatDate(dateString);
}