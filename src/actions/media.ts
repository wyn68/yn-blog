"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadFile, uploadCompressedFile, deleteMediaFile } from "@/services/media";
import { requireEditorOrHigher } from "@/lib/auth";
import { authRepository } from "@/repositories/auth-repository";
import { redisUploadRateLimiter, redisDeleteMediaRateLimiter } from "@/lib/redis-rate-limiter";
import { MEDIA_CONSTANTS } from "@/constants";

const { MAX_FILE_SIZE, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, DEFAULT_QUALITY } = MEDIA_CONSTANTS;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

async function compressImage(file: File): Promise<{ buffer: Buffer; contentType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const metadata = await sharp(buffer).metadata();

  const pipeline = sharp(buffer)
    .resize({
      width: Math.min(metadata.width || MAX_IMAGE_WIDTH, MAX_IMAGE_WIDTH),
      height: Math.min(metadata.height || MAX_IMAGE_HEIGHT, MAX_IMAGE_HEIGHT),
      fit: "inside",
      withoutEnlargement: true,
    })
    .rotate();

  if (metadata.format === "png" || metadata.format === "gif") {
    return {
      buffer: await pipeline.png({ quality: DEFAULT_QUALITY }).toBuffer(),
      contentType: "image/png",
    };
  } else {
    return {
      buffer: await pipeline.webp({ quality: DEFAULT_QUALITY }).toBuffer(),
      contentType: "image/webp",
    };
  }
}

export async function handleUploadFile(formData: FormData) {
  await requireEditorOrHigher();

  const { profile } = await authRepository.getSessionWithProfile();

  if (!profile) {
    redirect("/login?error=permission_denied");
  }

  const rateLimitKey = `upload:${profile.id}`;
  const rateLimitResult = await redisUploadRateLimiter.check(rateLimitKey);
  
  if (!rateLimitResult.allowed) {
    const resetMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
    throw new Error(`上传过于频繁，请 ${resetMinutes} 分钟后再试`);
  }

  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("请选择文件");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024} MB）`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("不支持的文件类型");
  }

  if (IMAGE_MIME_TYPES.includes(file.type)) {
    const { buffer, contentType } = await compressImage(file);
    await uploadCompressedFile(buffer, file.name, contentType, profile.id);
  } else {
    await uploadFile(file, profile.id);
  }

  revalidatePath("/admin/media");
}

export async function handleDeleteMediaFile(fileId: string) {
  await requireEditorOrHigher();

  const { profile } = await authRepository.getSessionWithProfile();

  if (!profile) {
    redirect("/login?error=permission_denied");
  }

  const rateLimitKey = `delete_media:${profile.id}`;
  const rateLimitResult = await redisDeleteMediaRateLimiter.check(rateLimitKey);

  if (!rateLimitResult.allowed) {
    const resetMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
    throw new Error(`删除操作过于频繁，请 ${resetMinutes} 分钟后再试`);
  }

  await deleteMediaFile(fileId);

  revalidatePath("/admin/media");
}
