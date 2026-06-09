"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";
import DoodleBackground from "@/components/DoodleBackground";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RouterStateProvider, useRouterState } from "@/lib/router-state";
import PageTransitionIndicator from "@/components/PageTransitionIndicator";
import PageTransition from "@/components/PageTransition";
import PrefetchWarmer from "@/components/PrefetchWarmer";

const MouseGlow = dynamic(() => import("@/components/MouseGlow"), {
  loading: () => null,
  ssr: false,
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { stopLoading } = useRouterState();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth");

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading();
    }, 3000);

    return () => clearTimeout(timer);
  }, [stopLoading]);

  return (
    <>
      <DoodleBackground />
      <PageTransitionIndicator />
      {!isAdmin && !isAuth && <Header />}
      {!isAdmin && isHome && <MouseGlow />}
      <main 
        className={`min-h-screen ${!isAdmin && !isAuth ? 'pt-24 pb-16 sm:pb-24' : ''} relative z-10 transition-colors duration-500`}
      >
        {!isAdmin ? (
          <PageTransition>{children}</PageTransition>
        ) : (
          children
        )}
      </main>
      {!isAdmin && !isAuth && <Footer />}
    </>
  );
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <RouterStateProvider>
        <PrefetchWarmer />
        <LayoutContent>{children}</LayoutContent>
      </RouterStateProvider>
    </ThemeProvider>
  );
}