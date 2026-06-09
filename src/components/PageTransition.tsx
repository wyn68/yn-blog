"use client";

import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useRef, Suspense } from "react";
import { useRouterState } from "@/lib/router-state";

interface PageTransitionProps {
  children: ReactNode;
}

function PageTransitionContent({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { stopLoading } = useRouterState();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      stopLoading();
      return;
    }
    
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  const searchString = searchParams?.toString() || "";

  return (
    <motion.div
      key={`${pathname}${searchString}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="min-h-[calc(100vh-72px)]"
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-72px)]">{children}</div>}>
      <PageTransitionContent>{children}</PageTransitionContent>
    </Suspense>
  );
}