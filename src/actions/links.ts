"use server";

import { revalidatePath } from "next/cache";
import { createLink, updateLink, deleteLink } from "@/services/links";
import { requireEditorOrHigher } from "@/lib/auth";
import { clearCacheByPrefix } from "@/lib/cache-with-log";

export async function handleCreateLink(formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string | null;
  const avatar = formData.get("avatar") as string | null;
  const is_active = formData.get("is_active") === "on";
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  await createLink({
    name,
    url,
    description: description || null,
    avatar: avatar || null,
    is_active,
    sort_order,
  });

  revalidatePath("/links");
  revalidatePath("/admin/links");
  clearCacheByPrefix("links");
}

export async function handleUpdateLink(linkId: string, formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string | null;
  const avatar = formData.get("avatar") as string | null;
  const is_active = formData.get("is_active") === "on";
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  await updateLink(linkId, {
    name,
    url,
    description: description || null,
    avatar: avatar || null,
    is_active,
    sort_order,
  });

  revalidatePath("/links");
  revalidatePath("/admin/links");
  clearCacheByPrefix("links");
}

export async function handleDeleteLink(linkId: string) {
  await requireEditorOrHigher();
  
  await deleteLink(linkId);
  
  revalidatePath("/links");
  revalidatePath("/admin/links");
  clearCacheByPrefix("links");
}