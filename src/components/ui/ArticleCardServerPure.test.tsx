import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { ArticleCardServerPure, ArticleCardHorizontalServerPure } from '@/components/ui/ArticleCardServerPure';

const createElement = React.createElement;

const mockPost = {
  id: '1',
  title: 'Test Article Title',
  slug: 'test-article',
  excerpt: 'This is a test excerpt',
  content: 'This is the full content of the test article.',
  featured_image: 'https://example.com/image.jpg',
  created_at: '2024-01-15',
  view_count: 100,
  reading_time: 5,
  comment_count: 10,
  profiles: {
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  categories: {
    name: 'Technology',
    slug: 'technology',
  },
};

const mockPostNoImage = {
  ...mockPost,
  featured_image: null,
};

const mockPostNoProfile = {
  ...mockPost,
  profiles: undefined,
};

describe('ArticleCardServerPure Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Default Variant', () => {
    it('should render without crashing', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should render post title', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should render excerpt', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('This is a test excerpt...')).toBeInTheDocument();
    });

    it('should render category link', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should render author information', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should render date', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('2024/1/15')).toBeInTheDocument();
    });

    it('should render reading time', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('5分钟')).toBeInTheDocument();
    });

    it('should render view count', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render comment count', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle post without image', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPostNoImage })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should handle post without profile', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPostNoProfile })
      );

      expect(screen.getByText('匿名作者')).toBeInTheDocument();
    });
  });

  describe('Featured Variant', () => {
    it('should render featured variant correctly', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost, variant: 'featured' })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should render featured variant with larger title', () => {
      const { container } = render(
        createElement(ArticleCardServerPure, { post: mockPost, variant: 'featured' })
      );

      const title = screen.getByText('Test Article Title');
      expect(title.tagName).toBe('H2');
    });
  });

  describe('Compact Variant', () => {
    it('should render compact variant correctly', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost, variant: 'compact' })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should render compact variant with smaller text', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost, variant: 'compact' })
      );

      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  describe('Priority Prop', () => {
    it('should accept priority prop', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost, priority: true })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('should render without client-side dependencies', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should not use any React hooks', () => {
      render(
        createElement(ArticleCardServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });
  });
});

describe('ArticleCardHorizontalServerPure Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render without crashing', () => {
    render(
      createElement(ArticleCardHorizontalServerPure, { post: mockPost })
    );

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render horizontal layout', () => {
    const { container } = render(
      createElement(ArticleCardHorizontalServerPure, { post: mockPost })
    );

    const card = container.firstChild;
    expect(card).toHaveClass('flex');
    expect(card).toHaveClass('items-center');
  });

  it('should render all necessary information', () => {
    render(
      createElement(ArticleCardHorizontalServerPure, { post: mockPost })
    );

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('2024/1/15')).toBeInTheDocument();
    expect(screen.getByText('5 分钟')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should handle post without image', () => {
    render(
      createElement(ArticleCardHorizontalServerPure, { post: mockPostNoImage })
    );

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('should render without client-side dependencies', () => {
      render(
        createElement(ArticleCardHorizontalServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should not use any React hooks', () => {
      render(
        createElement(ArticleCardHorizontalServerPure, { post: mockPost })
      );

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });
  });
});
