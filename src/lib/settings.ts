export const SETTINGS_KEYS = {
  SITE_TITLE: 'site_title',
  SITE_AUTHOR: 'site_author',
  SITE_DESCRIPTION: 'site_description',
  
  BANNER_TITLE: 'banner_title',
  BANNER_SUBTITLE: 'banner_subtitle',
  BANNER_TAG: 'banner_tag',
  BANNER_IMAGE_1: 'banner_image_1',
  BANNER_IMAGE_2: 'banner_image_2',
  BANNER_IMAGE_3: 'banner_image_3',
  
  SEO_TITLE: 'seo_title',
  SEO_DESCRIPTION: 'seo_description',
  POSTS_PER_PAGE: 'posts_per_page',
  
  SOCIAL_TWITTER: 'social_twitter',
  SOCIAL_GITHUB: 'social_github',
  SOCIAL_EMAIL: 'social_email',
  
  MEDIA_UPLOAD_ENABLED: 'media_upload_enabled',
  
  ANNOUNCEMENT_TOAST_ENABLED: 'announcement_toast_enabled',
} as const;

export const DEFAULT_SETTINGS: Record<string, string> = {
  [SETTINGS_KEYS.SITE_TITLE]: 'YN Blog',
  [SETTINGS_KEYS.SITE_AUTHOR]: 'YN Team',
  [SETTINGS_KEYS.SITE_DESCRIPTION]: '',
  
  [SETTINGS_KEYS.BANNER_TITLE]: 'YN Blog',
  [SETTINGS_KEYS.BANNER_SUBTITLE]: '记录技术、设计与灵感',
  [SETTINGS_KEYS.BANNER_TAG]: 'Personal Blog',
  [SETTINGS_KEYS.BANNER_IMAGE_1]: '',
  [SETTINGS_KEYS.BANNER_IMAGE_2]: '',
  [SETTINGS_KEYS.BANNER_IMAGE_3]: '',
  
  [SETTINGS_KEYS.SEO_TITLE]: '',
  [SETTINGS_KEYS.SEO_DESCRIPTION]: '',
  [SETTINGS_KEYS.POSTS_PER_PAGE]: '10',
  
  [SETTINGS_KEYS.SOCIAL_TWITTER]: '',
  [SETTINGS_KEYS.SOCIAL_GITHUB]: '',
  [SETTINGS_KEYS.SOCIAL_EMAIL]: process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
  
  [SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED]: 'true',
  
  [SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED]: 'true',
};