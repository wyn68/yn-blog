import { Variants, Transition } from "framer-motion";

type EasingType = [number, number, number, number];

const easeDefault: EasingType = [0.4, 0, 0.2, 1];
const easeSmooth: EasingType = [0.22, 1, 0.36, 1];
const easeEnter: EasingType = [0.0, 0, 0.2, 1];
const easeExit: EasingType = [0.4, 0, 1, 1];
const easeBounce: EasingType = [0.34, 1.56, 0.64, 1];

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: easeDefault,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: easeSmooth,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: easeSmooth,
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: easeSmooth,
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: easeSmooth,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: easeBounce,
    },
  },
};

export const scaleInCenter: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: easeBounce,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeEnter,
    },
  },
};

export const slideOutToBottom: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.15,
      ease: easeExit,
    },
  },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easeSmooth,
    },
  },
};

export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.15,
    ease: easeDefault,
  },
};

export const hoverLift = {
  y: -2,
  transition: {
    duration: 0.15,
    ease: easeDefault,
  },
};

export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: easeDefault,
  },
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const gentleSpringTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};
