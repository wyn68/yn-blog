import { BaseRepository } from "./base-repository";
import { createClient, createPublicClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";
import type { SiteSetting } from "@/types";

export interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  siteAuthor: string;
  postsPerPage: number;
  socialTwitter: string;
  socialGithub: string;
  seoTitle: string;
  seoDescription: string;
}

export interface HeroBannerConfig {
  title: string;
  subtitle: string;
  tag: string;
  images: Array<{
    id: number;
    url: string;
    title: string;
    subtitle: string;
  }>;
}

export class SettingsRepository extends BaseRepository {
  constructor() {
    super("site_settings");
  }

  async getSettingsMap(): Promise<Record<string, string>> {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) {
        devError('Error fetching settings map:', error);
        throw error;
      }
      
      return data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      devError('Unexpected error in getSettingsMap:', error);
      throw error;
    }
  }

  async getSettingValue(key: string): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        devError('Error fetching setting value:', error);
        return null;
      }
      return data.value;
    } catch (error) {
      devError('Unexpected error in getSettingValue:', error);
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      const supabase = createClient();
      const existing = await this.getSettingValue(key);
      
      if (existing !== null) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value })
          .eq("key", key);
        if (error) {
          devError('Error updating setting:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ key, value }]);
        if (error) {
          devError('Error inserting setting:', error);
          throw error;
        }
      }
    } catch (error) {
      devError('Unexpected error in setSetting:', error);
      throw error;
    }
  }

  async setSettings(settings: Record<string, string>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.setSetting(key, value);
      }
    } catch (error) {
      devError('Unexpected error in setSettings:', error);
      throw error;
    }
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key", { ascending: true });
      if (error) {
        devError('Error fetching all settings:', error);
        throw error;
      }
      return data as SiteSetting[];
    } catch (error) {
      devError('Unexpected error in getAllSettings:', error);
      throw error;
    }
  }

  async getSiteConfig(): Promise<SiteConfig> {
    try {
      const settings = await this.getSettingsMap();
      
      return {
        siteTitle: settings["site_title"] || "YN Blog",
        siteDescription: settings["seo_description"] || settings["site_description"] || "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。",
        siteAuthor: settings["site_author"] || "YN Team",
        postsPerPage: parseInt(settings["posts_per_page"] || "10"),
        socialTwitter: settings["social_twitter"] || "",
        socialGithub: settings["social_github"] || "",
        seoTitle: settings["seo_title"] || "",
        seoDescription: settings["seo_description"] || "",
      };
    } catch (error) {
      devError('Unexpected error in getSiteConfig:', error);
      return {
        siteTitle: "YN Blog",
        siteDescription: "YN Blog 是一个现代化的博客平台，使用 Next.js 和 Supabase 构建，专注于分享技术、设计与灵感。",
        siteAuthor: "YN Team",
        postsPerPage: 10,
        socialTwitter: "",
        socialGithub: "",
        seoTitle: "",
        seoDescription: "",
      };
    }
  }

  async getHeroBannerConfig(): Promise<HeroBannerConfig> {
    try {
      const settings = await this.getSettingsMap();
      
      const configuredImages: HeroBannerConfig["images"] = [];
      for (let i = 1; i <= 3; i++) {
        const imgUrl = settings[`banner_image_${i}`];
        if (imgUrl && imgUrl.trim()) {
          configuredImages.push({
            id: i,
            url: imgUrl,
            title: settings["banner_title"] || "YN Blog",
            subtitle: settings["banner_subtitle"] || "记录技术、设计与灵感",
          });
        }
      }
      
      return {
        title: settings["banner_title"] || "YN Blog",
        subtitle: settings["banner_subtitle"] || "记录技术、设计与灵感",
        tag: settings["banner_tag"] || "Personal Blog",
        images: configuredImages,
      };
    } catch (error) {
      devError('Unexpected error in getHeroBannerConfig:', error);
      return {
        title: "YN Blog",
        subtitle: "记录技术、设计与灵感",
        tag: "Personal Blog",
        images: [],
      };
    }
  }
}

export const settingsRepository = new SettingsRepository();
