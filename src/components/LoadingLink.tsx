"use client";

import Link from "next/link";
import { useRouterState } from "@/lib/router-state";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, MouseEvent, HTMLAttributeAnchorTarget } from "react";
import { useCallback, useRef } from "react";

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
  prefetch?: boolean | null;
  prefetchOnHover?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function LoadingLink({
  href,
  children,
  className = "",
  target,
  rel,
  prefetch = null,
  prefetchOnHover = true,
  onClick,
}: LoadingLinkProps) {
  const { startLoading } = useRouterState();
  const pathname = usePathname();
  const router = useRouter();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (href !== pathname && !target) {
      startLoading();
    }
    onClick?.(e);
  }, [href, pathname, target, startLoading, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover || target) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      router.prefetch(href);
    }, 50);
  }, [href, prefetchOnHover, target, router]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      target={target}
      rel={rel}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}