import { useSyncExternalStore } from "react";

type EqualityChecker<T> = (a: T, b: T) => boolean;
type Selector<TState, TSlice> = (state: TState) => TSlice;

type PartialState<T> = Partial<T> | ((state: T) => Partial<T> | T);

type SetState<T> = (partial: PartialState<T>, replace?: boolean) => void;
type GetState<T> = () => T;

type Listener<T> = (state: T, previousState: T) => void;

export type StoreApi<T> = {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener<T>) => () => void;
};

export type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

export type UseBoundStore<T> = {
  (): T;
  <U>(selector: Selector<T, U>, equalityFn?: EqualityChecker<U>): U;
} & StoreApi<T>;

const identity = <T,>(value: T) => value;

export function create<TState>(initializer: StateCreator<TState>): UseBoundStore<TState> {
  let state: TState;
  const listeners = new Set<Listener<TState>>();

  const getState: GetState<TState> = () => state;

  const setState: SetState<TState> = (partial, replace) => {
    const partialState =
      typeof partial === "function"
        ? (partial as (state: TState) => Partial<TState> | TState)(state)
        : partial;

    if (partialState == null) return;

    const nextState = replace
      ? (partialState as TState)
      : ({ ...state, ...(partialState as object) } as TState);

    if (Object.is(nextState, state)) return;

    const previousState = state;
    state = nextState;

    listeners.forEach((listener) => listener(state, previousState));
  };

  const subscribe = (listener: Listener<TState>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = initializer(setState, getState);

  const useBoundStore = (<TSlice>(
    selector: Selector<TState, TSlice> = identity as Selector<TState, TSlice>,
    equalityFn: EqualityChecker<TSlice> = Object.is,
  ) => {
    const getSnapshot = () => selector(getState());

    return useSyncExternalStore(
      (notify) => {
        let currentSlice = selector(getState());
        return subscribe((nextState) => {
          const nextSlice = selector(nextState);
          if (!equalityFn(currentSlice, nextSlice)) {
            currentSlice = nextSlice;
            notify();
          }
        });
      },
      getSnapshot,
      getSnapshot,
    );
  }) as UseBoundStore<TState>;

  useBoundStore.getState = getState;
  useBoundStore.setState = setState;
  useBoundStore.subscribe = subscribe;

  return useBoundStore;
}
