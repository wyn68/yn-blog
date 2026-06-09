"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouterState } from "@/lib/router-state";

export default function PageTransitionIndicator() {
  const { isLoading } = useRouterState();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-white font-bold text-2xl tracking-tight">YN</span>
              </motion.div>
              
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}