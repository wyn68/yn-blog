"use client";

import { useState, useEffect, useCallback } from "react";
import { HeroBannerServer } from "./HeroBannerServer";
import type { BannerConfig, SiteStats } from "@/lib/banner-config";

interface HeroBannerClientWrapperProps {
  config: BannerConfig;
  stats: SiteStats;
}

export function HeroBannerClientWrapper({ config, stats }: HeroBannerClientWrapperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0]));
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (config.images.length <= 1) return;

    const timer = setInterval(() => {
      if (!isHovering) {
        setCurrentIndex((prev) => (prev + 1) % config.images.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isHovering, config.images.length]);

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % config.images.length;
    const prevIndex = (currentIndex - 1 + config.images.length) % config.images.length;
    
    setLoadedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentIndex);
      newSet.add(nextIndex);
      newSet.add(prevIndex);
      return newSet;
    });
  }, [currentIndex, config.images.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
    const nextIdx = (index + 1) % config.images.length;
    const prevIdx = (index - 1 + config.images.length) % config.images.length;
    setLoadedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      newSet.add(nextIdx);
      newSet.add(prevIdx);
      return newSet;
    });
  }, [config.images.length]);

  const hasImages = config.images.length > 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || config.images.length <= 1) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % config.images.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + config.images.length) % config.images.length);
      }
    }
    
    setTouchStart(null);
  }, [touchStart, config.images.length]);

  return (
    <div
      className="relative w-full cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <HeroBannerServer
        config={config}
        stats={stats}
        currentIndex={currentIndex}
        loadedIndices={loadedIndices}
      />

      {hasImages && config.images.length > 1 && (
        <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 
          right-3 xs:right-4 sm:right-5 
          md:left-8 md:right-auto lg:left-10 xl:left-12 z-40">
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-3">
            {config.images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                aria-label={`切换到第 ${index + 1} 张图片`}
                aria-current={index === currentIndex ? "true" : "false"}
                className={`relative w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full text-[9px] xs:text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs font-semibold transition-all ${
                  index === currentIndex
                    ? "bg-white text-[#1f2937] shadow-md scale-105"
                    : "bg-black/30 text-white/80 border border-white/30 hover:bg-black/50"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}