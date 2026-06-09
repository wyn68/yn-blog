export interface UrlValidationResult {
  valid: boolean;
  message: string;
}

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/i;
const IMAGE_URL_REGEX = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const TRUSTED_IMAGE_HOSTS = ['img.ynpro.top', 'telegra.ph'];

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url.trim());
}

export function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  
  if (IMAGE_URL_REGEX.test(trimmedUrl)) {
    return true;
  }
  
  try {
    const urlObj = new URL(trimmedUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (TRUSTED_IMAGE_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`))) {
      return true;
    }
  } catch {
    // URL 解析失败，返回 false
  }
  
  return false;
}

export function validateUrl(url: string): UrlValidationResult {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, message: "请输入URL地址" };
  }

  if (!isValidUrl(trimmedUrl)) {
    return { valid: false, message: "请输入有效的URL地址" };
  }

  return { valid: true, message: "" };
}

export function validateImageUrl(url: string): UrlValidationResult {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, message: "请输入图片URL" };
  }

  if (!isValidUrl(trimmedUrl)) {
    return { valid: false, message: "请输入有效的URL地址" };
  }

  if (!isValidImageUrl(trimmedUrl)) {
    return { valid: false, message: "请输入有效的图片URL（支持jpg、jpeg、png、gif、webp、svg格式）" };
  }

  return { valid: true, message: "" };
}

export function sanitizeUrl(url: string): string {
  let sanitized = url.trim();
  
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = 'https://' + sanitized;
  }
  
  try {
    const urlObj = new URL(sanitized);
    return urlObj.toString();
  } catch {
    return sanitized;
  }
}
