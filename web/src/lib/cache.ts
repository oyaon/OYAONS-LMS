import { create } from 'zustand';

interface CacheState {
  data: Record<string, any>;
  timestamps: Record<string, number>;
  set: (key: string, value: any, ttl?: number) => void;
  get: (key: string) => any;
  remove: (key: string) => void;
  clear: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCache = create<CacheState>((set, get) => ({
  data: {},
  timestamps: {},

  set: (key: string, value: any, ttl: number = DEFAULT_TTL) => {
    const now = Date.now();
    set((state) => ({
      data: { ...state.data, [key]: value },
      timestamps: { ...state.timestamps, [key]: now + ttl },
    }));
  },

  get: (key: string) => {
    const state = get();
    const timestamp = state.timestamps[key];
    const now = Date.now();

    if (timestamp && now < timestamp) {
      return state.data[key];
    }

    // Remove expired data
    if (timestamp) {
      get().remove(key);
    }

    return null;
  },

  remove: (key: string) => {
    set((state) => {
      const { [key]: removedData, ...remainingData } = state.data;
      const { [key]: removedTimestamp, ...remainingTimestamps } = state.timestamps;
      return {
        data: remainingData,
        timestamps: remainingTimestamps,
      };
    });
  },

  clear: () => {
    set({ data: {}, timestamps: {} });
  },
}));

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Lazy loading utility
export const lazyLoad = (importFn: () => Promise<any>) => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(importFn());
      }, 1000); // Simulate network delay for testing
    });
  });
}; 