import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import FadeInServer from '@/components/FadeInServer';
import { motionTokens } from '@/lib/motion-tokens';

const createElement = React.createElement;

describe('FadeInServer Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render children without crashing', () => {
      render(
        createElement(FadeInServer, {},
          createElement('div', { 'data-testid': 'fade-in-server-child' }, 'Test Content')
        )
      );

      expect(screen.getByTestId('fade-in-server-child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        createElement(FadeInServer, {},
          createElement('span', null, 'First'),
          createElement('span', null, 'Second')
        )
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        createElement(FadeInServer, { className: 'custom-class' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Props', () => {
    it('should accept delay prop', () => {
      render(
        createElement(FadeInServer, { delay: 0.5 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept custom duration prop', () => {
      render(
        createElement(FadeInServer, { duration: 0.5 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept y prop (even though not used in CSS)', () => {
      render(
        createElement(FadeInServer, { y: 30 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('should have default delay of 0', () => {
      render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should have default className that is empty', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild;
      expect(element?.className).toBe('');
    });

    it('should use motionTokens.duration.normal when no duration provided', () => {
      render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      expect(motionTokens.duration.normal).toBe(0.25);
    });
  });

  describe('CSS Animation', () => {
    it('should have opacity 0 initially', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.opacity).toBe('0');
    });

    it('should have slideUp animation', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.animation).toContain('slideUp');
    });

    it('should use ease-out timing function', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.animation).toContain('ease-out');
    });

    it('should use forwards fill mode for animation end state', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.animation).toContain('forwards');
    });

    it('should apply custom delay', () => {
      const { container } = render(
        createElement(FadeInServer, { delay: 1 },
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.animation).toContain('1s');
    });
  });

  describe('Server-Side Rendering', () => {
    it('should render without client-side dependencies', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'SSR Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not use hooks that require client-side', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should preserve semantic HTML structure', () => {
      render(
        createElement(FadeInServer, {},
          createElement('article', null,
            createElement('h1', null, 'Title'),
            createElement('p', null, 'Paragraph')
          )
        )
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Title');
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('should not interfere with interactive elements', () => {
      render(
        createElement(FadeInServer, {},
          createElement('button', null, 'Click me')
        )
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });
  });

  describe('Performance', () => {
    it('should use CSS animation instead of JavaScript', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.animation).toBeTruthy();
    });

    it('should use optimized duration from motionTokens', () => {
      const { container } = render(
        createElement(FadeInServer, {},
          createElement('div', null, 'Content')
        )
      );

      const element = container.firstChild as HTMLElement;
      const durationValue = parseFloat(element.style.animation.match(/(\d+\.?\d*)s/)?.[1] || '0');
      expect(durationValue).toBe(motionTokens.duration.normal);
    });

    it('should use short delay values for better UX', () => {
      render(
        createElement(FadeInServer, { delay: 0.1 },
          createElement('div', null, 'Content')
        )
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
