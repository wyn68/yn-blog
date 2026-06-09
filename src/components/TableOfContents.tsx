"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TOCListProps {
  tocItems: TocItem[];
  activeId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (id: string) => void;
  variant: "desktop" | "mobile";
  defaultExpanded?: boolean;
}

function TOCList({
  tocItems,
  activeId,
  isExpanded,
  onToggle,
  onItemClick,
  variant,
}: TOCListProps) {
  const getIndentClass = (level: number, isActive: boolean) => {
    switch (level) {
      case 1:
        return isActive ? "pl-2" : "pl-3";
      case 2:
        return isActive ? "pl-6" : "pl-7";
      case 3:
        return isActive ? "pl-10" : "pl-11";
      default:
        return isActive ? "pl-2" : "pl-3";
    }
  };

  const getFontWeight = (level: number) => {
    return level <= 2 ? "font-semibold" : "font-normal";
  };

  const containerClass = variant === "desktop"
    ? "hidden lg:block fixed right-4 top-24 w-[280px] z-40"
    : "lg:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end";

  const cardClass = variant === "desktop"
    ? "card p-4 shadow-sm"
    : "card p-2 shadow-lg w-14 h-14 flex items-center justify-center";

  const headerClass = variant === "desktop"
    ? "text-foreground font-semibold mb-3"
    : "hidden";

  const navClass = variant === "desktop"
    ? "space-y-1 max-h-[60vh] overflow-y-auto"
    : "card p-3 shadow-lg mb-2 w-64 space-y-1 max-h-[50vh] overflow-y-auto";

  const itemClass = variant === "desktop"
    ? "block w-full text-left transition-colors text-sm"
    : "block w-full text-left transition-colors py-1 text-sm px-2 rounded hover:bg-muted";

  if (variant === "mobile") {
    return (
      <div className={containerClass}>
        {isExpanded && (
          <nav className={navClass}>
            <div className="text-foreground font-semibold text-sm mb-2 pb-2 border-b">文章目录</div>
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id);
                  onToggle();
                }}
                className={`${itemClass} ${getIndentClass(item.level, activeId === item.id)} ${
                  activeId === item.id
                    ? "border-l-2 border-foreground bg-muted"
                    : "border-l-2 border-transparent"
                } ${getFontWeight(item.level)}`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
        <div className={cardClass}>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center hover:text-primary transition-colors"
            aria-label="文章目录"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-foreground" />
            ) : (
              <List className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between hover:text-primary transition-colors ${headerClass}`}
        >
          <span>文章目录</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <nav className={navClass}>
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={`${itemClass} ${getIndentClass(item.level, activeId === item.id)} ${
                  activeId === item.id
                    ? "border-l-2 border-foreground"
                    : "border-l-2 border-transparent"
                } ${getFontWeight(item.level)}`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export default function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const headings = document.querySelectorAll("article h1, article h2, article h3");
    const items: TocItem[] = [];
    
    headings.forEach((heading) => {
      const id = heading.id || `heading-${Math.random().toString(36).slice(2, 11)}`;
      heading.id = id;
      
      items.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.replace("H", "")),
      });
    });
    
    setTocItems(items);
  }, []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -40% 0px",
        threshold: 0,
      }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tocItems]);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const easeInOutCubic = useCallback((t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }, []);

  const scrollToHeading = useCallback((id: string) => {
    cancelAnimation();
    setActiveId(id);
    isScrollingRef.current = true;
    
    const element = document.getElementById(id);
    if (!element) {
      isScrollingRef.current = false;
      return;
    }

    if ('scrollBehavior' in document.documentElement.style) {
      const elementTop = element.getBoundingClientRect().top;
      const absoluteElementTop = elementTop + window.pageYOffset;
      const windowHeight = window.innerHeight;
      const elementHeight = element.offsetHeight;
      const scrollPosition = absoluteElementTop - (windowHeight / 4) + (elementHeight / 2);
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
      return;
    }

    const elementTop = element.getBoundingClientRect().top;
    const absoluteElementTop = elementTop + window.pageYOffset;
    const windowHeight = window.innerHeight;
    const elementHeight = element.offsetHeight;
    const scrollPosition = absoluteElementTop - (windowHeight / 4) + (elementHeight / 2);
    
    const startY = window.pageYOffset;
    const difference = scrollPosition - startY;
    const duration = 400;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      window.scrollTo(0, startY + difference * easeInOutCubic(progress));
      
      if (elapsed < duration) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, [cancelAnimation, easeInOutCubic]);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <>
      <TOCList
        tocItems={tocItems}
        activeId={activeId}
        isExpanded={isDesktopExpanded}
        onToggle={() => setIsDesktopExpanded(!isDesktopExpanded)}
        onItemClick={scrollToHeading}
        variant="desktop"
      />
      <TOCList
        tocItems={tocItems}
        activeId={activeId}
        isExpanded={isMobileExpanded}
        onToggle={() => setIsMobileExpanded(!isMobileExpanded)}
        onItemClick={scrollToHeading}
        variant="mobile"
      />
    </>
  );
}