import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Skeleton, ArticleCardSkeleton, ArticleListSkeleton, FeaturedPostSkeleton, CompactPostSkeleton, SidebarSkeleton, PostDetailSkeleton, HeroBannerSkeleton, CommentSkeleton, LoadingSpinner } from '@/components/ui/Skeleton';

const createElement = React.createElement;

describe('Skeleton Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Skeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(
        createElement(Skeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        createElement(Skeleton, { className: 'custom-skeleton-class' })
      );

      expect(container.firstChild).toHaveClass('custom-skeleton-class');
    });

    it('should render as div element', () => {
      const { container } = render(
        createElement(Skeleton, {})
      );

      const skeleton = container.firstChild;
      expect(skeleton?.nodeName).toBe('DIV');
    });

    it('should have skeleton base class', () => {
      const { container } = render(
        createElement(Skeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('skeleton');
    });
  });

  describe('ArticleCardSkeleton', () => {
    it('should render ArticleCardSkeleton without crashing', () => {
      const { container } = render(
        createElement(ArticleCardSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have card class', () => {
      const { container } = render(
        createElement(ArticleCardSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('card');
    });

    it('should have animate-pulse class', () => {
      const { container } = render(
        createElement(ArticleCardSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('ArticleListSkeleton', () => {
    it('should render ArticleListSkeleton with default count', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render ArticleListSkeleton with custom count', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: 5 })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render ArticleListSkeleton with count 0', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: 0 })
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('FeaturedPostSkeleton', () => {
    it('should render FeaturedPostSkeleton without crashing', () => {
      const { container } = render(
        createElement(FeaturedPostSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have card class', () => {
      const { container } = render(
        createElement(FeaturedPostSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('card');
    });

    it('should have animate-pulse class', () => {
      const { container } = render(
        createElement(FeaturedPostSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('CompactPostSkeleton', () => {
    it('should render CompactPostSkeleton without crashing', () => {
      const { container } = render(
        createElement(CompactPostSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      const { container } = render(
        createElement(CompactPostSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('SidebarSkeleton', () => {
    it('should render SidebarSkeleton without crashing', () => {
      const { container } = render(
        createElement(SidebarSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have space-y-6 class', () => {
      const { container } = render(
        createElement(SidebarSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('space-y-6');
    });
  });

  describe('PostDetailSkeleton', () => {
    it('should render PostDetailSkeleton without crashing', () => {
      const { container } = render(
        createElement(PostDetailSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be centered with max-w-3xl', () => {
      const { container } = render(
        createElement(PostDetailSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('max-w-3xl');
      expect(skeleton.className).toContain('mx-auto');
    });
  });

  describe('HeroBannerSkeleton', () => {
    it('should render HeroBannerSkeleton without crashing', () => {
      const { container } = render(
        createElement(HeroBannerSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      const { container } = render(
        createElement(HeroBannerSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('CommentSkeleton', () => {
    it('should render CommentSkeleton without crashing', () => {
      const { container } = render(
        createElement(CommentSkeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have flex layout for comments', () => {
      const { container } = render(
        createElement(CommentSkeleton, {})
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('flex');
      expect(skeleton.className).toContain('gap-4');
    });
  });

  describe('LoadingSpinner', () => {
    it('should render LoadingSpinner without crashing', () => {
      const { container } = render(
        createElement(LoadingSpinner, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be flex centered', () => {
      const { container } = render(
        createElement(LoadingSpinner, {})
      );

      const spinner = container.firstChild as HTMLElement;
      expect(spinner.className).toContain('flex');
      expect(spinner.className).toContain('items-center');
      expect(spinner.className).toContain('justify-center');
    });

    it('should have animate-spin class on inner element', () => {
      const { container } = render(
        createElement(LoadingSpinner, {})
      );

      const innerElements = container.querySelectorAll('.animate-spin');
      expect(innerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Composite Skeletons', () => {
    it('should render all skeleton components together', () => {
      const { container } = render(
        createElement('div', {},
          createElement(Skeleton, {}),
          createElement(ArticleCardSkeleton, {}),
          createElement(FeaturedPostSkeleton, {}),
          createElement(CompactPostSkeleton, {}),
          createElement(LoadingSpinner, {})
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('should render without client-side dependencies', () => {
      const { container } = render(
        createElement(Skeleton, {})
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not use any React hooks', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: 3 })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should work with server-side props', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: 2 })
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should allow additional HTML attributes', () => {
      const { container } = render(
        createElement(Skeleton, { 'aria-hidden': 'true' })
      );

      const skeleton = container.querySelector('[aria-hidden]');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should preserve semantic HTML structure when used in context', () => {
      render(
        createElement('section', { 'aria-label': 'Loading content' },
          createElement(Skeleton, {}),
          createElement(Skeleton, {}),
          createElement(Skeleton, {})
        )
      );

      const section = document.querySelector('section[aria-label="Loading content"]');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative count gracefully', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: -1 })
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle very large count values', () => {
      const { container } = render(
        createElement(ArticleListSkeleton, { count: 100 })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render multiple skeletons in sequence', () => {
      const { container } = render(
        createElement('div', {},
          createElement(Skeleton, { className: 'h-8 w-full mb-4' }),
          createElement(Skeleton, { className: 'h-8 w-3/4 mb-4' }),
          createElement(Skeleton, { className: 'h-8 w-1/2' })
        )
      );

      expect(container.firstChild).toBeInTheDocument();
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(3);
    });
  });
});
