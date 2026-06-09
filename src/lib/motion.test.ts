import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInCenter,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  slideInFromBottom,
  slideOutToBottom,
  pageTransition,
  hoverScale,
  hoverLift,
  tapScale,
  springTransition,
  gentleSpringTransition,
} from '@/lib/motion';
import { motionTokens } from '@/lib/motion-tokens';

describe('motion variants', () => {
  describe('fadeIn', () => {
    it('should have hidden state with opacity 0', () => {
      expect(fadeIn.hidden).toEqual({ opacity: 0 });
    });

    it('should have visible state with opacity 1', () => {
      expect(fadeIn.visible).toHaveProperty('opacity', 1);
    });

    it('should have transition with correct duration', () => {
      expect(fadeIn.visible.transition).toHaveProperty('duration', motionTokens.duration.normal);
    });

    it('should have transition with correct easing', () => {
      expect(fadeIn.visible.transition).toHaveProperty('ease', motionTokens.easing.default);
    });
  });

  describe('fadeInUp', () => {
    it('should have hidden state with opacity 0 and y offset', () => {
      expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 20 });
    });

    it('should have visible state with opacity 1 and y 0', () => {
      expect(fadeInUp.visible).toHaveProperty('opacity', 1);
      expect(fadeInUp.visible).toHaveProperty('y', 0);
    });

    it('should have transition with smooth easing', () => {
      expect(fadeInUp.visible.transition).toHaveProperty('ease', motionTokens.easing.smooth);
    });

    it('should have transition with normal duration', () => {
      expect(fadeInUp.visible.transition).toHaveProperty('duration', motionTokens.duration.normal);
    });
  });

  describe('fadeInDown', () => {
    it('should have hidden state with negative y offset', () => {
      expect(fadeInDown.hidden).toEqual({ opacity: 0, y: -20 });
    });

    it('should have visible state with y 0', () => {
      expect(fadeInDown.visible).toHaveProperty('y', 0);
    });
  });

  describe('fadeInLeft', () => {
    it('should have hidden state with negative x offset', () => {
      expect(fadeInLeft.hidden).toEqual({ opacity: 0, x: -20 });
    });

    it('should have visible state with x 0', () => {
      expect(fadeInLeft.visible).toHaveProperty('x', 0);
    });
  });

  describe('fadeInRight', () => {
    it('should have hidden state with positive x offset', () => {
      expect(fadeInRight.hidden).toEqual({ opacity: 0, x: 20 });
    });

    it('should have visible state with x 0', () => {
      expect(fadeInRight.visible).toHaveProperty('x', 0);
    });
  });

  describe('scaleIn', () => {
    it('should have hidden state with scale 0.95', () => {
      expect(scaleIn.hidden).toEqual({ opacity: 0, scale: 0.95 });
    });

    it('should have visible state with scale 1', () => {
      expect(scaleIn.visible).toHaveProperty('scale', 1);
    });

    it('should have transition with bounce easing', () => {
      expect(scaleIn.visible.transition).toHaveProperty('ease', motionTokens.easing.bounce);
    });

    it('should have transition with fast duration', () => {
      expect(scaleIn.visible.transition).toHaveProperty('duration', motionTokens.duration.fast);
    });
  });

  describe('scaleInCenter', () => {
    it('should have hidden state with scale 0.8', () => {
      expect(scaleInCenter.hidden).toEqual({ opacity: 0, scale: 0.8 });
    });

    it('should have transition with normal duration', () => {
      expect(scaleInCenter.visible.transition).toHaveProperty('duration', motionTokens.duration.normal);
    });
  });

  describe('staggerContainer', () => {
    it('should have correct staggerChildren', () => {
      expect(staggerContainer.visible.transition).toHaveProperty('staggerChildren', motionTokens.stagger.normal);
    });

    it('should have correct delayChildren', () => {
      expect(staggerContainer.visible.transition).toHaveProperty('delayChildren', 0.1);
    });
  });

  describe('staggerContainerFast', () => {
    it('should have fast staggerChildren', () => {
      expect(staggerContainerFast.visible.transition).toHaveProperty('staggerChildren', motionTokens.stagger.fast);
    });

    it('should have faster delayChildren', () => {
      expect(staggerContainerFast.visible.transition).toHaveProperty('delayChildren', 0.05);
    });
  });

  describe('staggerContainerSlow', () => {
    it('should have slow staggerChildren', () => {
      expect(staggerContainerSlow.visible.transition).toHaveProperty('staggerChildren', motionTokens.stagger.slow);
    });

    it('should have slower delayChildren', () => {
      expect(staggerContainerSlow.visible.transition).toHaveProperty('delayChildren', 0.15);
    });
  });

  describe('slideInFromBottom', () => {
    it('should have hidden state with large y offset', () => {
      expect(slideInFromBottom.hidden).toEqual({ opacity: 0, y: 50 });
    });

    it('should have visible state with y 0', () => {
      expect(slideInFromBottom.visible).toHaveProperty('y', 0);
    });

    it('should have transition with slow duration', () => {
      expect(slideInFromBottom.visible.transition).toHaveProperty('duration', motionTokens.duration.slow);
    });

    it('should have transition with enter easing', () => {
      expect(slideInFromBottom.visible.transition).toHaveProperty('ease', motionTokens.easing.enter);
    });
  });

  describe('slideOutToBottom', () => {
    it('should have hidden state starting from y 0', () => {
      expect(slideOutToBottom.hidden).toEqual({ opacity: 0, y: 0 });
    });

    it('should have visible state with y 50', () => {
      expect(slideOutToBottom.visible).toHaveProperty('y', 50);
    });
  });

  describe('pageTransition', () => {
    it('should have page duration', () => {
      expect(pageTransition.visible.transition).toHaveProperty('duration', motionTokens.duration.page);
    });

    it('should have smooth easing', () => {
      expect(pageTransition.visible.transition).toHaveProperty('ease', motionTokens.easing.smooth);
    });
  });
});

