import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeroBannerServer } from './HeroBannerServer';
import type { BannerConfig, SiteStats } from '@/lib/banner-config';

const createElement = React.createElement;

vi.mock('next/image', () => ({
  default: function MockImage({ 
    src, 
    alt, 
    fill, 
    className, 
    priority, 
    loading, 
    quality, 
    sizes, 
    onError 
  }: { 
    src: string; 
    alt: string; 
    fill?: boolean;
    className?: string;
    priority?: boolean;
    loading?: string;
    quality?: number;
    sizes?: string;
    onError?: () => void;
  }) {
    return createElement('img', {
      src,
      alt,
      className: className || '',
      'data-testid': `image-${src}`,
      onError,
    });
  },
}));

const mockConfig: BannerConfig = {
  title: 'Test Banner',
  subtitle: 'Test Subtitle',
  tag: 'Test Tag',
  images: [
    { id: 1, url: 'https://example.com/image1.jpg', title: 'Image 1', subtitle: 'Subtitle 1' },
    { id: 2, url: 'https://example.com/image2.jpg', title: 'Image 2', subtitle: 'Subtitle 2' },
    { id: 3, url: 'https://example.com/image3.jpg', title: 'Image 3', subtitle: 'Subtitle 3' },
  ],
};

const mockStats: SiteStats = {
  posts: 42,
  categories: 12,
  tags: 56,
  lastUpdated: '2024-01-15',
};

describe('HeroBannerServer Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render banner title and subtitle', () => {
      const configWithoutImages: BannerConfig = {
        ...mockConfig,
        images: [],
      };

      render(
        createElement(HeroBannerServer, {
          config: configWithoutImages,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(screen.getByText('Test Banner')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should render current image title and subtitle', () => {
      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 1,
          loadedIndices: new Set([1]),
        })
      );

      expect(screen.getByText('Image 2')).toBeInTheDocument();
      expect(screen.getByText('Subtitle 2')).toBeInTheDocument();
    });
  });

  describe('Image Loading', () => {
    it('should render image when loaded', () => {
      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const image = screen.getByTestId('image-https://example.com/image1.jpg');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Image 1');
    });

    it('should not render image when not loaded', () => {
      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set<number>(),
        })
      );

      expect(screen.queryByTestId('image-https://example.com/image1.jpg')).not.toBeInTheDocument();
    });

    it('should show fallback when image fails to load with retry button', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const image = screen.getByTestId('image-https://example.com/image1.jpg');
      fireEvent.error(image);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Hero banner image failed to load: 1');
      const fallbackMessages = screen.getAllByText('图片加载失败');
      expect(fallbackMessages.length).toBeGreaterThan(0);

      const retryButton = screen.getByText('重试');
      expect(retryButton).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
    });

    it('should allow retry after image fails to load', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const image = screen.getByTestId('image-https://example.com/image1.jpg');
      fireEvent.error(image);

      expect(screen.getByText('重试')).toBeInTheDocument();

      fireEvent.click(screen.getByText('重试'));

      expect(screen.queryByText('重试')).not.toBeInTheDocument();
    });

    it('should show loading spinner when no images provided', () => {
      const configWithoutImages: BannerConfig = {
        ...mockConfig,
        images: [],
      };

      render(
        createElement(HeroBannerServer, {
          config: configWithoutImages,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should render site statistics', () => {
      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(screen.getByText('文章')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('分类')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('标签')).toBeInTheDocument();
      expect(screen.getByText('56')).toBeInTheDocument();
      expect(screen.getByText('更新')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    });

    it('should display lastUpdated as text', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const statItems = container.querySelectorAll('[class*="text-xs text-white/90"]');
      expect(statItems.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have correct height classes', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const banner = container.querySelector('[class*="h-[280px]"]');
      expect(banner).toBeInTheDocument();
    });

    it('should have gradient overlays', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const gradients = container.querySelectorAll('[class*="bg-gradient-to"]');
      expect(gradients.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on images', () => {
      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const image = screen.getByTestId('image-https://example.com/image1.jpg');
      expect(image).toHaveAttribute('alt', 'Image 1');
    });

    it('should use semantic HTML structure', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Image 1');
    });
  });

  describe('Animation Effects', () => {
    it('should have fade-in animation class', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const banner = container.querySelector('.animate-fade-in');
      expect(banner).toBeInTheDocument();
    });

    it('should have slide-up animation class on content', () => {
      const { container } = render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const content = container.querySelector('.animate-slide-up');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty images array', () => {
      const config: BannerConfig = {
        ...mockConfig,
        images: [],
      };

      const { container } = render(
        createElement(HeroBannerServer, {
          config,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle single image', () => {
      const config: BannerConfig = {
        ...mockConfig,
        images: [{ id: 1, url: 'https://example.com/single.jpg', title: 'Single', subtitle: 'Single Subtitle' }],
      };

      render(
        createElement(HeroBannerServer, {
          config,
          stats: mockStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      expect(screen.getByText('Single')).toBeInTheDocument();
    });

    it('should handle null stats values', () => {
      const emptyStats: SiteStats = {
        posts: 0,
        categories: 0,
        tags: 0,
        lastUpdated: '',
      };

      render(
        createElement(HeroBannerServer, {
          config: mockConfig,
          stats: emptyStats,
          currentIndex: 0,
          loadedIndices: new Set([0]),
        })
      );

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBe(3);
    });
  });
});
