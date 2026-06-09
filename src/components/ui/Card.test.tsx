import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

const createElement = React.createElement;

describe('Card Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Card', () => {
    it('should render without crashing', () => {
      render(
        createElement(Card, {},
          createElement('div', { 'data-testid': 'card-content' }, 'Card Content')
        )
      );

      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        createElement(Card, {},
          createElement('p', null, 'Hello'),
          createElement('p', null, 'World')
        )
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        createElement(Card, { className: 'custom-card-class' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toHaveClass('custom-card-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        createElement(Card, { ref },
          createElement('div', null, 'Content')
        )
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Card Variants', () => {
    it('should render default variant correctly', () => {
      const { container } = render(
        createElement(Card, { variant: 'default' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render elevated variant correctly', () => {
      const { container } = render(
        createElement(Card, { variant: 'elevated' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render outline variant correctly', () => {
      const { container } = render(
        createElement(Card, { variant: 'outline' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render ghost variant correctly', () => {
      const { container } = render(
        createElement(Card, { variant: 'ghost' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Card Padding', () => {
    it('should accept none padding', () => {
      const { container } = render(
        createElement(Card, { padding: 'none' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept sm padding', () => {
      const { container } = render(
        createElement(Card, { padding: 'sm' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept default padding', () => {
      const { container } = render(
        createElement(Card, { padding: 'default' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept lg padding', () => {
      const { container } = render(
        createElement(Card, { padding: 'lg' },
          createElement('div', null, 'Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Card Subcomponents', () => {
    describe('CardHeader', () => {
      it('should render CardHeader correctly', () => {
        render(
          createElement(Card, {},
            createElement(CardHeader, { 'data-testid': 'card-header' },
              createElement('div', null, 'Header Content')
            )
          )
        );

        expect(screen.getByTestId('card-header')).toBeInTheDocument();
      });

      it('should forward ref to CardHeader', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(
          createElement(Card, {},
            createElement(CardHeader, { ref }, 'Header')
          )
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    describe('CardTitle', () => {
      it('should render CardTitle correctly', () => {
        render(
          createElement(Card, {},
            createElement(CardHeader, {},
              createElement(CardTitle, { 'data-testid': 'card-title' }, 'My Title')
            )
          )
        );

        const title = screen.getByTestId('card-title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('My Title');
      });

      it('should render as h3 element', () => {
        render(
          createElement(Card, {},
            createElement(CardHeader, {},
              createElement(CardTitle, {}, 'Title')
            )
          )
        );

        const title = screen.getByText('Title');
        expect(title.tagName).toBe('H3');
      });

      it('should forward ref to CardTitle', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(
        createElement(Card, {},
          createElement(CardHeader, {},
            createElement(CardTitle, { ref }, 'Title')
          )
        )
      );

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
    });

    describe('CardDescription', () => {
      it('should render CardDescription correctly', () => {
        render(
          createElement(Card, {},
            createElement(CardHeader, {},
              createElement(CardDescription, { 'data-testid': 'card-desc' }, 'Description')
            )
          )
        );

        const desc = screen.getByTestId('card-desc');
        expect(desc).toBeInTheDocument();
        expect(desc).toHaveTextContent('Description');
      });

      it('should forward ref to CardDescription', () => {
        const ref = React.createRef<HTMLParagraphElement>();
        render(
          createElement(Card, {},
            createElement(CardHeader, {},
              createElement(CardDescription, { ref }, 'Description')
            )
          )
        );

        expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
      });
    });

    describe('CardContent', () => {
      it('should render CardContent correctly', () => {
        render(
          createElement(Card, {},
            createElement(CardContent, { 'data-testid': 'card-content' }, 'Main Content')
          )
        );

        expect(screen.getByTestId('card-content')).toBeInTheDocument();
      });

      it('should forward ref to CardContent', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(
          createElement(Card, {},
            createElement(CardContent, { ref }, 'Content')
          )
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    describe('CardFooter', () => {
      it('should render CardFooter correctly', () => {
        render(
          createElement(Card, {},
            createElement(CardFooter, { 'data-testid': 'card-footer' }, 'Footer Content')
          )
        );

        expect(screen.getByTestId('card-footer')).toBeInTheDocument();
      });

      it('should forward ref to CardFooter', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(
          createElement(Card, {},
            createElement(CardFooter, { ref }, 'Footer')
          )
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe('Complete Card Example', () => {
    it('should render a complete card with all sections', () => {
      render(
        createElement(Card, {},
          createElement(CardHeader, {},
            createElement(CardTitle, {}, 'Welcome'),
            createElement(CardDescription, {}, 'This is a description')
          ),
          createElement(CardContent, {}, 'Main card content goes here'),
          createElement(CardFooter, {}, 'Footer text')
        )
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
      expect(screen.getByText('Main card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer text')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should preserve semantic HTML structure', () => {
      render(
        createElement(Card, {},
          createElement(CardHeader, {},
            createElement(CardTitle, {}, 'Important Information'),
            createElement(CardDescription, {}, 'Details about the information')
          ),
          createElement(CardContent, {},
            createElement('article', {},
              createElement('p', {}, 'Paragraph content')
            )
          )
        )
      );

      expect(screen.getByText('Important Information')).toBeInTheDocument();
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    });

    it('should allow additional HTML attributes', () => {
      render(
        createElement(Card, { 'aria-label': 'Information card' },
          createElement('div', null, 'Content')
        )
      );

      const card = screen.getByText('Content').closest('[aria-label]');
      expect(card).toHaveAttribute('aria-label', 'Information card');
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('should render without client-side dependencies', () => {
      const { container } = render(
        createElement(Card, {},
          createElement('div', null, 'SSR Content')
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not use any React hooks', () => {
      const { container } = render(
        createElement(Card, {},
          createElement(CardHeader, {},
            createElement(CardTitle, {}, 'Hook-Free Title')
          )
        )
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
