'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLatestAnnouncement } from '@/services/announcements';
import { getSetting } from '@/services/settings';
import { useRouterState } from '@/lib/router-state';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Announcement } from '@/types';

const STORAGE_KEY = 'ynblog_viewed_announcement_ids';
const ANNOUNCEMENT_TOAST_KEY = 'announcement_toast_enabled';

export default function AnnouncementToast() {
  const [show, setShow] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { startLoading } = useRouterState();

  useEffect(() => {
    const fetchAndShowAnnouncement = async () => {
      try {
        const [latest, toastEnabled] = await Promise.all([
          getLatestAnnouncement(),
          getSetting(ANNOUNCEMENT_TOAST_KEY),
        ]);

        if (toastEnabled !== null && toastEnabled !== 'true') {
          setIsLoading(false);
          return;
        }

        if (!latest) {
          setIsLoading(false);
          return;
        }

        const viewedIds = localStorage.getItem(STORAGE_KEY);
        const viewedSet = viewedIds ? new Set(JSON.parse(viewedIds)) : new Set();

        if (!viewedSet.has(latest.id)) {
          setAnnouncement(latest);
          setShow(true);
          viewedSet.add(latest.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(viewedSet)));
        }
      } catch (error) {
        console.error('Error fetching latest announcement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndShowAnnouncement();
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  const handleViewDetail = () => {
    handleClose();
    startLoading();
    router.push('/announcements');
  };

  if (isLoading || !announcement) {
    return null;
  }

  const excerpt = announcement.excerpt || announcement.content.substring(0, 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10, x: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-20 right-4 z-50 w-80 sm:w-96"
        >
          <div className="card p-4 shadow-2xl border-l-4 border-primary">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">最新公告</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="关闭公告提示"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <h3 className="font-medium text-foreground mb-2 line-clamp-1">
              {sanitizeHtml(announcement.title)}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {sanitizeHtml(excerpt)}...
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(announcement.created_at).toLocaleDateString("zh-CN")}
              </span>
              <button
                onClick={handleViewDetail}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                查看详情
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}