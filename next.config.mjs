/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
      // 自定义 CDN / 图床
      {
        protocol: 'https',
        hostname: 'img.ynpro.top',
      },
      // GitHub / Gravatar 头像
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.gravatar.com',
      },
      // 本地开发
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [100, 75, 80, 85, 90, 95],
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // script-src: 'unsafe-inline' 用于 Next.js inline scripts 和 theme 初始化;
              // 'unsafe-eval' 部分第三方库可能需要。如需加固可使用 nonce 方案替代。
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              // style-src: 'unsafe-inline' 用于 CSS-in-JS 和 Tailwind
              "style-src 'self' 'unsafe-inline'",
              // img-src: 限制 HTTPS 远程图片 + data: + blob:
              "img-src 'self' https: data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://img.ynpro.top",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // 阻止 mixed content
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },

      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(static|_next/static)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
