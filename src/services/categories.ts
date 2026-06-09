import { cacheWithLog } from "@/lib/cache-with-log";
import { categoriesRepository } from "@/repositories/categories-repository";
import type { Category } from "@/types";

export const getCategories = cacheWithLog(async () => {
  return await categoriesRepository.findAll();
}, 'categories.getCategories');

export const getCategoryBySlug = cacheWithLog(async (slug: string) => {
  const category = await categoriesRepository.findBySlug(slug);
  if (!category) {
    throw new Error(`Category not found: ${slug}`);
  }
  return category;
}, 'categories.getCategoryBySlug');

export const getCategoryById = cacheWithLog(async (id: string) => {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new Error(`Category not found: ${id}`);
  }
  return category;
}, 'categories.getCategoryById');

export async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">) {
  const result = await categoriesRepository.create(category);
  if (!result) {
    throw new Error('Failed to create category');
  }
  return result;
}

export async function createCategoriesBulk(categories: Omit<Category, "id" | "created_at" | "updated_at">[]) {
  const result = await categoriesRepository.createBulk(categories);
  if (!result) {
    throw new Error('Failed to create categories');
  }
  return result;
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const result = await categoriesRepository.update(id, category);
  if (!result) {
    throw new Error(`Failed to update category: ${id}`);
  }
  return result;
}

export async function deleteCategory(id: string) {
  const success = await categoriesRepository.delete(id);
  if (!success) {
    throw new Error(`Failed to delete category: ${id}`);
  }
}

export const getCategoriesWithPostCount = cacheWithLog(async () => {
  return await categoriesRepository.findAllWithPostCount();
}, 'categories.getCategoriesWithPostCount');

export async function getCategoriesWithPostCountPaginated(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  const [categories, total] = await Promise.all([
    categoriesRepository.findManyWithPostCount(offset, pageSize),
    categoriesRepository.count(),
  ]);
  
  return {
    data: categories,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
