"use server";

import { revalidatePath } from "next/cache";
import { setSettings } from "@/services/settings";
import { requireAdmin } from "@/lib/auth";
import { clearCacheByPrefix } from "@/lib/cache-with-log";
import { SETTINGS_KEYS } from "@/lib/settings";

export async function updateSettings(formData: FormData) {
  await requireAdmin();

  const newSettings: Record<string, string> = {};
  
  const validKeys = Object.values(SETTINGS_KEYS) as string[];
  
  formData.forEach((value, key) => {
    if (validKeys.includes(key)) {
      newSettings[key] = String(value);
    }
  });

  if (!newSettings[SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED]) {
    newSettings[SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED] = 'false';
  } else if (newSettings[SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED] === 'on') {
    newSettings[SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED] = 'true';
  }
  
  if (!newSettings[SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED]) {
    newSettings[SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED] = 'false';
  } else if (newSettings[SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED] === 'on') {
    newSettings[SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED] = 'true';
  }
  
  await setSettings(newSettings);

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/media");
  clearCacheByPrefix("settings");
}
