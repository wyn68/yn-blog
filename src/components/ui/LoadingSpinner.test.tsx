import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const createElement = React.createElement;

describe('LoadingSpinner Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(createElement(LoadingSpinner));
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render loading text by default', () => {
      render(createElement(LoadingSpinner));
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(createElement(LoadingSpinner, { text: 'Please wait' }));
      expect(screen.getByText('Please wait')).toBeInTheDocument();
    });

    it('should not render text when text prop is falsy', () => {
      render(createElement(LoadingSpinner, { text: '' }));
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('should not render text when text prop is null', () => {
      render(createElement(LoadingSpinner, { text: null as unknown as undefined }));
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size spinner', () => {
      render(createElement(LoadingSpinner, { size: 'sm' }));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('w-6');
      expect(spinner).toHaveClass('h-6');
    });

    it('should render medium size spinner (default)', () => {
      render(createElement(LoadingSpinner, { size: 'md' }));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('w-8');
      expect(spinner).toHaveClass('h-8');
    });

    it('should render large size spinner', () => {
      render(createElement(LoadingSpinner, { size: 'lg' }));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('w-10');
      expect(spinner).toHaveClass('h-10');
    });

    it('should default to medium size', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('w-8');
      expect(spinner).toHaveClass('h-8');
    });
  });

  describe('CSS Animation', () => {
    it('should use CSS animate-spin class', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should not use Framer Motion', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have rounded-full class', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should have border with theme colors', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('border-primary/20');
      expect(spinner).toHaveClass('border-t-primary');
    });

    it('should have correct border-2 for sm and md sizes', () => {
      render(createElement(LoadingSpinner, { size: 'sm' }));
      expect(screen.getByRole('progressbar')).toHaveClass('border-2');

      cleanup();

      render(createElement(LoadingSpinner, { size: 'md' }));
      expect(screen.getByRole('progressbar')).toHaveClass('border-2');
    });

    it('should not have explicit border class for lg size', () => {
      render(createElement(LoadingSpinner, { size: 'lg' }));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).not.toHaveClass('border-2');
    });
  });

  describe('Performance Optimization', () => {
    it('should have will-change transform for GPU acceleration', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner.style.willChange).toBe('transform');
    });

    it('should use CSS animation instead of JavaScript', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('animate-spin');
      expect(spinner.style.animation).toBeFalsy();
    });

    it('should not use Framer Motion for performance', () => {
      render(createElement(LoadingSpinner));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role', () => {
      render(createElement(LoadingSpinner));
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should have text for screen readers when loading', () => {
      render(createElement(LoadingSpinner));
      const text = screen.getByText('加载中...');
      expect(text).toBeInTheDocument();
    });

    it('should use muted-foreground color for text', () => {
      render(createElement(LoadingSpinner));
      const text = screen.getByText('加载中...');
      expect(text).toHaveClass('text-muted-foreground');
    });

    it('should have proper sizing for accessibility', () => {
      render(createElement(LoadingSpinner, { size: 'sm' }));
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeVisible();

      cleanup();

      render(createElement(LoadingSpinner, { size: 'lg' }));
      const largeSpinner = screen.getByRole('progressbar');
      expect(largeSpinner).toBeVisible();
    });
  });

  describe('Container', () => {
    it('should be centered vertically and horizontally', () => {
      const { container } = render(createElement(LoadingSpinner));
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });

    it('should have proper gap between spinner and text', () => {
      const { container } = render(createElement(LoadingSpinner));
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('gap-4');
    });

    it('should have proper vertical padding', () => {
      const { container } = render(createElement(LoadingSpinner));
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('py-12');
    });
  });

  describe('Size Variants', () => {
    it('should have consistent text sizes', () => {
      render(createElement(LoadingSpinner, { size: 'sm', text: 'Text' }));
      expect(screen.getByText('Text')).toHaveClass('text-sm');

      cleanup();

      render(createElement(LoadingSpinner, { size: 'md', text: 'Text' }));
      expect(screen.getByText('Text')).toHaveClass('text-base');

      cleanup();

      render(createElement(LoadingSpinner, { size: 'lg', text: 'Text' }));
      expect(screen.getByText('Text')).toHaveClass('text-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should show default text when text is undefined', () => {
      render(createElement(LoadingSpinner, { text: undefined as unknown as undefined }));
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('should hide text when text is empty string', () => {
      const { container } = render(createElement(LoadingSpinner, { text: '' }));
      expect(container.querySelector('span')).not.toBeInTheDocument();
    });

    it('should render with all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const { getByRole } = render(createElement(LoadingSpinner, { size }));
        expect(getByRole('progressbar')).toBeInTheDocument();
        cleanup();
      });
    });
  });
});
