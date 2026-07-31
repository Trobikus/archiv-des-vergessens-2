import type { Store } from "@adv/core";
import { useEffect, useState } from "preact/hooks";

export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(() => store.getState());

  useEffect(() => {
    return store.subscribe((next) => {
      setState(next);
    });
  }, [store]);

  return state;
}
