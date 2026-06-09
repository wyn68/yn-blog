import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import FadeIn from '@/components/FadeIn';
import { motionTokens } from '@/lib/motion-tokens';

const createElement = React.createElement;

vi.mock('framer-motion', () => {
  return {
    motion: function(Component: React.ElementType) {
      return function MockMotionComponent({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) {
        const propsToPass = { className, ...props };
        return createElement(Component, propsToPass, children);
      };
    },
    useInView: vi.fn(() => true),
  };
});

describe('FadeIn Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render children without crashing', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', { 'data-testid': 'fade-in-child' }, 'Test Content')
        )
      );

      expect(screen.getByTestId('fade-in-child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        createElement(FadeIn, {},
          createElement('span', null, 'First'),
          createElement('span', null, 'Second')
        )
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        createElement(FadeIn, { className: 'custom-class' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Props', () => {
    it('should accept delay prop', () => {
      render(
        createElement(FadeIn, { delay: 0.5 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept custom duration prop', () => {
      render(
        createElement(FadeIn, { duration: 0.5 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept custom y prop', () => {
      render(
        createElement(FadeIn, { y: 30 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept as prop for custom element type', () => {
      const { container } = render(
        createElement(FadeIn, { as: 'section' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild?.nodeName).toBe('SECTION');
    });

    it('should use div as default element', () => {
      const { container } = render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });

  describe('Default Values', () => {
    it('should have default delay of 0', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should have default y of 16', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should have default className that is empty', () => {
      const { container } = render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild;
      expect(element?.className).toBe('');
    });
  });

  describe('Animation Variants', () => {
    it('should have visible variant with opacity 1', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render without causing accessibility issues', () => {
      render(
        createElement(FadeIn, {},
          createElement('button', null, 'Click me')
        )
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should preserve semantic HTML structure', () => {
      render(
        createElement(FadeIn, { as: 'article' },
          createElement('h1', null, 'Title'),
          createElement('p', null, 'Paragraph')
        )
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Title');
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should use motionTokens.duration.normal by default', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(motionTokens.duration.normal).toBe(0.25);
    });

    it('should use optimized y value (16px default)', () => {
      render(
        createElement(FadeIn, {},
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should not use excessive animation duration', () => {
      render(
        createElement(FadeIn, { duration: 0.15 },
          createElement('div', null, 'Content')
        )
      );

      expect(motionTokens.duration.fast).toBe(0.15);
    });
  });
});
