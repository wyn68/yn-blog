export const isDev = process.env.NODE_ENV === "development";

export const devLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

/** 仅在开发环境输出错误详情；生产环境仅输出简短 message 防止信息泄露 */
export const devError = (...args: unknown[]) => {
  if (isDev) {
    console.error(...args);
  } else {
    // 生产环境只输出第一个参数的 message，不暴露 stack/详情
    const first = args[0];
    const msg = first instanceof Error ? first.message : String(first ?? '');
    console.error(`[Error] ${msg}`);
  }
};

/** 仅在开发环境输出警告 */
export const devWarn = (...args: unknown[]) => {
  if (isDev) {
    console.warn(...args);
  }
};
