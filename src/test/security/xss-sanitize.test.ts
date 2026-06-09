import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeComment } from '@/lib/sanitize';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

describe('XSS Sanitization Tests', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const result = sanitizeHtml(maliciousInput);
      // sanitizeHtml 只转义核心 5 个 HTML 字符，/ 不再被转义
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should escape onclick handlers', () => {
      const maliciousInput = '<img src=x onerror="alert(\'XSS\')">';
      const result = sanitizeHtml(maliciousInput);
      expect(result).toContain('&lt;img');
      expect(result).toContain('onerror');
    });

    it('should escape iframe injection', () => {
      const maliciousInput = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const result = sanitizeHtml(maliciousInput);
      expect(result).toContain('&lt;iframe');
    });

    it('should escape javascript: URLs', () => {
      const maliciousInput = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      const result = sanitizeHtml(maliciousInput);
      expect(result).toContain('&lt;a');
    });

    it('should escape data: URLs', () => {
      const maliciousInput = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click me</a>';
      const result = sanitizeHtml(maliciousInput);
      expect(result).toContain('&lt;a');
    });

    it('should escape all HTML tags (security first)', () => {
      const safeInput = '<b>Bold</b> and <i>italic</i>';
      const result = sanitizeHtml(safeInput);
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('<i>');
      expect(result).toContain('&lt;b&gt;');
      expect(result).toContain('&lt;i&gt;');
    });

    it('should escape special characters', () => {
      const input = '&<>"\'';
      const result = sanitizeHtml(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#39;');
    });

    it('should not over-escape backticks and equals (harmless in text content)', () => {
      // sanitizeHtml 只转义 5 个核心 HTML 字符: & < > " '
      // / = ` 在 HTML 文本节点中不需要转义，过度转义会导致渲染异常
      const input = '`test` = value';
      const result = sanitizeHtml(input);
      // 这些字符应保持不变
      expect(result).toContain('`test`');
      expect(result).toContain('=');
      // 不包含过度转义的实体
      expect(result).not.toContain('&#x60;');
      expect(result).not.toContain('&#x3D;');
    });
  });

  describe('sanitizeComment', () => {
    it('should escape script injection in comments', () => {
      const maliciousComment = '<script>document.cookie</script>Hello World';
      const result = sanitizeComment(maliciousComment);
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape img onerror injection', () => {
      const maliciousComment = '<img src=x onerror=alert(1)>';
      const result = sanitizeComment(maliciousComment);
      expect(result).toContain('&lt;img');
    });

    it('should preserve allowed formatting tags (b, strong, i, em)', () => {
      const formattedComment = '<b>Bold</b> and <i>italic</i> text';
      const result = sanitizeComment(formattedComment);
      expect(result).toContain('<b>');
      expect(result).toContain('<i>');
      expect(result).not.toContain('&lt;b&gt;');
      expect(result).not.toContain('&lt;i&gt;');
    });

    it('should strip event handlers from allowed tags', () => {
      const maliciousComment = '<b onclick="alert(1)">Bold</b> <i onerror="alert(1)">italic</i>';
      const result = sanitizeComment(maliciousComment);
      expect(result).toContain('<b>');
      expect(result).toContain('<i>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onerror');
    });

    it('should still escape non-allowed HTML tags', () => {
      const maliciousComment = '<div>test</div> <span>hello</span>';
      const result = sanitizeComment(maliciousComment);
      expect(result).toContain('&lt;div&gt;');
      expect(result).toContain('&lt;span&gt;');
    });
  });

  describe('rehype-sanitize plugin', () => {
    it('should sanitize malicious markdown with raw HTML', async () => {
      const maliciousMarkdown = `# Title

Some text with <script>alert('XSS')</script> injection.

<img src=x onerror="alert('XSS')" />

[Click me](javascript:alert('XSS'))
`;

      const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify);

      const result = await processor.process(maliciousMarkdown);
      const htmlString = String(result);

      expect(htmlString).not.toContain('<script>');
      expect(htmlString).not.toContain('onerror');
      expect(htmlString).not.toContain('javascript:');
    });

    it('should preserve safe markdown formatting', async () => {
      const safeMarkdown = `# Heading 1

**Bold text** and *italic text*

- List item 1
- List item 2

\`\`\`javascript
console.log('code block');
\`\`\`
`;

      const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify);

      const result = await processor.process(safeMarkdown);
      const htmlString = String(result);

      expect(htmlString).toContain('<h1>');
      expect(htmlString).toContain('<strong>');
      expect(htmlString).toContain('<em>');
      expect(htmlString).toContain('<ul>');
      expect(htmlString).toContain('<code');
    });

    it('should handle complex XSS payloads', async () => {
      const xssPayloads = [
        '<svg onload=alert(1)>',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
        '<select onfocus=alert(1) autofocus>',
        '<textarea onfocus=alert(1) autofocus>',
        '<keygen onfocus=alert(1) autofocus>',
        '<video><source onerror="alert(1)">',
        '<audio src=x onerror=alert(1)>',
        '<marquee onstart=alert(1)>',
        '<details open ontoggle=alert(1)>',
      ];

      const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify);

      for (const payload of xssPayloads) {
        const result = await processor.process(payload);
        const htmlString = String(result).toLowerCase();

        expect(htmlString).not.toContain('onload');
        expect(htmlString).not.toContain('onerror');
        expect(htmlString).not.toContain('onfocus');
        expect(htmlString).not.toContain('onstart');
        expect(htmlString).not.toContain('ontoggle');
      }
    });
  });
});
