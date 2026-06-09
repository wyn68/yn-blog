import { cacheWithLog } from "@/lib/cache-with-log";
import { linksRepository } from "@/repositories/links-repository";
import type { Link } from "@/types";

export const getLinks = cacheWithLog(async () => {
  return await linksRepository.findActive();
}, 'links.getLinks');

export const getAllLinks = cacheWithLog(async () => {
  return await linksRepository.findAll();
}, 'links.getAllLinks');

export const getLinkById = cacheWithLog(async (id: string) => {
  const link = await linksRepository.findById(id);
  if (!link) {
    throw new Error(`Link not found: ${id}`);
  }
  return link;
}, 'links.getLinkById');

export async function createLink(link: Omit<Link, "id" | "created_at" | "updated_at">) {
  const result = await linksRepository.create(link);
  if (!result) {
    throw new Error('Failed to create link');
  }
  return result;
}

export async function updateLink(id: string, link: Partial<Link>) {
  const result = await linksRepository.update(id, link);
  if (!result) {
    throw new Error(`Failed to update link: ${id}`);
  }
  return result;
}

export async function deleteLink(id: string) {
  const success = await linksRepository.delete(id);
  if (!success) {
    throw new Error(`Failed to delete link: ${id}`);
  }
}

export async function getLinksPaginated(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  const [links, total] = await Promise.all([
    linksRepository.findManyPaginated(offset, pageSize),
    linksRepository.count(),
  ]);
  
  return {
    data: links,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}