"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Menu, X, User, LogOut, LayoutDashboard, Cog } from "lucide-react";
import { createClient } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";
import MenuComponent from "@/components/menu/Menu";
import { publicMenuItems, userMenuItems } from "@/constants/menuConfig";
import { APP_CONSTANTS } from "@/constants";
import { motionTokens } from "@/lib/motion-tokens";
import { useRouterState } from "@/lib/router-state";

function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return ((...args: unknown[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

export default function Header() {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useRouterState();

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, avatar_url")
          .eq("user_id", session.user.id)
          .single();
        setRole(profile?.role || null);
        setAvatarUrl(profile?.avatar_url || null);
      } else {
        setRole(null);
        setAvatarUrl(null);
      }
    };
    getSession();
  }, [pathname]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        setIsScrolled(currentScrollY > 20);

        if (currentScrollY <= 0) {
          setIsVisible(true);
        } else if (currentScrollY < lastScrollY.current) {
          setIsVisible(true);
        } else if (currentScrollY - lastScrollY.current > APP_CONSTANTS.SCROLL_THRESHOLD) {
          setIsVisible(false);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  const throttledScrollHandler = useMemo(
    () => throttle(handleScroll, APP_CONSTANTS.THROTTLE_DELAY),
    [handleScroll]
  );

  useEffect(() => {
    window.addEventListener("scroll", throttledScrollHandler, { passive: true });
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [throttledScrollHandler]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setUserMenuOpen(false);
    
    // 如果已经在首页，不触发加载动画
    if (pathname !== "/") {
      startLoading();
    }
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      startLoading();
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = useCallback((href: string) => {
    if (href !== pathname) {
      startLoading();
    }
    router.push(href);
    setMobileMenuOpen(false);
  }, [pathname, startLoading, router]);

  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isVisible ? 0 : -80,
          opacity: isVisible ? 1 : 0
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          duration: 0.5
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[64px] ${
          isScrolled ? "bg-background/98 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
        }`}
        role="navigation"
        aria-label="主导航"
      >
        <div className="max-w-6xl mx-auto px-6 h-full">
          <div className="flex h-full items-center justify-between gap-6 lg:gap-8">
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: motionTokens.duration.fast, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            >
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5" aria-label="返回首页">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm" role="img" aria-label="YN Blog Logo">
                  <span className="text-white font-bold text-sm sm:text-base tracking-tight">YN</span>
                </div>
                <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:block text-foreground">
                  Blog
                </span>
              </Link>
            </motion.div>

            <nav aria-label="主导航菜单" className="flex-1 flex justify-center">
              <MenuComponent
                items={publicMenuItems}
                currentPath={pathname}
                onItemClick={handleNavClick}
                variant="horizontal"
              />
            </nav>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden lg:flex items-center" role="search">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: motionTokens.duration.fast, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <label htmlFor="header-search" className="sr-only">搜索文章</label>
                  <input
                    id="header-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索..."
                    className="w-44 pl-9 pr-4 py-2 rounded-lg text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-foreground/30 transition-all"
                    aria-label="搜索文章"
                  />
                </motion.div>
              </form>

              <ThemeToggle />

              {session ? (
                <>
                  <div className="relative z-50">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden relative"
                      aria-label="用户菜单"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      {avatarUrl ? (
                        <OptimizedImage
                          src={avatarUrl}
                          alt="用户头像"
                          fill
                          sizes="80px"
                          quality={95}
                          aspectRatio="1/1"
                          className="object-cover"
                          onError={() => {
                            const fallback = document.querySelector('.fallback-avatar');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <User className={`h-5 w-5 text-muted-foreground ${avatarUrl ? 'hidden fallback-avatar' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <>
                        <motion.div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          role="button"
                          tabIndex={0}
                          aria-label="关闭菜单"
                        />
                        <motion.div
                          className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl overflow-hidden bg-card border border-border shadow-xl"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          role="menu"
                          aria-label="用户操作菜单"
                        >
                          <div className="py-2">
                            {userMenuItems
                              .filter((item) => {
                                if (!item.roles || item.roles.length === 0) return true;
                                if (!role) return false;
                                return item.roles.includes(role);
                              })
                              .map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setUserMenuOpen(false);
                                    if (item.href !== pathname) {
                                      startLoading();
                                    }
                                    router.push(item.href);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent flex items-center gap-3 transition-colors"
                                  role="menuitem"
                                >
                                  {item.icon === "User" && <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                                  {item.icon === "Cog" && <Cog className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                                  {item.icon === "LayoutDashboard" && <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                                  {item.name}
                                </button>
                              ))}
                            <div className="my-2 border-t border-border" />
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                handleLogout();
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors"
                              role="menuitem"
                            >
                              <LogOut className="h-4 w-4 text-destructive" aria-hidden="true" />
                              退出登录
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <motion.button
                  onClick={() => {
                    if ("/login" !== pathname) {
                      startLoading();
                    }
                    router.push("/login");
                  }}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-foreground text-background transition-all"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: motionTokens.duration.fast, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  aria-label="登录"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  登录
                </motion.button>
              )}

              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 transition-all"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: motionTokens.duration.fast, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[100] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="button"
              tabIndex={0}
              aria-label="关闭菜单"
            />
            <motion.div
              className="fixed top-[80px] left-4 right-4 z-[101] md:hidden bg-card rounded-xl border border-border shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="移动菜单"
            >
              <div className="px-4 py-3 space-y-2">
                <form onSubmit={handleSearch} className="flex items-center" role="search">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <label htmlFor="mobile-search" className="sr-only">搜索文章</label>
                    <input
                      id="mobile-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索文章..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-foreground/30"
                      aria-label="搜索文章"
                    />
                  </div>
                </form>

                <div className="h-px bg-border" />

                <nav aria-label="移动导航菜单">
                  <MenuComponent
                    items={publicMenuItems}
                    currentPath={pathname}
                    onItemClick={handleNavClick}
                    variant="mobile"
                  />
                </nav>

                {!session && (
                  <div className="h-px bg-border my-2" />
                )}

                {!session && (
                  <motion.button
                    onClick={() => {
                      if ("/login" !== pathname) {
                        startLoading();
                      }
                      router.push("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl bg-foreground text-background transition-all"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: motionTokens.duration.fast, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    aria-label="登录"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    登录
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </motion.header>
    </>
  );
}