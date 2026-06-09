"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function MouseGlow() {
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const { theme, isClient } = useTheme();
  const effectiveTheme = isClient ? theme : "light";
  const isDark = effectiveTheme === "dark";
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setIsActive(true);
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [x, y, isMobile]);

  if (isMobile || !isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: mouseX,
          top: mouseY,
          background: isDark 
            ? 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 25%, transparent 60%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 25%, transparent 60%)',
          opacity: isActive ? 1 : 0,
          willChange: 'transform, opacity',
        }}
        transition={{
          opacity: { duration: 0.3 },
        }}
      />
    </div>
  );
}
