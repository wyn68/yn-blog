"use client";

import { useState } from 'react';
import { Link2, ExternalLink, Plus, X } from "lucide-react";
import type { Link } from "@/types";
import LinkApplicationForm from "./LinkApplicationForm";
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface LinksClientProps {
  links: Link[];
}

export default function LinksClient({ links }: LinksClientProps) {
  const [showApplication, setShowApplication] = useState(false);

  const handleApplicationSuccess = () => {
    setShowApplication(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">友链</h1>
        <p className="text-muted-foreground text-base sm:text-lg">友情链接</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {links?.map((link: Link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-muted hover:bg-accent/50 transition-all duration-300 border border-border hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {link.avatar ? (
                <OptimizedImage
                  src={link.avatar}
                  alt={link.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fill={true}
                  aspectRatio="1/1"
                  sizes="48px"
                />
              ) : (
                <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base truncate">{link.name}</span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {link.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {link.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      {(!links || links.length === 0) && (
        <div className="text-center py-12 sm:py-16">
          <Link2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">暂无友链</p>
        </div>
      )}

      {/* 申请友链按钮 */}
      <button
        onClick={() => setShowApplication(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Plus className="h-5 w-5" />
        申请友链
      </button>

      {/* 申请友链弹窗 */}
      {showApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApplication(false)}
          />
          <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">申请友链</h2>
              <button
                onClick={() => setShowApplication(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-6">
                欢迎交换友链，请填写以下信息，我们会尽快审核并添加您的链接。
              </p>
              <LinkApplicationForm onSuccess={handleApplicationSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
