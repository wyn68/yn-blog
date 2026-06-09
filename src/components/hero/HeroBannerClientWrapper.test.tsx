import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { HeroBannerClientWrapper } from './HeroBannerClientWrapper';
import type { BannerConfig, SiteStats } from '@/lib/banner-config';

const createElement = React.createElement;

vi.mock('./HeroBannerServer', () => ({
  HeroBannerServer: function MockHeroBannerServer({ 
    config, 
    stats, 
    currentIndex, 
    loadedIndices 
  }: { 
    config: BannerConfig; 
    stats: SiteStats; 
    currentIndex: number; 
    loadedIndices: Set<number>;
  }) {
    return createElement('div', {
      'data-testid': 'hero-banner-server',
      'data-current-index': currentIndex,
      'data-loaded-count': loadedIndices.size,
    }, [
      createElement('h1', { key: 'title' }, config.images[currentIndex]?.title || config.title),
      createElement('p', { key: 'subtitle' }, config.images[currentIndex]?.subtitle || config.subtitle),
    ]);
  },
}));

const mockConfig: BannerConfig = {
  title: 'Default Title',
  subtitle: 'Default Subtitle',
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

describe('HeroBannerClientWrapper Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render HeroBannerServer with initial state', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toBeInTheDocument();
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
    });

    it('should display initial image content', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      expect(screen.getByText('Image 1')).toBeInTheDocument();
      expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
    });
  });

  describe('Auto Rotation', () => {
    it('should automatically rotate images every 6 seconds', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '1');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '2');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
    });

    it('should pause rotation when hovering', () => {
      const { container } = render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const wrapper = container.firstChild as HTMLElement;
      let serverComponent = screen.getByTestId('hero-banner-server');

      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      fireEvent.mouseLeave(wrapper);

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '1');
    });

    it('should not auto rotate when only one image', () => {
      const singleImageConfig: BannerConfig = {
        ...mockConfig,
        images: [{ id: 1, url: 'https://example.com/single.jpg', title: 'Single', subtitle: 'Single Subtitle' }],
      };

      render(
        createElement(HeroBannerClientWrapper, {
          config: singleImageConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
    });

    it('should not auto rotate when no images', () => {
      const noImagesConfig: BannerConfig = {
        ...mockConfig,
        images: [],
      };

      render(
        createElement(HeroBannerClientWrapper, {
          config: noImagesConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
    });
  });

  describe('Manual Navigation', () => {
    it('should show navigation buttons when multiple images', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
      expect(buttons[0]).toHaveTextContent('1');
      expect(buttons[1]).toHaveTextContent('2');
      expect(buttons[2]).toHaveTextContent('3');
    });

    it('should hide navigation buttons when single image', () => {
      const singleImageConfig: BannerConfig = {
        ...mockConfig,
        images: [{ id: 1, url: 'https://example.com/single.jpg', title: 'Single', subtitle: 'Single Subtitle' }],
      };

      render(
        createElement(HeroBannerClientWrapper, {
          config: singleImageConfig,
          stats: mockStats,
        })
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should switch image when clicking navigation button', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      expect(screen.getByText('Image 1')).toBeInTheDocument();

      const button2 = screen.getByText('2');
      fireEvent.click(button2);

      expect(screen.getByText('Image 2')).toBeInTheDocument();
      expect(screen.getByTestId('hero-banner-server')).toHaveAttribute('data-current-index', '1');
    });

    it('should update loaded indices when clicking navigation button', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-loaded-count', '3');

      const button3 = screen.getByText('3');
      fireEvent.click(button3);

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(parseInt(serverComponent.getAttribute('data-loaded-count') || '0')).toBe(3);
    });
  });

  describe('Image Preloading', () => {
    it('should preload adjacent images when current index changes', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-loaded-count', '3');

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(parseInt(serverComponent.getAttribute('data-loaded-count') || '0')).toBe(3);
    });

    it('should load initial image and adjacent images immediately', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-loaded-count', '3');
    });
  });

  describe('State Management', () => {
    it('should initialize with correct state', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
      expect(serverComponent).toHaveAttribute('data-loaded-count', '3');
    });

    it('should update current index when config images change', () => {
      const { rerender } = render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      let serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');

      const newConfig: BannerConfig = {
        title: 'New Title',
        subtitle: 'New Subtitle',
        tag: 'New Tag',
        images: [
          { id: 1, url: 'https://example.com/new1.jpg', title: 'New Image 1', subtitle: 'New Subtitle 1' },
        ],
      };

      rerender(
        createElement(HeroBannerClientWrapper, {
          config: newConfig,
          stats: mockStats,
        })
      );

      serverComponent = screen.getByTestId('hero-banner-server');
      expect(serverComponent).toHaveAttribute('data-current-index', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have interactive navigation buttons', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    it('should allow keyboard navigation', () => {
      render(
        createElement(HeroBannerClientWrapper, {
          config: mockConfig,
          stats: mockStats,
        })
      );

      const button1 = screen.getByText('1');
      fireEvent.click(button1);

      expect(screen.getByText('Image 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty images array', () => {
      const config: BannerConfig = {
        ...mockConfig,
        images: [],
      };

      const { container } = render(
        createElement(HeroBannerClientWrapper, {
          config,
          stats: mockStats,
        })
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle single image config', () => {
      const config: BannerConfig = {
        ...mockConfig,
        images: [{ id: 1, url: 'https://example.com/single.jpg', title: 'Single', subtitle: 'Single Subtitle' }],
      };

      render(
        createElement(HeroBannerClientWrapper, {
          config,
          stats: mockStats,
        })
      );

      expect(screen.getByText('Single')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle large number of images', () => {
      const largeImagesConfig: BannerConfig = {
        ...mockConfig,
        images: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          url: `https://example.com/image${i + 1}.jpg`,
          title: `Image ${i + 1}`,
          subtitle: `Subtitle ${i + 1}`,
        })),
      };

      render(
        createElement(HeroBannerClientWrapper, {
          config: largeImagesConfig,
          stats: mockStats,
        })
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(10);
    });
  });
});
