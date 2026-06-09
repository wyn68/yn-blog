import { cacheWithLog } from "@/lib/cache-with-log";
import { tagsRepository } from "@/repositories/tags-repository";
import type { Tag } from "@/types";

export const getTags = cacheWithLog(async () => {
  return await tagsRepository.findAll();
}, 'tags.getTags');

export const getTagBySlug = cacheWithLog(async (slug: string) => {
  const tag = await tagsRepository.findBySlug(slug);
  if (!tag) {
    throw new Error(`Tag not found: ${slug}`);
  }
  return tag;
}, 'tags.getTagBySlug');

export const getTagById = cacheWithLog(async (id: string) => {
  const tag = await tagsRepository.findById(id);
  if (!tag) {
    throw new Error(`Tag not found: ${id}`);
  }
  return tag;
}, 'tags.getTagById');

export async function createTag(tag: Omit<Tag, "id" | "created_at" | "updated_at">) {
  const result = await tagsRepository.create(tag);
  if (!result) {
    throw new Error('Failed to create tag');
  }
  return result;
}

export async function createTagsBulk(tags: Omit<Tag, "id" | "created_at" | "updated_at">[]) {
  const result = await tagsRepository.createBulk(tags);
  if (!result) {
    throw new Error('Failed to create tags');
  }
  return result;
}

export async function updateTag(id: string, tag: Partial<Tag>) {
  const result = await tagsRepository.update(id, tag);
  if (!result) {
    throw new Error(`Failed to update tag: ${id}`);
  }
  return result;
}

export async function deleteTag(id: string) {
  const success = await tagsRepository.delete(id);
  if (!success) {
    throw new Error(`Failed to delete tag: ${id}`);
  }
}

export const getTagsWithPostCount = cacheWithLog(async () => {
  return await tagsRepository.findAllWithPostCount();
}, 'tags.getTagsWithPostCount');

export async function getTagsWithPostCountPaginated(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  const [tags, total] = await Promise.all([
    tagsRepository.findManyWithPostCount(offset, pageSize),
    tagsRepository.count(),
  ]);
  
  return {
    data: tags,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export const getPostTags = cacheWithLog(async (postId: string) => {
  return await tagsRepository.getPostTags(postId);
}, 'tags.getPostTags');

export async function addPostTags(postId: string, tagIds: string[]) {
  const existingTags = await getPostTags(postId);
  const newTags = tagIds.filter((id) => !existingTags.includes(id));
  
  if (newTags.length === 0) return;
  
  await tagsRepository.addPostTags(postId, newTags);
}

export async function removePostTags(postId: string, tagIds: string[]) {
  await tagsRepository.removePostTags(postId, tagIds);
}

export async function syncPostTags(postId: string, tagIds: string[]) {
  const existingTags = await getPostTags(postId);
  
  const toAdd = tagIds.filter((id) => !existingTags.includes(id));
  const toRemove = existingTags.filter((id) => !tagIds.includes(id));
  
  if (toRemove.length > 0) {
    await removePostTags(postId, toRemove);
  }
  if (toAdd.length > 0) {
    await addPostTags(postId, toAdd);
  }
}
