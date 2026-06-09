'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { clearCache } from '@/lib/cache-with-log';
import { requireAdmin } from '@/lib/auth';

export async function revalidatePostsCache() {
  await requireAdmin();
  revalidateTag('posts', 'max');
  clearCache();
}

export async function revalidateCategoriesCache() {
  await requireAdmin();
  revalidateTag('categories', 'max');
  clearCache();
}

export async function revalidateTagsCache() {
  await requireAdmin();
  revalidateTag('tags', 'max');
  clearCache();
}

export async function revalidateSettingsCache() {
  await requireAdmin();
  revalidateTag('settings', 'max');
  clearCache();
}

export async function revalidateAllCache() {
  await requireAdmin();
  revalidateTag('posts', 'max');
  revalidateTag('categories', 'max');
  revalidateTag('tags', 'max');
  revalidateTag('settings', 'max');
  revalidatePath('/', 'page');
  clearCache();
}