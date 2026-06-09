"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { setPageLoaded } from "@/lib/pageLoaderState";
import { motionTokens } from "@/lib/motion-tokens";

export default function PageLoader() {
  const [isComplete, setIsComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        setShowContent(true);
        setPageLoaded(true);
      }, motionTokens.duration.fast * 1000);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (showContent) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ 
        duration: motionTokens.duration.normal, 
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: motionTokens.duration.slow, 
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          <div className="inline-flex items-center justify-center">
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
          </div>
          
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
        </motion.div>
      </div>

      {isComplete && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: motionTokens.duration.fast,
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                    delay: motionTokens.duration.fast + 0.1,
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
