import type { ValidationResult } from "./save-envelope";

export type GedankenArchivSave = {
  readonly level: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly baseYield: number;
  readonly upgrades: {
    readonly focusBonus: number;
  };
};

/** Phase-2 vertical-slice payload (resources / idle / gather / offline clock). */
export type Phase2SavePayload = {
  readonly resources: {
    readonly particles: string;
    readonly totalParticles: string;
    readonly mnemeFragmente: string;
    readonly totalMnemeFragmente: string;
    readonly ewigeMneme: string;
  };
  readonly idleGenerators: {
    readonly gedankenArchiv: GedankenArchivSave;
  };
  readonly gather: {
    readonly clickPowerLevel: number;
  };
  readonly meta: {
    readonly lastActiveAt: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDigitString(value: unknown): value is string {
  return typeof value === "string" && /^-?\d+$/.test(value);
}

function validateGedankenArchiv(
  value: unknown,
): ValidationResult<GedankenArchivSave> {
  if (!isRecord(value)) {
    return { ok: false, error: "gedankenArchiv must be an object" };
  }
  if (!isFiniteNumber(value["level"]) || value["level"] < 0) {
    return { ok: false, error: "gedankenArchiv.level invalid" };
  }
  if (!isFiniteNumber(value["baseCost"]) || value["baseCost"] < 0) {
    return { ok: false, error: "gedankenArchiv.baseCost invalid" };
  }
  if (!isFiniteNumber(value["costMultiplier"]) || value["costMultiplier"] < 1) {
    return { ok: false, error: "gedankenArchiv.costMultiplier invalid" };
  }
  if (!isFiniteNumber(value["baseYield"]) || value["baseYield"] < 0) {
    return { ok: false, error: "gedankenArchiv.baseYield invalid" };
  }
  const upgrades = value["upgrades"];
  if (!isRecord(upgrades)) {
    return { ok: false, error: "gedankenArchiv.upgrades must be an object" };
  }
  if (!isFiniteNumber(upgrades["focusBonus"]) || upgrades["focusBonus"] < 0) {
    return { ok: false, error: "gedankenArchiv.upgrades.focusBonus invalid" };
  }
  return {
    ok: true,
    value: {
      level: Math.floor(value["level"]),
      baseCost: value["baseCost"],
      costMultiplier: value["costMultiplier"],
      baseYield: value["baseYield"],
      upgrades: { focusBonus: upgrades["focusBonus"] },
    },
  };
}

export function validatePhase2SavePayload(
  value: unknown,
): ValidationResult<Phase2SavePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }

  const resources = value["resources"];
  if (!isRecord(resources)) {
    return { ok: false, error: "resources must be an object" };
  }
  const particles = resources["particles"];
  const totalParticles = resources["totalParticles"];
  const mnemeFragmente = resources["mnemeFragmente"];
  const totalMnemeFragmente = resources["totalMnemeFragmente"];
  const ewigeMneme = resources["ewigeMneme"];
  if (!isDigitString(particles)) {
    return { ok: false, error: "resources.particles must be an integer string" };
  }
  if (!isDigitString(totalParticles)) {
    return {
      ok: false,
      error: "resources.totalParticles must be an integer string",
    };
  }
  if (!isDigitString(mnemeFragmente)) {
    return {
      ok: false,
      error: "resources.mnemeFragmente must be an integer string",
    };
  }
  if (!isDigitString(totalMnemeFragmente)) {
    return {
      ok: false,
      error: "resources.totalMnemeFragmente must be an integer string",
    };
  }
  if (!isDigitString(ewigeMneme)) {
    return {
      ok: false,
      error: "resources.ewigeMneme must be an integer string",
    };
  }

  const idleGenerators = value["idleGenerators"];
  if (!isRecord(idleGenerators)) {
    return { ok: false, error: "idleGenerators must be an object" };
  }
  const archiv = validateGedankenArchiv(idleGenerators["gedankenArchiv"]);
  if (!archiv.ok) {
    return archiv;
  }

  const gather = value["gather"];
  if (!isRecord(gather)) {
    return { ok: false, error: "gather must be an object" };
  }
  const clickPowerLevel = gather["clickPowerLevel"];
  if (!isFiniteNumber(clickPowerLevel) || clickPowerLevel < 0) {
    return { ok: false, error: "gather.clickPowerLevel invalid" };
  }

  const meta = value["meta"];
  if (!isRecord(meta)) {
    return { ok: false, error: "meta must be an object" };
  }
  const lastActiveAt = meta["lastActiveAt"];
  if (!isFiniteNumber(lastActiveAt) || lastActiveAt < 0) {
    return { ok: false, error: "meta.lastActiveAt invalid" };
  }

  return {
    ok: true,
    value: {
      resources: {
        particles,
        totalParticles,
        mnemeFragmente,
        totalMnemeFragmente,
        ewigeMneme,
      },
      idleGenerators: {
        gedankenArchiv: archiv.value,
      },
      gather: {
        clickPowerLevel: Math.floor(clickPowerLevel),
      },
      meta: {
        lastActiveAt,
      },
    },
  };
}
