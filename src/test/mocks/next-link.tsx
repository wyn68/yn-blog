import { vi } from 'vitest';
import React from 'react';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    target,
    rel,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} onClick={onClick} target={target} rel={rel} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
  OptimizedImage: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
