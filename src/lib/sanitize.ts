/**
 * 基本 HTML 实体编码。
 * 仅转义 5 个核心 HTML 特殊字符，避免过度编码导致显示异常。
 * 用于纯文本内容（如留言）的 HTML 转义。
 */
export function sanitizeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => entities[char] || char);
}

/**
 * 规范化输入：移除空字节、统一换行符、截断超长内容。
 * 防止通过控制字符绕过正则匹配。
 */
function normalizeInput(input: string, maxLength: number = 5000): string {
  return input
    .replace(/\0/g, '')                    // 移除空字节（可绕过正则）
    .replace(/\r\n/g, '\n')                // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // 移除其他控制字符（保留 \t, \n）
    .substring(0, maxLength);              // 截断超长输入防止 DoS
}

/**
 * 评论内容清理。
 * 允许简单的格式化标签（<b>, <strong>, <i>, <em>），
 * 移除所有事件处理器（on* 属性）和危险协议（javascript:, data: 等），
 * 其他 HTML 标签会被实体编码。
 */
export function sanitizeComment(content: string): string {
  // 预处理：规范化输入、移除控制字符
  let sanitized = normalizeInput(content);

  const allowedTags = ['b', 'strong', 'i', 'em'];

  const tagPlaceholder = '___TAG_PLACEHOLDER___';

  const patterns = allowedTags.map(tag => ({
    open: new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'gi'),
    close: new RegExp(`</${tag}>`, 'gi'),
    tag,
  }));

  let placeholderIndex = 0;
  const placeholders: { placeholder: string; replacement: string }[] = [];

  patterns.forEach(({ open, close, tag }) => {
    sanitized = sanitized.replace(open, (match) => {
      const ph = `${tagPlaceholder}${placeholderIndex}${tagPlaceholder}`;
      placeholders.push({ placeholder: ph, replacement: sanitizeTagAttributes(match, tag) });
      placeholderIndex++;
      return ph;
    });
    sanitized = sanitized.replace(close, (match) => {
      const ph = `${tagPlaceholder}${placeholderIndex}${tagPlaceholder}`;
      placeholders.push({ placeholder: ph, replacement: match });
      placeholderIndex++;
      return ph;
    });
  });

  // 对剩余内容（非允许标签）进行 HTML 实体编码
  sanitized = sanitizeHtml(sanitized);

  // 还原被保护的允许标签
  placeholders.forEach(({ placeholder, replacement }) => {
    sanitized = sanitized.replace(placeholder, replacement);
  });

  return sanitized;
}

/**
 * 危险协议列表（包括编码变体）。
 * 冒号前允许任意空白字符是为了检测 "javascript :" 等变体。
 */
const DANGEROUS_PROTOCOLS = /(?:javascript|data|vbscript|file)\s*:/i;

/**
 * 事件处理器属性匹配模式。
 * 匹配 on* 属性及其变体（含换行符、制表符的绕过尝试）。
 * 使用 [\s\S] 替代 . 以跨行匹配，防止 "on\nclick" 等绕过方式。
 */
const EVENT_HANDLER_PATTERN = /\s+on[\s\S]*?\s*=\s*(?:"[\s\S]*?"|'[\s\S]*?'|[^\s>]+)/gi;

/**
 * 危险属性匹配（href, src, action, formaction 中包含危险协议的属性）。
 */
const DANGEROUS_ATTR_PATTERN = /(\s+(?:href|src|action|formaction|data|background|poster|codebase)\s*=\s*)(?:"[\s\S]*?"|'[\s\S]*?')/gi;

/**
 * 清理允许标签中的危险属性和协议，防止 XSS 注入。
 * 1. 移除所有事件处理器属性（onclick, onerror, onload, onmouseover 等）
 * 2. 移除 javascript:/data: 等危险协议的属性值
 * 3. 如果清理后标签格式异常，回退到安全的空标签形式
 */
function sanitizeTagAttributes(tagString: string, tagName: string): string {
  // 预处理标签字符串：压缩空白字符（防绕过）
  let cleaned = tagString.replace(/[\s\x00]+/g, ' ');

  // 1. 移除所有事件处理器属性（使用跨行匹配）
  cleaned = cleaned.replace(EVENT_HANDLER_PATTERN, '');

  // 2. 检测并移除危险协议的属性值
  cleaned = cleaned.replace(DANGEROUS_ATTR_PATTERN, (attrMatch) => {
    if (DANGEROUS_PROTOCOLS.test(attrMatch)) {
      return ''; // 移除整个危险属性
    }
    return attrMatch;
  });

  // 3. 确保标签正确闭合
  const trimmed = cleaned.trim();
  if (!/>\s*$/.test(trimmed) || trimmed.startsWith('</')) {
    return `<${tagName}>`;
  }

  return cleaned;
}