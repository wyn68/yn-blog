import { cacheWithLog } from "@/lib/cache-with-log";
import { devError } from "@/lib/dev";
import { NotFoundError } from "@/lib/errors";
import { announcementsRepository } from "@/repositories/announcements-repository";
import type { Announcement } from "@/types";

export const getAnnouncements = cacheWithLog(async (params?: {
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}) => {
  try {
    const announcements = await announcementsRepository.findMany(
      { isPublished: params?.isPublished },
      {
        limit: params?.limit,
        offset: params?.offset,
        orderBy: "is_pinned",
        orderDirection: "desc",
      }
    );

    return announcements;
  } catch (error) {
    devError('Unexpected error in getAnnouncements:', error);
    return [];
  }
}, 'announcements.getAnnouncements');

export async function getAnnouncementsWithPagination(
  isPublished?: boolean,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const offset = (page - 1) * pageSize;

    const [announcements, total] = await Promise.all([
      announcementsRepository.findMany(
        { isPublished },
        {
          limit: pageSize,
          offset,
          orderBy: "is_pinned",
          orderDirection: "desc",
        }
      ),
      announcementsRepository.count(isPublished),
    ]);

    return {
      data: announcements,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    devError('Unexpected error in getAnnouncementsWithPagination:', error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

export const getAnnouncementById = cacheWithLog(async (id: string) => {
  const announcement = await announcementsRepository.findById(id);

  if (!announcement) {
    throw new NotFoundError('公告不存在');
  }

  return announcement;
}, 'announcements.getAnnouncementById');

export const getLatestAnnouncement = cacheWithLog(async () => {
  try {
    const announcement = await announcementsRepository.getLatestPublished();
    return announcement;
  } catch (error) {
    devError('Unexpected error in getLatestAnnouncement:', error);
    return null;
  }
}, 'announcements.getLatestAnnouncement');

export async function createAnnouncement(
  announcement: Omit<Announcement, "id" | "created_at" | "updated_at">
) {
  const result = await announcementsRepository.create(announcement);
  if (!result) {
    throw new Error('创建公告失败');
  }
  return result;
}

export async function updateAnnouncement(id: string, announcement: Partial<Announcement>) {
  const result = await announcementsRepository.update(id, announcement);
  if (!result) {
    throw new NotFoundError('公告不存在');
  }
  return result;
}

export async function deleteAnnouncement(id: string) {
  const success = await announcementsRepository.delete(id);
  if (!success) {
    throw new NotFoundError('公告不存在');
  }
}

export async function getAnnouncementCount(isPublished?: boolean) {
  return await announcementsRepository.count(isPublished);
}