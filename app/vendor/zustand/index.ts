import { useSyncExternalStore } from "react";

type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T;

type PartialState<T> = Partial<T> | ((state: T) => Partial<T> | T | void);

type SetState<T> = (partial: PartialState<T>, replace?: boolean) => void;

type GetState<T> = () => T;

type Listener = () => void;

type Subscribe<T> = (listener: Listener) => () => void;

type UseStore<T> = {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: Subscribe<T>;
};

export type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
};

function create<TState>(initializer: StateCreator<TState>): UseStore<TState> {
  let state = {} as TState;
  const listeners = new Set<Listener>();

  const getState: GetState<TState> = () => state;

  const setState: SetState<TState> = (partial, replace) => {
    const partialState =
      typeof partial === "function" ? (partial as (state: TState) => Partial<TState> | TState | void)(state) : partial;

    if (partialState === undefined || partialState === null) {
      return;
    }

    const nextState = replace
      ? (partialState as TState)
      : Object.assign({}, state, partialState as Partial<TState>);

    if (Object.is(nextState, state)) {
      return;
    }

    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const subscribe: Subscribe<TState> = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api: StoreApi<TState> = {
    setState,
    getState,
    subscribe,
  };

  state = initializer(setState, getState, api);

  const useStore = (<Selected>(selector?: (state: TState) => Selected) => {
    const select = selector ?? ((value: TState) => value as unknown as Selected);
    return useSyncExternalStore(subscribe, () => select(getState()), () => select(getState()));
  }) as UseStore<TState>;

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}

export { create };
export default create;
