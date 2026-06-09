"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SCROLL_THRESHOLD = 300;
const SCROLL_DURATION = 500;
const DEBOUNCE_DELAY = 150;

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    }
  }, [isScrolling]);

  useEffect(() => {
    const debouncedScrollHandler = debounce(handleScroll, DEBOUNCE_DELAY);
    window.addEventListener("scroll", debouncedScrollHandler, { passive: true });
    return () =>
      window.removeEventListener("scroll", debouncedScrollHandler);
  }, [handleScroll]);

  useEffect(() => {
    if (isScrolling) {
      const checkScrollComplete = () => {
        if (window.scrollY === 0) {
          setIsVisible(false);
          setIsScrolling(false);
          window.removeEventListener("scroll", checkScrollComplete);
        }
      };
      window.addEventListener("scroll", checkScrollComplete, { passive: true });
      return () =>
        window.removeEventListener("scroll", checkScrollComplete);
    }
  }, [isScrolling]);

  const scrollToTop = () => {
    setIsScrolling(true);
    const startY = window.scrollY;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / SCROLL_DURATION, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      window.scrollTo({
        top: startY * (1 - easeOutQuart),
        behavior: "instant",
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <Button
      onClick={scrollToTop}
      variant="default"
      size="icon"
      className={`fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="返回顶部"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
