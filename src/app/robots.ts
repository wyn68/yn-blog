import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ynpro.top';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: 'Slurp',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: ['/admin', '/login', '/register', '/profile', '/settings', '/auth', '/api'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/login',
          '/register',
          '/profile',
          '/settings',
          '/auth',
          '/api',
          '/_next',
          '/static',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  };
}