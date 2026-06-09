import { mediaRepository } from "@/repositories/media-repository";

export async function uploadFile(file: File, uploadedBy: string): Promise<string> {
  const { publicUrl } = await mediaRepository.uploadFile(file, uploadedBy);
  return publicUrl;
}

export async function uploadCompressedFile(fileBuffer: Buffer, originalFileName: string, contentType: string, uploadedBy: string): Promise<string> {
  const { publicUrl } = await mediaRepository.uploadCompressedFile(fileBuffer, originalFileName, contentType, uploadedBy);
  return publicUrl;
}

export async function getMediaFiles() {
  return await mediaRepository.findAll();
}

export async function getMediaFileById(id: string) {
  return await mediaRepository.findById(id);
}

export async function deleteMediaFile(id: string) {
  await mediaRepository.deleteById(id);
}

export function formatFileSize(bytes: number): string {
  return mediaRepository.formatFileSize(bytes);
}
