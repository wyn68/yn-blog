"use server";

import { revalidatePath } from "next/cache";
import { createCategory, updateCategory, deleteCategory, createCategoriesBulk } from "@/services/categories";
import { getCategories } from "@/services/categories";
import { generateSlug } from "@/lib/utils";
import { requireEditorOrHigher } from "@/lib/auth";
import { clearCacheByPrefix } from "@/lib/cache-with-log";

export async function handleCreateCategory(formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  await createCategory({
    name,
    slug: slug || generateSlug(name),
    description: description || null,
  });

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  clearCacheByPrefix("categories");
}

export async function handleCreateCategoriesBulk(categories: Array<{ name: string; slug?: string; description?: string }>) {
  await requireEditorOrHigher();

  const existingCategories = await getCategories();
  const existingSlugs = new Set(existingCategories.map((c) => c.slug));
  const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));

  const newCategories: Array<{ name: string; slug: string; description: string | null }> = [];
  const duplicates: string[] = [];
  const invalidNames: string[] = [];

  for (const cat of categories) {
    const trimmedName = cat.name.trim();
    if (!trimmedName) continue;

    if (trimmedName.length > 100) {
      invalidNames.push(trimmedName);
      continue;
    }

    if (existingNames.has(trimmedName.toLowerCase())) {
      duplicates.push(trimmedName);
      continue;
    }

    const slug = cat.slug?.trim() || generateSlug(trimmedName);
    if (existingSlugs.has(slug)) {
      duplicates.push(trimmedName);
      continue;
    }

    newCategories.push({ 
      name: trimmedName, 
      slug, 
      description: cat.description?.trim() || null 
    });
    existingSlugs.add(slug);
    existingNames.add(trimmedName.toLowerCase());
  }

  if (newCategories.length > 0) {
    await createCategoriesBulk(newCategories);
  }

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  clearCacheByPrefix("categories");

  return {
    created: newCategories.length,
    duplicates: duplicates.length,
    invalid: invalidNames.length,
  };
}

export async function handleUpdateCategory(categoryId: string, formData: FormData) {
  await requireEditorOrHigher();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  await updateCategory(categoryId, {
    name,
    slug: slug || generateSlug(name),
    description: description || null,
  });

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  clearCacheByPrefix("categories");
}

export async function handleDeleteCategory(categoryId: string) {
  await requireEditorOrHigher();
  
  await deleteCategory(categoryId);
  
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  clearCacheByPrefix("categories");
}
