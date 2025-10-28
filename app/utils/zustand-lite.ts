import { useDebugValue, useRef, useSyncExternalStore } from "react";

type SetState<T> = (
  partial: Partial<T> | T | ((state: T) => Partial<T> | T),
  replace?: boolean
) => void;

type GetState<T> = () => T;

type StateListener = () => void;

type Subscribe<T> = (listener: StateListener) => () => void;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  destroy: () => void;
};

type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T;

type EqualityChecker<T> = (a: T, b: T) => boolean;

type Selector<T, U> = (state: T) => U;

type UseBoundStore<T> = {
  (): T;
  <U>(selector: Selector<T, U>, equalityFn?: EqualityChecker<U>): U;
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: Subscribe<T>;
  destroy: () => void;
};

type PersistStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

type PersistOptions<T> = {
  name: string;
  storage?: PersistStorage;
  merge?: (persisted: unknown, current: T) => T;
  partialize?: (state: T) => unknown;
};

function identitySelector<T>(value: T) {
  return value;
}

function defaultEqualityFn<T>(a: T, b: T) {
  return Object.is(a, b);
}

export function createStore<T>(initializer: StateCreator<T>): UseBoundStore<T> {
  let state: T;
  const listeners = new Set<StateListener>();

  const getState: GetState<T> = () => state;

  const setState: SetState<T> = (partial, replace) => {
    const currentState = state;
    const partialState =
      typeof partial === "function" ? (partial as (state: T) => Partial<T> | T)(currentState) : partial;

    const nextState = replace
      ? (partialState as T)
      : { ...(currentState as object), ...(partialState as Partial<T>) } as T;

    if (Object.is(nextState, currentState)) {
      return;
    }

    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const subscribe: Subscribe<T> = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    listeners.clear();
  };

  const api: StoreApi<T> = {
    setState,
    getState,
    subscribe,
    destroy,
  };

  state = initializer(setState, getState, api);

  function useStore(): T;
  function useStore<U>(selector: Selector<T, U>, equalityFn?: EqualityChecker<U>): U;
  function useStore<U>(selector?: Selector<T, U>, equalityFn: EqualityChecker<U> = defaultEqualityFn): T | U {
    const selectorRef = useRef(selector ?? (identitySelector as Selector<T, U>));
    const equalityRef = useRef(equalityFn ?? (defaultEqualityFn as EqualityChecker<U>));
    const lastSliceRef = useRef<T | U>();
    const hasSliceRef = useRef(false);

    const selectorToUse = selector ?? (identitySelector as Selector<T, U>);
    const equalityToUse = equalityFn ?? (defaultEqualityFn as EqualityChecker<U>);

    if (selectorRef.current !== selectorToUse) {
      selectorRef.current = selectorToUse;
      hasSliceRef.current = false;
    }

    if (equalityRef.current !== equalityToUse) {
      equalityRef.current = equalityToUse;
    }

    const getSelectedState = () => {
      const currentState = getState();
      return selectorRef.current(currentState);
    };

    const selectedState = useSyncExternalStore(
      subscribe,
      getSelectedState,
      getSelectedState
    );

    if (
      !hasSliceRef.current ||
      !equalityRef.current(lastSliceRef.current as U, selectedState as U)
    ) {
      hasSliceRef.current = true;
      lastSliceRef.current = selectedState;
    }

    useDebugValue(lastSliceRef.current);

    return lastSliceRef.current as T | U;
  }

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;
  useStore.destroy = destroy;

  return useStore as UseBoundStore<T>;
}

export const create = createStore;

export function persist<T extends object>(
  initializer: StateCreator<T>,
  options: PersistOptions<T>
): StateCreator<T> {
  return (set, get, api) => {
    const storage = options.storage;

    let hasHydrated = false;

    const persistState = (value: T) => {
      if (!storage) return;
      try {
        const toStore = options.partialize ? options.partialize(value) : value;
        storage.setItem(options.name, JSON.stringify(toStore));
      } catch {
        // ignore persistence errors
      }
    };

    const setWithPersist: SetState<T> = (partial, replace) => {
      set(partial as any, replace);
      if (hasHydrated) {
        try {
          persistState(get());
        } catch {
          // ignore persistence errors
        }
      }
    };

    let initialState = initializer(setWithPersist, get, api);

    if (storage) {
      try {
        const storedValue = storage.getItem(options.name);
        if (storedValue) {
          const parsed = JSON.parse(storedValue) as unknown;
          initialState = options.merge ? options.merge(parsed, initialState) : {
            ...initialState,
            ...(parsed as Record<string, unknown>),
          };
        }
      } catch {
        // ignore parse errors
      }
    }

    hasHydrated = true;
    set(initialState, true);
    if (storage) {
      try {
        persistState(get());
      } catch {
        // ignore persistence errors
      }
    }

    return get();
  };
}

export type { StoreApi };
