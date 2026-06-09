"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Home, Menu, X } from "lucide-react";
import { handleLogout } from "@/actions/auth";
import { getUnreadMessageCount } from "@/actions/messages";
import { motion, AnimatePresence } from "framer-motion";
import MenuComponent from "@/components/menu/Menu";
import { adminMenuItems } from "@/constants/menuConfig";
import Image from "next/image";
import { useRouterState } from "@/lib/router-state";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userEmail: string;
  userId: string;
  profile: { username?: string; role?: string; avatar_url?: string | null } | null;
}

export default function AdminLayoutClient({ children, userEmail, userId, profile }: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const { stopLoading, startLoading } = useRouterState();
  const pathname = usePathname();

  useEffect(() => {
    stopLoading();
  }, [pathname, stopLoading]);

  useEffect(() => {
    const fetchCount = async () => {
      setCountLoading(true);
      const messageCount = await getUnreadMessageCount();
      setNotificationCount(messageCount);
      setCountLoading(false);
    };
    fetchCount();
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-20 h-[64px] border-b border-border bg-card pointer-events-none lg:pointer-events-auto" />
      
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r border-border bg-card hidden lg:flex flex-col">
        <div className="h-[64px] flex items-center justify-center px-6">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg tracking-tight">YN</span>
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">Blog</span>
          </Link>
        </div>

        <MenuComponent
          items={adminMenuItems}
          currentPath={pathname}
          onItemClick={handleNavClick}
          variant="vertical"
          role={profile?.role || null}
          notificationCount={notificationCount}
          countLoading={countLoading}
        />

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile?.username || ""}
                  fill
                  className="object-cover"
                  sizes="36px"
                  quality={80}
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.username || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors w-full text-left text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span>退出登录</span>
            </button>
          </form>
        </div>
      </aside>

      <header className="fixed top-0 right-0 z-30 h-[64px] lg:left-64">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-secondary"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          </button>
          <div className="hidden lg:block" />
          <Link
            href="/"
            onClick={() => startLoading()}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-border bg-card text-foreground text-xs sm:text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">返回博客</span>
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 z-50 w-64 h-screen border-r border-border bg-card lg:hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        }}
      >
              <div className="flex flex-col h-full">
                <div className="h-[64px] flex items-center justify-between px-6 border-b border-border shrink-0">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-white font-bold text-lg tracking-tight">YN</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">Blog</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent"
                  >
                    <X className="h-5 w-5 text-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <MenuComponent
                    items={adminMenuItems}
                    currentPath={pathname}
                    onItemClick={handleNavClick}
                    variant="mobile"
                    role={profile?.role || null}
                    notificationCount={notificationCount}
                    countLoading={countLoading}
                  />
                </div>

                <div className="p-4 border-t border-border shrink-0">
                  <div className="flex items-center gap-3 px-3 py-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile?.username || ""}
                          className="w-full h-full object-cover rounded-full"
                          width={36}
                          height={36}
                          quality={80}
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{profile?.username || "Admin"}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>
                  <form action={handleLogout}>
                    <button
                      type="submit"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors w-full text-left text-muted-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>退出登录</span>
                    </button>
                  </form>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="pl-0 lg:pl-64 pt-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}