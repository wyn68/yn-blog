"use client";

import { memo, forwardRef, useRef, type MutableRefObject } from "react";
import { motion, useInView } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  as?: React.ElementType;
}

const FadeIn = memo(forwardRef<HTMLElement, FadeInProps>(function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.25,
  y = 16,
  className = "",
  as: As = 'div',
}, ref) {
  const innerRef = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>;
  const isInView = useInView(innerRef, { once: true, margin: "-50px" });

  const MotionComponent = motion.create(As as any);

  return (
    <MotionComponent
      ref={(node: HTMLElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLElement | null>).current = node;
        }
      }}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: y },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: duration,
            delay: delay,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
          }
        }
      }}
    >
      {children}
    </MotionComponent>
  );
}));

export default FadeIn;
