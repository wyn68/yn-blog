export const APP_CONSTANTS = {
  SCROLL_THRESHOLD: 50,
  THROTTLE_DELAY: 16,
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const MEDIA_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_IMAGE_WIDTH: 2048,
  MAX_IMAGE_HEIGHT: 2048,
  DEFAULT_QUALITY: 80,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
};

export const UI_CONSTANTS = {
  LIGHT_BLUR_PLACEHOLDER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb' filter='url(%23g)'/%3E%3C/svg%3E",
  DARK_BLUR_PLACEHOLDER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%231f2937' filter='url(%23g)'/%3E%3C/svg%3E",
  MOBILE_BREAKPOINT: 768,
};

export const SEO_CONSTANTS = {
  TITLE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MIN_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 160,
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
};

export const RATE_LIMIT_CONSTANTS = {
  DEFAULT_WINDOW_MS: 60 * 1000,
  DEFAULT_MAX_REQUESTS: 100,
  COMMENT_WINDOW_MS: 60 * 1000,
  COMMENT_MAX_REQUESTS: 10,
  UPLOAD_WINDOW_MS: 60 * 1000,
  UPLOAD_MAX_REQUESTS: 10,
  VIEW_WINDOW_MS: 60 * 1000,
  VIEW_MAX_REQUESTS: 100,
};
