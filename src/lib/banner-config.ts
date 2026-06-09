export interface BannerImage {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  thumbnail?: string;
}

export function getWebPUrl(url: string): string {
  if (url.match(/\.(jpg|jpeg|png)$/i)) {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return url;
}

export interface BannerConfig {
  title: string;
  subtitle: string;
  tag: string;
  images: BannerImage[];
}

export interface SiteStats {
  posts: number;
  categories: number;
  tags: number;
  lastUpdated: string;
}

export const DEFAULT_CONFIG: BannerConfig = {
  title: "YN Blog",
  subtitle: "记录技术、设计与灵感",
  tag: "Personal Blog",
  images: [],
};

export async function fetchBannerConfig(): Promise<BannerConfig> {
  try {
    const settingsRes = await fetch("/api/settings");
    if (!settingsRes.ok) {
      return DEFAULT_CONFIG;
    }
    
    const settingsData = await settingsRes.json();
    const configuredImages: BannerImage[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const imgUrl = settingsData[`banner_image_${i}`];
      if (imgUrl && imgUrl.trim()) {
        configuredImages.push({
          id: i,
          url: imgUrl,
          title: settingsData["banner_title"] || "YN Blog",
          subtitle: settingsData["banner_subtitle"] || "记录技术、设计与灵感",
        });
      }
    }
    
    return {
      title: settingsData["banner_title"] || "YN Blog",
      subtitle: settingsData["banner_subtitle"] || "记录技术、设计与灵感",
      tag: settingsData["banner_tag"] || "Personal Blog",
      images: configuredImages,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function fetchSiteStats(): Promise<SiteStats> {
  try {
    const statsRes = await fetch("/api/stats");
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      return statsData;
    }
  } catch {
  }
  
  return {
    posts: 42,
    categories: 12,
    tags: 56,
    lastUpdated: "2024-01-15",
  };
}