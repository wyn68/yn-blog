let isPageLoaded = false;
const listeners = new Set<(loaded: boolean) => void>();

export function setPageLoaded(loaded: boolean) {
  isPageLoaded = loaded;
  listeners.forEach((listener) => listener(loaded));
}

export function getPageLoaded(): boolean {
  return isPageLoaded;
}

export function onPageLoaded(callback: (loaded: boolean) => void): () => void {
  listeners.add(callback);
  if (isPageLoaded) {
    callback(true);
  }
  return () => listeners.delete(callback);
}
