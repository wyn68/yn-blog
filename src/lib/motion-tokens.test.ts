import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { motionTokens } from '@/lib/motion-tokens';

describe('motionTokens', () => {
  describe('duration', () => {
    it('should have correct instant duration (0.1s)', () => {
      expect(motionTokens.duration.instant).toBe(0.1);
    });

    it('should have correct fast duration (0.15s)', () => {
      expect(motionTokens.duration.fast).toBe(0.15);
    });

    it('should have correct normal duration (0.25s)', () => {
      expect(motionTokens.duration.normal).toBe(0.25);
    });

    it('should have correct slow duration (0.4s)', () => {
      expect(motionTokens.duration.slow).toBe(0.4);
    });

    it('should have correct page duration (0.6s)', () => {
      expect(motionTokens.duration.page).toBe(0.6);
    });

    it('should have all required duration keys', () => {
      const durationKeys = ['instant', 'fast', 'normal', 'slow', 'page'];
      durationKeys.forEach((key) => {
        expect(motionTokens.duration).toHaveProperty(key);
      });
    });

    it('should have duration values in ascending order', () => {
      const values = Object.values(motionTokens.duration);
      const sortedValues = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sortedValues);
    });
  });

  describe('easing', () => {
    it('should have default easing with 4 values', () => {
      expect(motionTokens.easing.default).toHaveLength(4);
      expect(motionTokens.easing.default).toEqual([0.4, 0, 0.2, 1]);
    });

    it('should have enter easing with 4 values', () => {
      expect(motionTokens.easing.enter).toHaveLength(4);
      expect(motionTokens.easing.enter).toEqual([0.0, 0, 0.2, 1]);
    });

    it('should have exit easing with 4 values', () => {
      expect(motionTokens.easing.exit).toHaveLength(4);
      expect(motionTokens.easing.exit).toEqual([0.4, 0, 1, 1]);
    });

    it('should have bounce easing with 4 values', () => {
      expect(motionTokens.easing.bounce).toHaveLength(4);
      expect(motionTokens.easing.bounce).toEqual([0.34, 1.56, 0.64, 1]);
    });

    it('should have smooth easing with 4 values', () => {
      expect(motionTokens.easing.smooth).toHaveLength(4);
      expect(motionTokens.easing.smooth).toEqual([0.22, 1, 0.36, 1]);
    });

    it('should have all required easing keys', () => {
      const easingKeys = ['default', 'enter', 'exit', 'bounce', 'smooth'];
      easingKeys.forEach((key) => {
        expect(motionTokens.easing).toHaveProperty(key);
      });
    });

    it('should have all easing values as arrays of 4 numbers', () => {
      Object.values(motionTokens.easing).forEach((easing) => {
        expect(Array.isArray(easing)).toBe(true);
        expect(easing).toHaveLength(4);
        easing.forEach((value) => {
          expect(typeof value).toBe('number');
        });
      });
    });
  });

  describe('stagger', () => {
    it('should have fast stagger (0.03s)', () => {
      expect(motionTokens.stagger.fast).toBe(0.03);
    });

    it('should have normal stagger (0.05s)', () => {
      expect(motionTokens.stagger.normal).toBe(0.05);
    });

    it('should have slow stagger (0.08s)', () => {
      expect(motionTokens.stagger.slow).toBe(0.08);
    });

    it('should have stagger values in ascending order', () => {
      const values = Object.values(motionTokens.stagger);
      const sortedValues = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sortedValues);
    });
  });

  describe('constraints', () => {
    it('should have maxBlur of 24', () => {
      expect(motionTokens.constraints.maxBlur).toBe(24);
    });

    it('should have maxScale of 1.02', () => {
      expect(motionTokens.constraints.maxScale).toBe(1.02);
    });

    it('should have maxY of -2', () => {
      expect(motionTokens.constraints.maxY).toBe(-2);
    });

    it('should have maxRotation of 3', () => {
      expect(motionTokens.constraints.maxRotation).toBe(3);
    });
  });

  describe('blur', () => {
    describe('backdrop', () => {
      it('should have backdrop.sm blur of 8', () => {
        expect(motionTokens.blur.backdrop.sm).toBe(8);
      });

      it('should have backdrop.md blur of 16', () => {
        expect(motionTokens.blur.backdrop.md).toBe(16);
      });

      it('should have backdrop.lg blur of 24', () => {
        expect(motionTokens.blur.backdrop.lg).toBe(24);
      });

      it('should have backdrop blur values in ascending order', () => {
        const values = Object.values(motionTokens.blur.backdrop);
        const sortedValues = [...values].sort((a, b) => a - b);
        expect(values).toEqual(sortedValues);
      });

      it('should not exceed maxBlur constraint', () => {
        Object.values(motionTokens.blur.backdrop).forEach((value) => {
          expect(value).toBeLessThanOrEqual(motionTokens.constraints.maxBlur);
        });
      });
    });

    describe('text', () => {
      it('should have text.sm blur of 2', () => {
        expect(motionTokens.blur.text.sm).toBe(2);
      });

      it('should have text.md blur of 4', () => {
        expect(motionTokens.blur.text.md).toBe(4);
      });

      it('should have text blur values in ascending order', () => {
        const values = Object.values(motionTokens.blur.text);
        const sortedValues = [...values].sort((a, b) => a - b);
        expect(values).toEqual(sortedValues);
      });
    });
  });

  describe('mobile', () => {
    it('should disable blur on mobile', () => {
      expect(motionTokens.mobile.disableBlur).toBe(true);
    });

    it('should reduce animations on mobile', () => {
      expect(motionTokens.mobile.reduceAnimations).toBe(true);
    });

    it('should simplify scale on mobile', () => {
      expect(motionTokens.mobile.simplifyScale).toBe(true);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(motionTokens)).toBe(true);
    });

    it('should have frozen nested objects', () => {
      expect(Object.isFrozen(motionTokens.duration)).toBe(true);
      expect(Object.isFrozen(motionTokens.easing)).toBe(true);
      expect(Object.isFrozen(motionTokens.stagger)).toBe(true);
      expect(Object.isFrozen(motionTokens.constraints)).toBe(true);
      expect(Object.isFrozen(motionTokens.blur)).toBe(true);
      expect(Object.isFrozen(motionTokens.mobile)).toBe(true);
    });
  });
});
