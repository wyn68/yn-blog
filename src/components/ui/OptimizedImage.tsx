"use client";

import { useState, useContext } from "react";
import Image from "next/image";
import { ThemeContext } from "@/contexts/ThemeContext";

const DEFAULT_FEATURED_IMAGE = "/YN-Blog.png";

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

function hasImageExtension(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowerUrl.includes(ext));
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  placeholderSrc?: string;
  onClick?: () => void;
  loading?: "lazy" | "eager";
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  width?: number | string;
  height?: number | string;
  /** 当图片加载失败时的回退图片地址 */
  fallbackSrc?: string;
}

const LIGHT_BLUR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb' filter='url(%23g)'/%3E%3C/svg%3E";
const DARK_BLUR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%231f2937' filter='url(%23g)'/%3E%3C/svg%3E";

export function OptimizedImage({
  src,
  alt,
  className = "",
  fill = false,
  sizes = "100vw",
  priority = false,
  aspectRatio,
  placeholderSrc,
  onClick,
  loading = priority ? "eager" : "lazy",
  quality = 80,
  onLoad: externalOnLoad,
  onError: externalOnError,
  width,
  height,
  fallbackSrc = DEFAULT_FEATURED_IMAGE,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext ? themeContext.theme === "dark" : false;

  const resolvedPlaceholder = placeholderSrc ?? (isDark ? DARK_BLUR_PLACEHOLDER : LIGHT_BLUR_PLACEHOLDER);
  
  const useNativeImg = !hasImageExtension(src);

  const handleLoad = () => {
    setIsLoaded(true);
    externalOnLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc === src) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoaded(false);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
    externalOnError?.();
  };

  if (hasError) {
    return (
      <div
        className={`relative bg-muted flex items-center justify-center overflow-hidden ${className}`}
        style={{
          ...(aspectRatio ? { aspectRatio } : {}),
          ...(width && !fill ? { width: typeof width === "number" ? `${width}px` : width } : {}),
          ...(height && !fill ? { height: typeof height === "number" ? `${height}px` : height } : {}),
        }}
        onClick={onClick}
      >
        <svg
          className="w-12 h-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  if (useNativeImg) {
    return (
      <div
        className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${className}`}
        style={{
          ...(aspectRatio ? { aspectRatio } : {}),
          ...(width && !fill ? { width: typeof width === "number" ? `${width}px` : width } : {}),
          ...(height && !fill ? { height: typeof height === "number" ? `${height}px` : height } : {}),
        }}
        onClick={onClick}
      >
        {!isLoaded && (
          <div className={`absolute inset-0 animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
            <img
              src={resolvedPlaceholder}
              alt=""
              className="w-full h-full object-cover opacity-60"
              aria-hidden="true"
            />
          </div>
        )}
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-all duration-500 ease-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } object-cover object-center ${fill ? "absolute inset-0 w-full h-full" : ""}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          {...(!fill && width ? { width: typeof width === "number" ? width : undefined } : {})}
          {...(!fill && height ? { height: typeof height === "number" ? height : undefined } : {})}
          style={fill ? { objectFit: 'cover' } : {}}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${className}`}
      style={{
        ...(aspectRatio ? { aspectRatio } : {}),
        ...(width && !fill ? { width: typeof width === "number" ? `${width}px` : width } : {}),
        ...(height && !fill ? { height: typeof height === "number" ? `${height}px` : height } : {}),
      }}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className={`absolute inset-0 animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
          <img
            src={resolvedPlaceholder}
            alt=""
            className="w-full h-full object-cover opacity-60"
            aria-hidden="true"
          />
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        loading={loading}
        className={`transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        } object-cover object-center`}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={resolvedPlaceholder}
        quality={quality}
        width={!fill && width ? (typeof width === "number" ? width : undefined) : undefined}
        height={!fill && height ? (typeof height === "number" ? height : undefined) : undefined}
      />
    </div>
  );
}

export default OptimizedImage;
