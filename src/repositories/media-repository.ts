import { BaseRepository } from "./base-repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";
import type { MediaFile } from "@/types";

export class MediaRepository extends BaseRepository {
  constructor() {
    super("media_files");
  }

  async findAll() {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("media_files")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false });
      if (error) {
        devError('Error fetching media files:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("media_files")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        devError('Error fetching media file by id:', error);
        throw error;
      }
      return data;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      throw error;
    }
  }

  async uploadFile(file: File, uploadedBy: string): Promise<{ publicUrl: string; mediaFile: MediaFile }> {
    try {
      const supabase = createAdminClient();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) {
        devError('Error uploading file to storage:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { data: mediaFile, error } = await supabase
        .from("media_files")
        .insert([{
          name: file.name,
          path: filePath,
          type: file.type,
          size: file.size,
          uploaded_by: uploadedBy,
        }])
        .select()
        .single();

      if (error) {
        devError('Error inserting media file record:', error);
        throw error;
      }

      return { publicUrl, mediaFile };
    } catch (error) {
      devError('Unexpected error in uploadFile:', error);
      throw error;
    }
  }

  async uploadCompressedFile(fileBuffer: Buffer, originalFileName: string, contentType: string, uploadedBy: string): Promise<{ publicUrl: string; mediaFile: MediaFile }> {
    try {
      const supabase = createAdminClient();
      const fileExtension = contentType.includes("image/webp") ? "webp" : originalFileName.split(".").pop() || "bin";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, fileBuffer, {
          contentType,
        });

      if (uploadError) {
        devError('Error uploading compressed file to storage:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { data: mediaFile, error } = await supabase
        .from("media_files")
        .insert([{
          name: originalFileName,
          path: filePath,
          type: contentType,
          size: fileBuffer.length,
          uploaded_by: uploadedBy,
        }])
        .select()
        .single();

      if (error) {
        devError('Error inserting compressed media file record:', error);
        throw error;
      }

      return { publicUrl, mediaFile };
    } catch (error) {
      devError('Unexpected error in uploadCompressedFile:', error);
      throw error;
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      const supabase = createAdminClient();
      const { data: mediaFile, error: fetchError } = await supabase
        .from("media_files")
        .select("path")
        .eq("id", id)
        .single();

      if (fetchError) {
        devError('Error fetching media file for deletion:', fetchError);
        throw fetchError;
      }

      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([mediaFile.path]);

      if (storageError) {
        devError('Error deleting file from storage:', storageError);
        throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("media_files")
        .delete()
        .eq("id", id);

      if (deleteError) {
        devError('Error deleting media file record:', deleteError);
        throw deleteError;
      }
    } catch (error) {
      devError('Unexpected error in deleteById:', error);
      throw error;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const mediaRepository = new MediaRepository();
