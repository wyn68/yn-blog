import type { Easing } from "framer-motion";

const tokens: {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    page: number;
  };
  easing: {
    default: Easing;
    enter: Easing;
    exit: Easing;
    bounce: Easing;
    smooth: Easing;
  };
  stagger: {
    fast: number;
    normal: number;
    slow: number;
  };
  constraints: {
    maxBlur: number;
    maxScale: number;
    maxY: number;
    maxRotation: number;
  };
  blur: {
    backdrop: {
      sm: number;
      md: number;
      lg: number;
    };
    text: {
      sm: number;
      md: number;
    };
  };
  mobile: {
    disableBlur: boolean;
    reduceAnimations: boolean;
    simplifyScale: boolean;
  };
} = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    page: 0.6,
  },
  easing: {
    default: [0.4, 0, 0.2, 1],
    enter: [0.0, 0, 0.2, 1],
    exit: [0.4, 0, 1, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    smooth: [0.22, 1, 0.36, 1],
  },
  stagger: {
    fast: 0.03,
    normal: 0.05,
    slow: 0.08,
  },
  constraints: {
    maxBlur: 24,
    maxScale: 1.02,
    maxY: -2,
    maxRotation: 3,
  },
  blur: {
    backdrop: {
      sm: 8,
      md: 16,
      lg: 24,
    },
    text: {
      sm: 2,
      md: 4,
    },
  },
  mobile: {
    disableBlur: true,
    reduceAnimations: true,
    simplifyScale: true,
  },
};

Object.freeze(tokens);
Object.freeze(tokens.duration);
Object.freeze(tokens.easing);
Object.freeze(tokens.stagger);
Object.freeze(tokens.constraints);
Object.freeze(tokens.blur);
Object.freeze(tokens.blur.backdrop);
Object.freeze(tokens.blur.text);
Object.freeze(tokens.mobile);

export const motionTokens = tokens;

export type MotionDuration = keyof typeof motionTokens.duration;
export type MotionEasing = keyof typeof motionTokens.easing;
export type MotionStagger = keyof typeof motionTokens.stagger;
