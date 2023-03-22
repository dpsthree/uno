import { writable } from "svelte/store";

export function localStorageStore<T>(key: string, value: T) {
  const isBrowser = typeof window !== "undefined";

  const storedValue = isBrowser ? localStorage.getItem(key) : null;
  const data = writable<T>(storedValue ? JSON.parse(storedValue) : value);

  if (isBrowser) {
    data.subscribe(($data) => {
      localStorage.setItem(key, JSON.stringify($data));
    });
  }

  return data;
}
