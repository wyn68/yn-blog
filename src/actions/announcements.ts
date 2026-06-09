"use server";

import { revalidatePath } from "next/cache";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/services/announcements";
import { requireAdmin } from "@/lib/auth";
import { BadRequestError } from "@/lib/errors";
import { clearCacheByPrefix } from "@/lib/cache-with-log";

export async function handleCreateAnnouncement(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const isPublished = formData.get("is_published") === "on";
  const isPinned = formData.get("is_pinned") === "on";

  if (!title || !content) {
    throw new BadRequestError("标题和内容不能为空");
  }

  await createAnnouncement({
    title,
    content,
    excerpt: excerpt || content.substring(0, 150),
    is_published: isPublished,
    is_pinned: isPinned,
  });

  clearCacheByPrefix('announcements');
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}

export async function handleUpdateAnnouncement(announcementId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const isPublished = formData.get("is_published") === "on";
  const isPinned = formData.get("is_pinned") === "on";

  if (!title || !content) {
    throw new BadRequestError("标题和内容不能为空");
  }

  await updateAnnouncement(announcementId, {
    title,
    content,
    excerpt: excerpt || content.substring(0, 150),
    is_published: isPublished,
    is_pinned: isPinned,
  });

  clearCacheByPrefix('announcements');
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}

export async function handleDeleteAnnouncement(announcementId: string) {
  await requireAdmin();

  await deleteAnnouncement(announcementId);

  clearCacheByPrefix('announcements');
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}