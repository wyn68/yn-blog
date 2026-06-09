"use client";

import { useEffect } from 'react';
import { initializeClientMonitoring } from '@/lib/client-init';

/**
 * 监控初始化组件
 * 在客户端初始化时自动设置资源监控
 */
export default function MonitoringInitializer() {
  useEffect(() => {
    initializeClientMonitoring();
  }, []);

  return null;
}