import '@/test/mocks/next-link';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { ArticleCardServer } from '@/components/ui/ArticleCardServer';
import type { Post } from '@/types';
import { RouterStateProvider } from '@/lib/router-state';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <RouterStateProvider>
      {ui}
    </RouterStateProvider>
  );
};

const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: '1',
  title: 'Test Post Title',
  slug: 'test-post-title',
  content: 'This is a test post content with enough words to calculate reading time.',
  excerpt: 'This is a test excerpt',
  featured_image: 'https://example.com/image.jpg',
  status: 'published',
  author_id: 'author-1',
  category_id: 'cat-1',
  view_count: 100,
  like_count: 10,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  profiles: {
    id: 'author-1',
    username: 'Test Author',
    user_id: 'author-1',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  categories: {
    name: 'Technology',
    slug: 'technology',
  },
  ...overrides,
});

describe('ArticleCardServer', () => {
  describe('Default Variant', () => {
    afterEach(() => cleanup());

    it('should render without crashing', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should render post title correctly', () => {
      const post = createMockPost({ title: 'My Amazing Post' });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('My Amazing Post')).toBeInTheDocument();
    });

    it('should render excerpt when available', () => {
      const post = createMockPost({ excerpt: 'This is a custom excerpt' });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText(/This is a custom excerpt/)).toBeInTheDocument();
    });

    it('should use content as fallback when no excerpt', () => {
      const content = 'This is the content that will be used as excerpt fallback.';
      const post = createMockPost({ excerpt: null, content });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText(new RegExp(content.substring(0, 30)))).toBeInTheDocument();
    });

    it('should render category when available', () => {
      const post = createMockPost({
        categories: { name: 'JavaScript', slug: 'javascript' },
      });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('should render author username when available', () => {
      const post = createMockPost({
        profiles: { username: 'John Doe', avatar_url: null },
      });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render "匿名作者" when no author', () => {
      const post = createMockPost({ profiles: undefined });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('匿名作者')).toBeInTheDocument();
    });

    it('should render reading time', () => {
      const post = createMockPost({ reading_time: 5 });
      const { container } = renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const timeContainers = container.querySelectorAll('.flex.items-center.gap-1');
      const timeContainer = Array.from(timeContainers).find(el => el.textContent?.includes('分钟'));
      expect(timeContainer).toBeInTheDocument();
      expect(timeContainer?.textContent).toContain('5');
      expect(timeContainer?.textContent).toContain('分钟');
    });

    it('should render comment count', () => {
      const post = createMockPost({ comment_count: 15 });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should render view count', () => {
      const post = createMockPost({ view_count: 999 });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('should have correct link href', () => {
      const post = createMockPost({ slug: 'my-custom-slug' });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const links = screen.getAllByRole('link');
      const mainLink = links.find(link => link.getAttribute('href') === '/posts/my-custom-slug');
      expect(mainLink).toBeDefined();
    });

    it('should render post link correctly', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const links = screen.getAllByRole('link');
      const mainLink = links.find(link => link.getAttribute('href')?.startsWith('/posts/'));
      expect(mainLink).toBeDefined();
      expect(mainLink?.getAttribute('href')).toBe('/posts/test-post-title');
    });

    it('should render featured image when available', () => {
      const post = createMockPost({ featured_image: 'https://example.com/featured.jpg' });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should not render featured image when null', () => {
      const post = createMockPost({ featured_image: null });
      const { container } = renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const imageContainers = container.querySelectorAll('.h-48');
      expect(imageContainers.length).toBe(0);
    });
  });

  describe('Featured Variant', () => {
    afterEach(() => cleanup());

    it('should render featured variant correctly', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'featured' }));

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should have larger title for featured variant', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'featured' }));

      const title = screen.getByText('Test Post Title');
      expect(title.tagName).toBe('H2');
    });

    it('should render featured image with correct aspect ratio container', () => {
      const post = createMockPost({ featured_image: 'https://example.com/featured.jpg' });
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'featured' }));

      const imageContainer = document.querySelector('.h-64');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    afterEach(() => cleanup());

    it('should render compact variant correctly', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'compact' }));

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should render smaller title for compact variant', () => {
      const post = createMockPost();
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'compact' }));

      const title = screen.getByText('Test Post Title');
      expect(title.tagName).toBe('H3');
    });

    it('should render smaller image for compact variant', () => {
      const post = createMockPost({ featured_image: 'https://example.com/featured.jpg' });
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'compact' }));

      const imageContainer = document.querySelector('.w-20');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should not render excerpt for compact variant', () => {
      const post = createMockPost({ excerpt: 'This excerpt should not appear' });
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'compact' }));

      expect(screen.queryByText(/This excerpt should not appear/)).toBeNull();
    });

    it('should render category link correctly', () => {
      const post = createMockPost({
        categories: { name: 'Testing', slug: 'testing' },
      });
      renderWithProviders(React.createElement(ArticleCardServer, { post, variant: 'compact' }));

      const categoryLink = screen.getByRole('link', { name: 'Testing' });
      expect(categoryLink).toHaveAttribute('href', '/categories/testing');
    });
  });

  describe('Edge Cases', () => {
    afterEach(() => cleanup());

    it('should handle empty content', () => {
      const post = createMockPost({ content: '' });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should handle null avatar_url', () => {
      const post = createMockPost({
        profiles: { username: 'Author', avatar_url: null },
      });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('Author')).toBeInTheDocument();
    });

    it('should handle missing reading_time with calculation', () => {
      const post = createMockPost({ reading_time: undefined, content: 'word '.repeat(300) });
      const { container } = renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const timeContainers = container.querySelectorAll('.flex.items-center.gap-1');
      const timeContainer = Array.from(timeContainers).find(el => el.textContent?.includes('分钟'));
      expect(timeContainer).toBeInTheDocument();
      expect(timeContainer?.textContent).toMatch(/\d+/);
      expect(timeContainer?.textContent).toContain('分钟');
    });

    it('should handle zero comment count', () => {
      const post = createMockPost({ comment_count: 0 });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle zero view count', () => {
      const post = createMockPost({ view_count: 0 });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));

      const viewCounts = screen.getAllByText('0');
      expect(viewCounts.length).toBeGreaterThan(0);
    });
  });
});

describe('ArticleCardServer - Date Formatting', () => {
  afterEach(() => {
    cleanup();
  });

  it('should handle various date formats', () => {
    const dates = [
      '2024-01-01',
      '2024-12-31',
      '2024-06-15T12:00:00Z',
    ];

    dates.forEach((date) => {
      const post = createMockPost({ created_at: date });
      renderWithProviders(React.createElement(ArticleCardServer, { post }));
      cleanup();
    });
  });

  it('should handle future dates', () => {
    const post = createMockPost({ created_at: '2030-01-01' });
    renderWithProviders(React.createElement(ArticleCardServer, { post }));

    expect(screen.getByText(/2030/)).toBeInTheDocument();
  });
});

describe('ArticleCardServer - Accessibility', () => {
  afterEach(() => {
    cleanup();
  });

  it('should have proper link structure for screen readers', () => {
    const post = createMockPost({ title: 'Accessible Post' });
    renderWithProviders(React.createElement(ArticleCardServer, { post }));

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render images with alt text', () => {
    const post = createMockPost({
      featured_image: 'https://example.com/image.jpg',
      title: 'Post with Image',
    });
    renderWithProviders(React.createElement(ArticleCardServer, { post }));

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });
});
