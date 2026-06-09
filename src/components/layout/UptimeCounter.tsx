"use client";

import { useState, useEffect, useRef } from "react";

const LAUNCH_DATE = new Date("2026-05-07T13:31:18Z");

export default function UptimeCounter() {
  const [uptime, setUptime] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const lastSecond = useRef<number>(-1);

  function calculateUptime(): { days: number; hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const diff = now.getTime() - LAUNCH_DATE.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    setUptime(calculateUptime());
    
    const timer = setInterval(() => {
      const current = calculateUptime();
      if (current.seconds !== lastSecond.current) {
        lastSecond.current = current.seconds;
        setUptime(current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (uptime === null) {
    return (
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <span className="hidden sm:inline">本站已运行</span>
        <span className="font-mono">
          <span className="bg-muted px-1.5 py-0.5 rounded">--</span>
          <span className="mx-0.5">天</span>
          <span className="bg-muted px-1.5 py-0.5 rounded">--</span>
          <span className="mx-0.5">时</span>
          <span className="bg-muted px-1.5 py-0.5 rounded">--</span>
          <span className="mx-0.5">分</span>
          <span className="bg-muted px-1.5 py-0.5 rounded">--</span>
          <span className="mx-0.5">秒</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
      <span className="hidden sm:inline">本站已运行</span>
      <span className="font-mono">
        <span className="bg-muted px-1.5 py-0.5 rounded">{pad(uptime.days)}</span>
        <span className="mx-0.5 text-muted-foreground">天</span>
        <span className="bg-muted px-1.5 py-0.5 rounded">{pad(uptime.hours)}</span>
        <span className="mx-0.5 text-muted-foreground">时</span>
        <span className="bg-muted px-1.5 py-0.5 rounded">{pad(uptime.minutes)}</span>
        <span className="mx-0.5 text-muted-foreground">分</span>
        <span className="bg-muted px-1.5 py-0.5 rounded">{pad(uptime.seconds)}</span>
        <span className="mx-0.5 text-muted-foreground">秒</span>
      </span>
    </div>
  );
}