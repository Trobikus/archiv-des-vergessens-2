const MODULUS = 2147483647;
const MULTIPLIER = 16807;

/**
 * Park–Miller LCG (v1 RNG), instance-based for test isolation.
 */
export class Rng {
  #seed: number;

  constructor(seed?: number) {
    this.#seed =
      seed === undefined
        ? Math.floor(Math.random() * MODULUS)
        : normalizeSeed(seed);
  }

  setSeed(seed: number): void {
    this.#seed = normalizeSeed(seed);
  }

  getSeed(): number {
    return this.#seed;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.#seed = (this.#seed * MULTIPLIER) % MODULUS;
    return (this.#seed - 1) / 2147483646;
  }

  random(): number {
    return this.next();
  }

  /** Integer in [min, max). */
  randomInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  randomElement<T>(arr: readonly T[]): T | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    return arr[this.randomInt(0, arr.length)];
  }

  shuffle<T>(arr: readonly T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = this.randomInt(0, i + 1);
      const a = result[i];
      const b = result[j];
      if (a === undefined || b === undefined) {
        continue;
      }
      result[i] = b;
      result[j] = a;
    }
    return result;
  }
}

export function createRng(seed?: number): Rng {
  return new Rng(seed);
}

/** Deterministic float in [0, 1) from a numeric seed (v1 seededRandom). */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) {
    return 1;
  }
  const truncated = Math.trunc(seed);
  const mod = ((truncated % MODULUS) + MODULUS) % MODULUS;
  return mod === 0 ? 1 : mod;
}
