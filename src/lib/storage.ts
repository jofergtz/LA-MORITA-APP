/**
 * Safe LocalStorage utility that prevents QuotaExceededError from crashing the app.
 */
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value);
    } catch (e) {
      console.warn(`[Storage] Failed to read key "${key}":`, e);
      return fallback;
    }
  },

  setItem(key: string, value: unknown): boolean {
    try {
      const stringified = JSON.stringify(value);
      localStorage.setItem(key, stringified);
      return true;
    } catch (e) {
      console.warn(`[Storage] QuotaExceededError for key "${key}". Clearing heavy cache and retrying...`, e);
      try {
        // Attempt to clean heavy/secondary keys to free space
        const secondaryKeys = [
          'morita_messages',
          'morita_notifications',
          'morita_thankYous',
          'morita_publications',
          'morita_users'
        ];
        for (const k of secondaryKeys) {
          if (k !== key) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.warn(`[Storage] Storage quota full for "${key}". Skipping local save without crashing.`, retryError);
        return false;
      }
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove key "${key}":`, e);
    }
  },

  clearAll(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[Storage] Failed to clear localStorage:', e);
    }
  }
};
