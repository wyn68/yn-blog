'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  onConsent?: (accepted: boolean) => void;
}

export function CookieConsent({ onConsent }: CookieConsentProps) {
  const [show, setShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    setIsAnimating(true);
    setTimeout(() => {
      localStorage.setItem('cookie-consent', 'accepted');
      setShow(false);
      setIsAnimating(false);
      onConsent?.(true);
    }, 300);
  };

  const handleReject = () => {
    setIsAnimating(true);
    setTimeout(() => {
      localStorage.setItem('cookie-consent', 'rejected');
      setShow(false);
      setIsAnimating(false);
      onConsent?.(false);
    }, 300);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShow(false);
      setIsAnimating(false);
    }, 300);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className={`bg-background/95 backdrop-blur-sm text-foreground p-4 shadow-2xl transition-all duration-300 border-t border-border ${
          isAnimating ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-1">Cookie 政策</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  我们使用 cookies 来改善您的浏览体验、分析网站流量，并为您提供个性化内容。
                  请查看我们的{' '}
                  <a
                    href="/privacy"
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    隐私政策
                  </a>{' '}
                  了解更多信息。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReject}
                className="bg-muted text-muted-foreground hover:bg-secondary border-border"
              >
                拒绝
              </Button>
              <Button size="sm" onClick={handleAccept}>
                接受
              </Button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-800 transition-colors ml-1"
                aria-label="关闭"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;