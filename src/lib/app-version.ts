export const APP_VERSION = "1.0.3";

const APP_CACHE_KEYS = [
  "appVersion",
  "viewedAnnouncements",
];

export function checkAndUpdateVersion(): boolean {
  const storedVersion = localStorage.getItem("appVersion");
  
  if (storedVersion !== APP_VERSION) {
    APP_CACHE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.setItem("appVersion", APP_VERSION);
    return true;
  }
  
  return false;
}