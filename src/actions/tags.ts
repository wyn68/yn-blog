"use server";

import { revalidatePath } from "next/cache";
import { createTag, updateTag, deleteTag, createTagsBulk } from "@/services/tags";
import { getTags } from "@/services/tags";
import { generateSlug } from "@/lib/utils";
import { requireEditorOrHigher } from "@/lib/auth";
import { clearCacheByPrefix } from "@/lib/cache-with-log";

export async function handleCreateTag(formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  await createTag({
    name,
    slug: slug || generateSlug(name, 50),
  });

  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  clearCacheByPrefix("tags");
}

export async function handleCreateTagsBulk(tags: Array<{ name: string; slug?: string }>) {
  await requireEditorOrHigher();

  const existingTags = await getTags();
  const existingSlugs = new Set(existingTags.map((t) => t.slug));
  const existingNames = new Set(existingTags.map((t) => t.name.toLowerCase()));

  const newTags: Array<{ name: string; slug: string }> = [];
  const duplicates: string[] = [];
  const invalidNames: string[] = [];

  for (const tag of tags) {
    const trimmedName = tag.name.trim();
    if (!trimmedName) continue;

    if (trimmedName.length > 50) {
      invalidNames.push(trimmedName);
      continue;
    }

    if (existingNames.has(trimmedName.toLowerCase())) {
      duplicates.push(trimmedName);
      continue;
    }

    const slug = tag.slug?.trim() || generateSlug(trimmedName, 50);
    if (existingSlugs.has(slug)) {
      duplicates.push(trimmedName);
      continue;
    }

    newTags.push({ name: trimmedName, slug });
    existingSlugs.add(slug);
    existingNames.add(trimmedName.toLowerCase());
  }

  if (newTags.length > 0) {
    await createTagsBulk(newTags);
  }

  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  clearCacheByPrefix("tags");

  return {
    created: newTags.length,
    duplicates: duplicates.length,
    invalid: invalidNames.length,
  };
}

export async function handleUpdateTag(tagId: string, formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  await updateTag(tagId, {
    name,
    slug: slug || generateSlug(name, 50),
  });

  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  clearCacheByPrefix("tags");
}

export async function handleDeleteTag(tagId: string) {
  await requireEditorOrHigher();
  
  await deleteTag(tagId);
  
  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  clearCacheByPrefix("tags");
}
