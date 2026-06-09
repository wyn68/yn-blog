import { cacheWithLog } from "@/lib/cache-with-log";
import { linkApplicationsRepository } from "@/repositories/link-applications-repository";
import { linksRepository } from "@/repositories/links-repository";
import { createClient } from "@/lib/supabase";
import type { LinkApplication } from "@/types";

export async function getAllLinkApplicationsUncached(): Promise<LinkApplication[]> {
  return await linkApplicationsRepository.findAll();
}

export const getAllLinkApplications = cacheWithLog(async () => {
  return await linkApplicationsRepository.findAll();
}, 'linkApplications.getAll');

export const getPendingLinkApplications = cacheWithLog(async () => {
  return await linkApplicationsRepository.findPending();
}, 'linkApplications.getPending');

export const getLinkApplicationById = cacheWithLog(async (id: string) => {
  const application = await linkApplicationsRepository.findById(id);
  if (!application) {
    throw new Error(`Link application not found: ${id}`);
  }
  return application;
}, 'linkApplications.getById');

export async function createLinkApplication(application: Omit<LinkApplication, "id" | "created_at" | "updated_at">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("link_applications")
    .insert([application])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating link application:', error);
    throw new Error('Failed to create link application');
  }
  
  return data as LinkApplication;
}

export async function getLinkApplicationByIdUncached(id: string): Promise<LinkApplication | null> {
  return await linkApplicationsRepository.findById(id);
}

export async function approveLinkApplication(id: string, reviewedBy: string, reviewNote?: string): Promise<LinkApplication> {
  const application = await linkApplicationsRepository.findById(id);
  if (!application) {
    throw new Error(`Link application not found: ${id}`);
  }

  if (application.status !== 'pending' && application.status !== 'rejected') {
    throw new Error(`Cannot approve application with status: ${application.status}`);
  }

  const existingLink = await linksRepository.findByUrl(application.url);
  if (existingLink) {
    throw new Error(`A link with URL "${application.url}" already exists`);
  }

  await linkApplicationsRepository.delete(id);

  return {
    ...application,
    status: 'approved',
    reviewed_by: reviewedBy,
    review_note: reviewNote || null,
  };
}

export async function rejectLinkApplication(id: string, reviewedBy: string, reviewNote?: string) {
  const result = await linkApplicationsRepository.update(id, {
    status: 'rejected',
    reviewed_by: reviewedBy,
    review_note: reviewNote || null,
  });
  if (!result) {
    throw new Error(`Failed to reject link application: ${id}`);
  }
  return result;
}

export async function deleteLinkApplication(id: string) {
  const success = await linkApplicationsRepository.delete(id);
  if (!success) {
    throw new Error(`Failed to delete link application: ${id}`);
  }
}

export async function getLinkApplicationStats() {
  const [total, pending, approved, rejected] = await Promise.all([
    linkApplicationsRepository.count(),
    linkApplicationsRepository.countByStatus('pending'),
    linkApplicationsRepository.countByStatus('approved'),
    linkApplicationsRepository.countByStatus('rejected'),
  ]);
  
  return {
    total,
    pending,
    approved,
    rejected,
  };
}