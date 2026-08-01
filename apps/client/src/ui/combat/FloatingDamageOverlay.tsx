import { useEffect, useRef } from "preact/hooks";

import { createDomPool, type DomPool } from "../../services/dom-pool";
import type { FloatingText } from "../../state/game-state";

type Props = {
  readonly texts: readonly FloatingText[];
  /** When true (frame-budget degradation), skip spawning floaters. */
  readonly disabled?: boolean;
};

/**
 * Imperative DomPool overlay — avoids allocating Preact VNodes per float tick
 * and releases nodes after the CSS animation (v1 pool parity).
 */
export function FloatingDamageOverlay({ texts, disabled = false }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const poolRef = useRef<DomPool | null>(null);
  const activeRef = useRef<Map<string, HTMLElement>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const pool = createDomPool({
      create: () => document.createElement("span"),
      parent: host,
      baseClass: "floater",
      initialSize: 8,
      maxSize: 16,
    });
    poolRef.current = pool;
    const active = activeRef.current;
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      active.clear();
      pool.destroy();
      poolRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pool = poolRef.current;
    if (!pool) {
      return;
    }
    const active = activeRef.current;
    const timers = timersRef.current;
    const releaseAll = (): void => {
      for (const [id, el] of active) {
        const timer = timers.get(id);
        if (timer !== undefined) {
          clearTimeout(timer);
          timers.delete(id);
        }
        pool.release(el);
        active.delete(id);
      }
    };

    if (disabled) {
      releaseAll();
      return;
    }

    const seen = new Set<string>();

    for (const entry of texts) {
      seen.add(entry.id);
      if (active.has(entry.id)) {
        continue;
      }
      const el = pool.get();
      el.className = `floater floater--${entry.kind}`;
      el.textContent = entry.text;
      active.set(entry.id, el);
      const timer = setTimeout(() => {
        const node = active.get(entry.id);
        if (node) {
          pool.release(node);
          active.delete(entry.id);
        }
        timers.delete(entry.id);
      }, 1200);
      timers.set(entry.id, timer);
    }

    for (const [id, el] of active) {
      if (!seen.has(id)) {
        const timer = timers.get(id);
        if (timer !== undefined) {
          clearTimeout(timer);
          timers.delete(id);
        }
        pool.release(el);
        active.delete(id);
      }
    }
  }, [texts, disabled]);

  return (
    <div
      ref={hostRef}
      class="floaters"
      data-testid="floating-damage"
      aria-hidden="true"
    />
  );
}
