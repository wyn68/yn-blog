"use client";

import type { BannerConfig, SiteStats } from "@/lib/banner-config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useMemo, useState, useCallback } from "react";

interface HeroBannerServerProps {
  config: BannerConfig;
  stats: SiteStats;
  currentIndex: number;
  loadedIndices: Set<number>;
}

const DEFAULT_STAT_ITEMS = [
  { label: "文章", valueKey: "posts" as const },
  { label: "分类", valueKey: "categories" as const },
  { label: "标签", valueKey: "tags" as const },
  { label: "更新", valueKey: "lastUpdated" as const, isText: true },
] as const;

export function HeroBannerServer({ config, stats, currentIndex, loadedIndices }: HeroBannerServerProps) {
  const hasImages = config.images.length > 0;
  const currentImage = hasImages ? config.images[currentIndex] : null;
  
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const statItems = useMemo(() => {
    return DEFAULT_STAT_ITEMS.map((item) => ({
      ...item,
      value: stats[item.valueKey],
    })) as Array<{ label: string; valueKey: keyof SiteStats; value: string | number; isText?: true }>;
  }, [stats]);

  const shouldLoadImage = useCallback((index: number) => loadedIndices.has(index), [loadedIndices]);
  
  const handleImageError = useCallback((imageId: number) => {
    setFailedImages(prev => {
      if (prev.has(imageId)) return prev;
      return new Set(prev).add(imageId);
    });
    console.warn(`Hero banner image failed to load: ${imageId}`);
  }, []);

  const handleImageRetry = useCallback((imageId: number) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl overflow-hidden h-[42vh] max-h-[280px] sm:max-h-[360px] md:max-h-[420px] lg:max-h-[500px] xl:max-h-[560px] animate-fade-in card-elevated">
        <div className="absolute inset-0 bg-card" />

        {!hasImages ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 xs:w-14 sm:w-16 md:w-18 border-[3px] rounded-full animate-spin border-muted-foreground/30" />
              <div className="absolute inset-0 border-[3px] rounded-full animate-spin border-muted-foreground/50 border-t-transparent" style={{ animationDuration: '0.8s' }} />
            </div>
            <span className="text-sm sm:text-base tracking-wide mt-4 animate-pulse text-muted-foreground">
              加载中...
            </span>
          </div>
        ) : (
          <div className="absolute inset-0">
            {config.images.map((image, index) => {
              const isActive = index === currentIndex;
              const hasFailed = failedImages.has(image.id);
              const shouldLoad = shouldLoadImage(index);
              
              return (
                <div
                  key={image.id}
                  className="absolute inset-0 transition-[opacity,transform] duration-1000 ease-out will-change-opacity hover:scale-105 origin-center will-change-transform"
                  style={{
                    opacity: isActive ? 1 : 0,
                    zIndex: isActive ? 10 : 5,
                  }}
                >
                  {shouldLoad && !hasFailed ? (
                    <div className="absolute inset-0">
                      <OptimizedImage
                        src={encodeURI(image.url)}
                        alt={image.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        quality={90}
                        onError={() => handleImageError(image.id)}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm sm:text-base text-muted-foreground">图片加载失败</span>
                          {hasFailed && (
                            <button
                              onClick={() => handleImageRetry(image.id)}
                              className="block mx-auto text-sm sm:text-base text-primary hover:underline"
                            >
                              重试
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 -100px 100px rgba(0,0,0,0.4), inset 0 100px 100px rgba(0,0,0,0.2)'
        }} />

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <div className="absolute bottom-6 left-4 xs:bottom-8 xs:left-5 sm:bottom-10 sm:left-6 md:bottom-12 md:left-8 lg:bottom-14 lg:left-10 xl:bottom-16 xl:left-12 z-20 pointer-events-none">
          <div className="animate-slide-up">
            <span className="inline-block px-2.5 py-0.5 xs:px-3 xs:py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 lg:px-6 lg:py-2 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold tracking-[0.2em] uppercase mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 backdrop-blur-md bg-gradient-to-r from-white/20 to-white/10 border border-white/30 text-white/95 shadow-md">
              {config.tag}
            </span>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-3 md:mb-4 tracking-tight text-white leading-none drop-shadow-2xl">
              {currentImage?.title || config.title}
            </h1>

            <p className="block text-sm xs:text-base sm:text-lg md:text-xl max-w-[240px] xs:max-w-xs sm:max-w-sm md:max-w-md leading-relaxed text-white/90 font-normal drop-shadow-md">
              {currentImage?.subtitle || config.subtitle}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 xs:bottom-5 xs:right-5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 xl:bottom-12 xl:right-12 z-20 pointer-events-none">
          <div className="hidden md:flex items-center gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl backdrop-blur-xl bg-white/15 border border-white/20 shadow-lg shadow-black/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.1) 100%)',
            }}
          >
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="text-xs text-white/90 font-medium mb-0.5">{item.label}</span>
                <span className={`text-lg font-bold ${item.isText ? 'text-xs text-white/90' : 'text-white'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-px left-1/4 right-1/4 h-px animate-fade-in bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="absolute -bottom-20 sm:-bottom-24 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-56 sm:h-72 rounded-full pointer-events-none animate-pulse-slow hidden lg:block bg-gradient-radial from-white/18 to-transparent" />
    </div>
  );
}