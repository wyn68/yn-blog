"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  description?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = "YN Blog",
  description = "一个现代化的博客平台",
  url = typeof window !== "undefined" ? window.location.href : "",
  className = "text-muted-foreground hover:text-foreground transition-colors",
}: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch {
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className}
      aria-label={isCopied ? "已复制" : "分享"}
      title={isCopied ? "已复制链接" : "分享"}
    >
      {isCopied ? (
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </button>
  );
}