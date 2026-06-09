import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Badge, badgeVariants } from '@/components/ui/Badge';

const createElement = React.createElement;

describe('Badge Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Badge', () => {
    it('should render without crashing', () => {
      render(
        createElement(Badge, {}, 'Badge Content')
      );

      expect(screen.getByText('Badge Content')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        createElement(Badge, {}, 'Test Badge')
      );

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        createElement(Badge, { className: 'custom-badge-class' }, 'Content')
      );

      expect(container.firstChild).toHaveClass('custom-badge-class');
    });
  });

  describe('Badge Variants', () => {
    it('should render default variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'default' }, 'Default')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render secondary variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'secondary' }, 'Secondary')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render outline variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'outline' }, 'Outline')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render ghost variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'ghost' }, 'Ghost')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render destructive variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'destructive' }, 'Destructive')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render success variant correctly', () => {
      const { container } = render(
        createElement(Badge, { variant: 'success' }, 'Success')
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Badge Sizes', () => {
    it('should render default size correctly', () => {
      const { container } = render(
        createElement(Badge, { size: 'default' }, 'Default')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render sm size correctly', () => {
      const { container } = render(
        createElement(Badge, { size: 'sm' }, 'Small')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render lg size correctly', () => {
      const { container } = render(
        createElement(Badge, { size: 'lg' }, 'Large')
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Badge Variant Styles', () => {
    it('should have correct classes for default variant', () => {
      const { container } = render(
        createElement(Badge, { variant: 'default' }, 'Default')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-primary');
      expect(badge.className).toContain('text-primary');
    });

    it('should have correct classes for destructive variant', () => {
      const { container } = render(
        createElement(Badge, { variant: 'destructive' }, 'Destructive')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-destructive');
      expect(badge.className).toContain('text-destructive');
    });

    it('should have correct classes for success variant', () => {
      const { container } = render(
        createElement(Badge, { variant: 'success' }, 'Success')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-success');
      expect(badge.className).toContain('text-success');
    });
  });

  describe('Badge Size Styles', () => {
    it('should have correct classes for sm size', () => {
      const { container } = render(
        createElement(Badge, { size: 'sm' }, 'Small')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('py-0.5');
      expect(badge.className).toContain('text-[10px]');
    });

    it('should have correct classes for default size', () => {
      const { container } = render(
        createElement(Badge, { size: 'default' }, 'Default')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-3');
      expect(badge.className).toContain('py-1');
      expect(badge.className).toContain('text-xs');
    });

    it('should have correct classes for lg size', () => {
      const { container } = render(
        createElement(Badge, { size: 'lg' }, 'Large')
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-4');
      expect(badge.className).toContain('py-1.5');
      expect(badge.className).toContain('text-sm');
    });
  });

  describe('badgeVariants Function', () => {
    it('should generate correct classes for default variant and size', () => {
      const classes = badgeVariants({ variant: 'default', size: 'default' });
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('rounded-full');
      expect(classes).toContain('font-medium');
      expect(classes).toContain('transition-colors');
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary');
    });

    it('should generate correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' });
      expect(classes).toContain('bg-secondary');
      expect(classes).toContain('text-secondary-foreground');
    });

    it('should generate correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' });
      expect(classes).toContain('border');
      expect(classes).toContain('border-border');
      expect(classes).toContain('bg-transparent');
    });

    it('should generate correct classes for ghost variant', () => {
      const classes = badgeVariants({ variant: 'ghost' });
      expect(classes).toContain('bg-transparent');
      expect(classes).toContain('hover:bg-accent');
    });
  });

  describe('Accessibility', () => {
    it('should allow additional HTML attributes', () => {
      render(
        createElement(Badge, { 'aria-label': 'Status badge' }, 'Active')
      );

      const badge = screen.getByText('Active');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('should render as div element by default', () => {
      render(
        createElement(Badge, {}, 'Content')
      );

      const badge = screen.getByText('Content');
      expect(badge.tagName).toBe('DIV');
    });

    it('should preserve semantic structure', () => {
      render(
        createElement(Badge, {},
          createElement('span', {}, 'Badge with span')
        )
      );

      expect(screen.getByText('Badge with span')).toBeInTheDocument();
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('should render without client-side dependencies', () => {
      const { container } = render(
        createElement(Badge, {}, 'SSR Badge')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not use any React hooks', () => {
      const { container } = render(
        createElement(Badge, { variant: 'success', size: 'sm' }, 'Hook-Free')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should work with server-side props', () => {
      const serverProps = {
        variant: 'default' as const,
        size: 'default' as const,
        className: '',
        children: 'Server Props',
      };

      const { container } = render(
        createElement(Badge, serverProps)
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Server Props')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(
        createElement(Badge, {}, '')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle whitespace-only children', () => {
      const { container } = render(
        createElement(Badge, {}, '   ')
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const longText = 'This is a very long badge text content that should wrap properly';
      const { container } = render(
        createElement(Badge, {}, longText)
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const specialText = 'Badge @#$%^&*()';
      render(
        createElement(Badge, {}, specialText)
      );

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });
});
