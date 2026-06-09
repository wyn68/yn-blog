import { cacheWithLog } from "@/lib/cache-with-log";
import { settingsRepository, SiteConfig, HeroBannerConfig } from "@/repositories/settings-repository";
import { postsRepository } from "@/repositories/posts-repository";
import { categoriesRepository } from "@/repositories/categories-repository";
import { tagsRepository } from "@/repositories/tags-repository";
import type { SiteSetting } from "@/types";
import type { SiteStats } from "@/lib/banner-config";

export const getSettings = cacheWithLog(async (): Promise<Record<string, string>> => {
  return await settingsRepository.getSettingsMap();
}, 'settings.getSettings');

export const getSetting = cacheWithLog(async (key: string): Promise<string | null> => {
  return await settingsRepository.getSettingValue(key);
}, 'settings.getSetting');

export async function setSetting(key: string, value: string): Promise<void> {
  await settingsRepository.setSetting(key, value);
}

export async function setSettings(settings: Record<string, string>): Promise<void> {
  await settingsRepository.setSettings(settings);
}

export const getAllSettings = cacheWithLog(async (): Promise<SiteSetting[]> => {
  return await settingsRepository.getAllSettings();
}, 'settings.getAllSettings');

export const getSiteConfig = cacheWithLog(async (): Promise<SiteConfig> => {
  return await settingsRepository.getSiteConfig();
}, 'settings.getSiteConfig');

export const getHeroBannerConfig = cacheWithLog(async (): Promise<HeroBannerConfig> => {
  return await settingsRepository.getHeroBannerConfig();
}, 'settings.getHeroBannerConfig');

export const getSiteStats = cacheWithLog(async (): Promise<SiteStats> => {
  const [posts, categories, tags, latestPost] = await Promise.all([
    postsRepository.count("published"),
    categoriesRepository.count(),
    tagsRepository.count(),
    postsRepository.findMany({ status: "published" }, { limit: 1, orderBy: "updated_at", orderDirection: "desc" })
  ]);
  
  const lastUpdated = latestPost[0]?.updated_at 
    ? new Date(latestPost[0].updated_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  return {
    posts,
    categories,
    tags,
    lastUpdated
  };
}, 'settings.getSiteStats');