describe('hover animations', () => {
  describe('hoverScale', () => {
    it('should scale to 1.02', () => {
      expect(hoverScale).toHaveProperty('scale', 1.02);
    });

    it('should have fast duration', () => {
      expect(hoverScale.transition).toHaveProperty('duration', motionTokens.duration.fast);
    });

    it('should have default easing', () => {
      expect(hoverScale.transition).toHaveProperty('ease', motionTokens.easing.default);
    });

    it('should respect maxScale constraint', () => {
      expect(hoverScale.scale).toBeLessThanOrEqual(motionTokens.constraints.maxScale);
    });
  });

  describe('hoverLift', () => {
    it('should lift by -2', () => {
      expect(hoverLift).toHaveProperty('y', -2);
    });

    it('should have fast duration', () => {
      expect(hoverLift.transition).toHaveProperty('duration', motionTokens.duration.fast);
    });

    it('should respect maxY constraint', () => {
      expect(hoverLift.y).toBeGreaterThanOrEqual(motionTokens.constraints.maxY);
    });
  });

  describe('tapScale', () => {
    it('should scale to 0.98', () => {
      expect(tapScale).toHaveProperty('scale', 0.98);
    });

    it('should have instant duration', () => {
      expect(tapScale.transition).toHaveProperty('duration', motionTokens.duration.instant);
    });
  });
});

describe('spring transitions', () => {
  describe('springTransition', () => {
    it('should have type spring', () => {
      expect(springTransition).toHaveProperty('type', 'spring');
    });

    it('should have stiffness 300', () => {
      expect(springTransition).toHaveProperty('stiffness', 300);
    });

    it('should have damping 30', () => {
      expect(springTransition).toHaveProperty('damping', 30);
    });
  });

  describe('gentleSpringTransition', () => {
    it('should have type spring', () => {
      expect(gentleSpringTransition).toHaveProperty('type', 'spring');
    });

    it('should have lower stiffness than springTransition', () => {
      expect(gentleSpringTransition.stiffness).toBeLessThan(springTransition.stiffness);
    });

    it('should have lower damping than springTransition', () => {
      expect(gentleSpringTransition.damping).toBeLessThan(springTransition.damping);
    });
  });
});

describe('performance optimizations', () => {
  it('should not use high duration values for hover animations', () => {
    const maxHoverDuration = motionTokens.duration.fast;
    expect(hoverScale.transition.duration).toBeLessThanOrEqual(maxHoverDuration);
    expect(hoverLift.transition.duration).toBeLessThanOrEqual(maxHoverDuration);
  });

  it('should use GPU-friendly properties (opacity, scale, transform)', () => {
    const gpuFriendlyProps = ['opacity', 'scale', 'x', 'y', 'rotate'];
    
    const motionProps = [
      ...Object.keys(fadeInUp.hidden),
      ...Object.keys(fadeInUp.visible).filter(k => k !== 'transition'),
      ...Object.keys(scaleIn.hidden),
      ...Object.keys(scaleIn.visible).filter(k => k !== 'transition'),
      ...Object.keys(hoverScale).filter(k => k !== 'transition'),
      ...Object.keys(hoverLift).filter(k => k !== 'transition'),
    ];
    
    motionProps.forEach((prop) => {
      expect(gpuFriendlyProps).toContain(prop);
    });
  });

  it('should use constraint values for scale', () => {
    expect(hoverScale.scale).toBeLessThanOrEqual(motionTokens.constraints.maxScale);
  });

  it('should use constraint values for Y offset', () => {
    if (hoverLift.y !== undefined) {
      expect(hoverLift.y).toBeGreaterThanOrEqual(motionTokens.constraints.maxY);
    }
  });
});
