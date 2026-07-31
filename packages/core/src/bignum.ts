export type AmountInput = string | number | bigint;

const SUFFIXES_DE = [
  { value: 1e18, suffix: "e" },
  { value: 1e15, suffix: " Brd." },
  { value: 1e12, suffix: " Bio." },
  { value: 1e9, suffix: " Mrd." },
  { value: 1e6, suffix: " Mio." },
  { value: 1e3, suffix: " Tsd." },
] as const;

/**
 * Parse resource amounts to bigint (v1 stores resources as digit strings).
 */
export function toBigInt(value: AmountInput, fallback: bigint = 0n): bigint {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return BigInt(Math.trunc(value));
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || !/^-?\d+$/.test(trimmed)) {
    return fallback;
  }
  try {
    return BigInt(trimmed);
  } catch {
    return fallback;
  }
}

export function addAmount(a: AmountInput, b: AmountInput): bigint {
  return toBigInt(a) + toBigInt(b);
}

export function subAmount(a: AmountInput, b: AmountInput): bigint {
  return toBigInt(a) - toBigInt(b);
}

export function mulAmount(a: AmountInput, b: AmountInput): bigint {
  return toBigInt(a) * toBigInt(b);
}

export function gteAmount(a: AmountInput, b: AmountInput): boolean {
  return toBigInt(a) >= toBigInt(b);
}

export function clampAmount(
  value: AmountInput,
  min: AmountInput,
  max: AmountInput,
): bigint {
  const v = toBigInt(value);
  const lo = toBigInt(min);
  const hi = toBigInt(max);
  if (v < lo) {
    return lo;
  }
  if (v > hi) {
    return hi;
  }
  return v;
}

/** Cap bigint to Number.MAX_SAFE_INTEGER for formulas that still use number. */
export function toSafeNumber(value: AmountInput, fallback = 0): number {
  const n = toBigInt(value, BigInt(Math.trunc(fallback)));
  if (n > BigInt(Number.MAX_SAFE_INTEGER)) {
    return Number.MAX_SAFE_INTEGER;
  }
  if (n < BigInt(Number.MIN_SAFE_INTEGER)) {
    return Number.MIN_SAFE_INTEGER;
  }
  return Number(n);
}

export type FormatAmountOptions = {
  readonly decimals?: number;
  readonly locale?: "de" | "en";
};

/**
 * German idle-game number formatting (ported from v1 formatters.js).
 */
export function formatAmount(
  val: AmountInput | null | undefined,
  options: FormatAmountOptions = {},
): string {
  if (val === null || val === undefined || val === "") {
    return "0";
  }

  const decimals = options.decimals ?? 1;
  const locale = options.locale ?? "de";
  const decimalSep = locale === "de" ? "," : ".";

  let num = 0;
  if (typeof val === "bigint") {
    if (val > BigInt(Number.MAX_SAFE_INTEGER)) {
      const str = val.toString();
      const negative = str.startsWith("-");
      const digits = negative ? str.slice(1) : str;
      const exponent = digits.length - 1;
      const mantissa = Number.parseFloat(
        `${digits[0] ?? "0"}.${digits.slice(1, 4)}`,
      );
      const formattedMantissa = mantissa
        .toFixed(decimals)
        .replace(".", decimalSep);
      const body = `${formattedMantissa}e${String(exponent)}`;
      return negative ? `-${body}` : body;
    }
    num = Number(val);
  } else if (typeof val === "string") {
    num = Number(val);
  } else {
    num = val;
  }

  if (Number.isNaN(num)) {
    return "0";
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  if (absNum < 1000) {
    const formatted = Number.isInteger(absNum)
      ? absNum.toString()
      : absNum.toFixed(decimals);
    const result =
      locale === "de" ? formatted.replace(".", ",") : formatted;
    return isNegative ? `-${result}` : result;
  }

  if (absNum >= 1e18) {
    const expStr = absNum.toExponential(decimals);
    const result = locale === "de" ? expStr.replace(".", ",") : expStr;
    return isNegative ? `-${result}` : result;
  }

  for (const tier of SUFFIXES_DE) {
    if (absNum >= tier.value) {
      if (tier.suffix === "e") {
        continue;
      }
      const scaled = absNum / tier.value;
      const formatted = scaled.toFixed(decimals);
      const withLocale =
        locale === "de" ? formatted.replace(".", ",") : formatted;
      const result = `${withLocale}${tier.suffix}`;
      return isNegative ? `-${result}` : result;
    }
  }

  return num.toString();
}

export function formatDuration(ms: number): string {
  const safe = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const hours = Math.floor(safe / (1000 * 60 * 60));
  const minutes = Math.floor((safe % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((safe % (1000 * 60)) / 1000);
  let str = "";
  if (hours > 0) {
    str += `${String(hours)}h `;
  }
  if (minutes > 0) {
    str += `${String(minutes)}m `;
  }
  str += `${String(seconds)}s`;
  return str;
}
