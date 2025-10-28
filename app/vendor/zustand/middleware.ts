import type { StoreApi } from "./index";

export type StateCreator<T> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T> | T | void), replace?: boolean) => void,
  get: () => T,
  api: StoreApi<T>
) => T;

export type PersistStorage<T> = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem?: (name: string) => void;
};

export type PersistOptions<T> = {
  name: string;
  storage?: PersistStorage<T>;
  partialize?: (state: T) => unknown;
};

export function persist<T extends object>(
  initializer: StateCreator<T>,
  options: PersistOptions<T>
): StateCreator<T> {
  return (set, get, api) => {
    const storage = options.storage;

    const setWithPersistence: Parameters<StateCreator<T>>[0] = (partial, replace) => {
      set(partial as any, replace);

      if (!storage) return;

      try {
        const state = get();
        const data = options.partialize ? options.partialize(state) : state;
        storage.setItem(options.name, JSON.stringify(data));
      } catch (error) {
        console.warn("Failed to persist player store", error);
      }
    };

    initializer(setWithPersistence, get, api);

    if (storage) {
      try {
        const raw = storage.getItem(options.name);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<T>;
          const current = get();
          set(() => Object.assign({}, current, parsed) as T, true);
        }
      } catch (error) {
        console.warn("Failed to rehydrate player store", error);
      }
    }

    return get();
  };
}

export function createJSONStorage(getStorage: () => PersistStorage<unknown> | undefined) {
  return {
    getItem: (name: string) => {
      const storage = getStorage();
      if (!storage) return null;
      return storage.getItem(name);
    },
    setItem: (name: string, value: string) => {
      const storage = getStorage();
      storage?.setItem(name, value);
    },
    removeItem: (name: string) => {
      const storage = getStorage();
      storage?.removeItem?.(name);
    },
  } satisfies PersistStorage<unknown>;
}
