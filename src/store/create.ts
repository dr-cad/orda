import localforage from "localforage";
import LZString from "lz-string";
import { createJSONStorage } from "zustand/middleware";

export function createStorage<T>(compress?: boolean) {
  return createJSONStorage<T>(() => {
    if (!compress) return localStorage;
    return {
      getItem: async (key) => {
        const value = await localforage.getItem<string>(key);
        if (value) return LZString.decompress(value);
        return value;
      },
      setItem: (key, value) => {
        // remove return to eject awaiting
        return localforage.setItem(key, LZString.compress(value));
      },
      removeItem: localforage.removeItem,
    };
  });
}
