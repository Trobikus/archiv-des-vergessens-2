/**
 * Phase 9 — Adapter: v1 Spielstand-JSON → v2 SaveEnvelope.
 *
 * Accepts:
 * - Inner v1 state (`{ hero, resources, … }`)
 * - IndexedDB envelope (`{ state, timestamp?, version? }`)
 * - Cloud blob (`{ saveData, timestamp? }` or `{ saveData: { state } }`)
 * - Bundle with optional vault (`{ state, vaultData | accountVault }`)
 */
import { createSaveEnvelope } from "./envelope";
import type { SaveEnvelope, ValidationResult } from "./save-envelope";
import {
  createDefaultAccountVaultSave,
  createDefaultAchievementsSave,
  createDefaultChallengesSave,
  createDefaultClanSave,
  createDefaultCodexSave,
  createDefaultCraftingSave,
  createDefaultFriendsSave,
  createDefaultHeroSave,
  createDefaultLeaderboardSave,
  createDefaultLibrarySave,
  createDefaultQuestsSave,
  createDefaultRelicHuntSave,
  createDefaultSettingsSave,
  createDefaultStoryBranchSave,
  createDefaultStorySave,
  createDefaultTalentsSave,
  validatePhase2SavePayload,
  type AccountVaultSave,
  type AchievementProgressSave,
  type ClanMemberSave,
  type ClanRole,
  type ClanSave,
  type EquipmentSave,
  type FriendEntrySave,
  type FriendRequestSave,
  type HeroSave,
  type ItemSave,
  type LeaderboardSave,
  type Phase2SavePayload,
  type StatBlockSave,
} from "./save-payload";

const CLAN_ROLES: readonly ClanRole[] = [
  "collector",
  "weaver",
  "guardian",
  "archivist",
  "elder",
];

const DEFAULT_ARCHIV = {
  level: 0,
  baseCost: 10,
  costMultiplier: 1.15,
  baseYield: 1,
  upgrades: { focusBonus: 0 },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function asNonNegInt(value: unknown, fallback: number): number {
  const n = Math.floor(asFiniteNumber(value, fallback));
  return n >= 0 ? n : fallback;
}

function asDigitString(value: unknown, fallback = "0"): string {
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableTime(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" && (value === "Infinity" || value === "null")) {
    return null;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value === Number.POSITIVE_INFINITY) {
      return null;
    }
    return value >= 0 ? value : null;
  }
  return null;
}

function mapStatBlock(value: unknown): StatBlockSave {
  if (!isRecord(value)) {
    return { attack: 0, defense: 0, agility: 0, stamina: 0 };
  }
  return {
    attack: Math.max(0, asFiniteNumber(value["attack"], 0)),
    defense: Math.max(0, asFiniteNumber(value["defense"], 0)),
    agility: Math.max(0, asFiniteNumber(value["agility"], 0)),
    stamina: Math.max(0, asFiniteNumber(value["stamina"], 0)),
  };
}

function mapItem(value: unknown, fallbackId: string): ItemSave | null {
  if (!isRecord(value)) {
    return null;
  }
  const name = asString(value["name"]);
  const slot = asString(value["slot"]);
  const rarity = asString(value["rarity"], "common");
  if (!name || !slot) {
    return null;
  }
  const statsSource =
    isRecord(value["stats"])
      ? value["stats"]
      : isRecord(value["baseStats"])
        ? value["baseStats"]
        : {};
  const id =
    typeof value["id"] === "string" && value["id"].length > 0
      ? value["id"]
      : fallbackId;
  const level = Math.max(1, asNonNegInt(value["level"], 1));
  return {
    id,
    name,
    slot,
    rarity: rarity.length > 0 ? rarity : "common",
    level,
    stats: mapStatBlock(statsSource),
  };
}

function mapEquipment(value: unknown): EquipmentSave {
  const defaults = createDefaultHeroSave().equipment;
  if (!isRecord(value)) {
    return defaults;
  }
  return {
    weapon: mapItem(value["weapon"], "v1_weapon"),
    shield: mapItem(value["shield"], "v1_shield"),
    helmet: mapItem(value["helmet"], "v1_helmet"),
    shoulders: mapItem(value["shoulders"], "v1_shoulders"),
    armor: mapItem(value["armor"], "v1_armor"),
    gloves: mapItem(value["gloves"], "v1_gloves"),
    belt: mapItem(value["belt"], "v1_belt"),
    boots: mapItem(value["boots"], "v1_boots"),
    amulet: mapItem(value["amulet"], "v1_amulet"),
    ring: mapItem(value["ring"], "v1_ring"),
    ring2: mapItem(value["ring2"], "v1_ring2"),
  };
}

function mapInventoryEquipment(value: unknown): ItemSave[] {
  if (!isRecord(value)) {
    return [];
  }
  const equipment: unknown[] = Array.isArray(value["equipment"])
    ? value["equipment"]
    : [];
  const loot: unknown[] = Array.isArray(value["loot"]) ? value["loot"] : [];
  const items: ItemSave[] = [];
  let index = 0;
  for (const entry of equipment.concat(loot)) {
    const mapped = mapItem(entry, `v1_inv_${String(index)}`);
    index += 1;
    if (mapped !== null) {
      items.push(mapped);
    }
  }
  return items;
}

function mapHero(value: unknown): HeroSave {
  const defaults = createDefaultHeroSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const name = asString(value["name"]);
  const prestigeRaw = isRecord(value["prestige"]) ? value["prestige"] : {};
  const defeated: number[] = [];
  if (Array.isArray(prestigeRaw["defeatedBosses"])) {
    for (const id of prestigeRaw["defeatedBosses"]) {
      const n = asNonNegInt(id, 0);
      if (n >= 1) {
        defeated.push(n);
      }
    }
  }
  const unlockedSkills: string[] = [];
  if (Array.isArray(value["unlockedSkills"])) {
    for (const skill of value["unlockedSkills"]) {
      if (typeof skill === "string") {
        unlockedSkills.push(skill);
      }
    }
  }
  const created =
    typeof value["created"] === "boolean"
      ? value["created"]
      : name.trim().length > 0;
  return {
    id: asString(value["id"], defaults.id) || defaults.id,
    name,
    title: asString(value["title"]),
    avatar: asString(value["avatar"]),
    created,
    level: Math.max(1, asNonNegInt(value["level"], 1)),
    experience: asNonNegInt(value["experience"], 0),
    expToNext: Math.max(1, asFiniteNumber(value["expToNext"], 50)),
    baseStats: mapStatBlock(value["baseStats"] ?? defaults.baseStats),
    spentStats: mapStatBlock(value["spentStats"] ?? defaults.spentStats),
    unspentStatPoints: asNonNegInt(value["unspentStatPoints"], 0),
    equipment: mapEquipment(value["equipment"]),
    inventory: { equipment: mapInventoryEquipment(value["inventory"]) },
    prestige: {
      bossProgress: asNonNegInt(prestigeRaw["bossProgress"], 0),
      defeatedBosses: defeated,
    },
    unlockedSkills,
  };
}

function mapAchievements(value: unknown): Phase2SavePayload["achievements"] {
  if (!isRecord(value)) {
    return createDefaultAchievementsSave();
  }
  const progress: Record<string, AchievementProgressSave> = {};
  if (isRecord(value["progress"])) {
    for (const [key, entry] of Object.entries(value["progress"])) {
      if (!isRecord(entry)) {
        continue;
      }
      progress[key] = {
        progress: asNonNegInt(entry["progress"], 0),
        achieved: asBoolean(entry["achieved"], false),
        claimed: asBoolean(entry["claimed"], false),
      };
    }
  }
  if (Array.isArray(value["list"])) {
    for (const entry of value["list"]) {
      if (!isRecord(entry) || typeof entry["id"] !== "string") {
        continue;
      }
      const id = entry["id"];
      progress[id] = {
        progress: asNonNegInt(entry["progress"], 0),
        achieved: asBoolean(entry["achieved"], false),
        claimed: asBoolean(entry["claimed"], false),
      };
    }
  }
  return { progress };
}

function mapQuests(value: unknown): Phase2SavePayload["quests"] {
  const defaults = createDefaultQuestsSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const dailyRaw = isRecord(value["daily"]) ? value["daily"] : {};
  const claimed: string[] = [];
  if (Array.isArray(dailyRaw["claimed"])) {
    for (const id of dailyRaw["claimed"]) {
      if (typeof id === "string") {
        claimed.push(id);
      }
    }
  }
  return {
    mainIndex: asNonNegInt(value["mainIndex"], 0),
    daily: {
      date: asString(dailyRaw["date"]),
      gatherClicks: asNonNegInt(dailyRaw["gatherClicks"], 0),
      expeditions: asNonNegInt(dailyRaw["expeditions"], 0),
      craftedItems: asNonNegInt(dailyRaw["craftedItems"], 0),
      claimed,
      lastClaimDate: asString(dailyRaw["lastClaimDate"]),
      streak: asNonNegInt(dailyRaw["streak"], 0),
      currentBoost:
        typeof dailyRaw["currentBoost"] === "string"
          ? dailyRaw["currentBoost"]
          : dailyRaw["currentBoost"] === null
            ? null
            : null,
      boostUntil: Math.max(0, asFiniteNumber(dailyRaw["boostUntil"], 0)),
    },
  };
}

function mapSettings(
  value: unknown,
  system: Record<string, unknown> | null,
): Phase2SavePayload["settings"] {
  const defaults = createDefaultSettingsSave();
  if (!isRecord(value) && system === null) {
    return defaults;
  }
  const settings = isRecord(value) ? value : {};
  const language = asString(settings["language"] ?? settings["locale"], "de");
  const locale = language === "en" ? "en" : "de";
  const music = asBoolean(settings["music"], true);
  const sfx = asBoolean(settings["sfx"], true);
  const audioEnabled =
    typeof settings["audioEnabled"] === "boolean"
      ? settings["audioEnabled"]
      : music || sfx;
  const autosaveMs = Math.max(
    1000,
    asNonNegInt(settings["autosave"] ?? settings["autosaveMs"], 15_000),
  );
  return {
    locale,
    particlesEnabled: asBoolean(
      settings["particles"] ?? settings["particlesEnabled"],
      true,
    ),
    floatingTextEnabled: asBoolean(
      settings["floatingText"] ?? settings["floatingTextEnabled"],
      true,
    ),
    audioEnabled,
    autosaveMs,
  };
}

function mapCodex(
  value: unknown,
  lore: unknown,
): Phase2SavePayload["codex"] {
  const defaults = createDefaultCodexSave();
  const unlockedIds: string[] = [];
  if (isRecord(value)) {
    if (Array.isArray(value["unlockedIds"])) {
      for (const id of value["unlockedIds"]) {
        if (typeof id === "string") {
          unlockedIds.push(id);
        }
      }
    }
    if (isRecord(value["entries"])) {
      for (const [id, entry] of Object.entries(value["entries"])) {
        if (isRecord(entry) && entry["unlocked"] === true) {
          unlockedIds.push(id);
        }
      }
    }
  }
  const decryptedLoreIds: string[] = [];
  if (isRecord(lore) && isRecord(lore["decrypted"])) {
    for (const nodeId of Object.keys(lore["decrypted"])) {
      decryptedLoreIds.push(nodeId);
    }
  }
  if (isRecord(value) && Array.isArray(value["decryptedLoreIds"])) {
    for (const id of value["decryptedLoreIds"]) {
      if (typeof id === "string" && !decryptedLoreIds.includes(id)) {
        decryptedLoreIds.push(id);
      }
    }
  }
  return {
    unlockedIds: unlockedIds.length > 0 ? unlockedIds : defaults.unlockedIds,
    decryptedLoreIds,
  };
}

function mapStoryBranch(value: unknown): Phase2SavePayload["storyBranch"] {
  const defaults = createDefaultStoryBranchSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const flags: Record<string, boolean | number | string> = {};
  if (isRecord(value["flags"])) {
    for (const [key, flagValue] of Object.entries(value["flags"])) {
      if (
        typeof flagValue === "boolean" ||
        typeof flagValue === "string" ||
        (typeof flagValue === "number" && Number.isFinite(flagValue))
      ) {
        flags[key] = flagValue;
      }
    }
  }
  const visited: string[] = [];
  if (Array.isArray(value["visited"])) {
    for (const id of value["visited"]) {
      if (typeof id === "string") {
        visited.push(id);
      }
    }
  }
  const history: string[] = [];
  if (Array.isArray(value["history"])) {
    for (const entry of value["history"]) {
      if (typeof entry === "string") {
        history.push(entry);
        continue;
      }
      if (isRecord(entry)) {
        const from = asString(entry["from"], "?");
        const option = asString(entry["option"], "?");
        const to = asString(entry["to"], "?");
        history.push(`${from}>${option}>${to}`);
      }
    }
  }
  let endingReached: string | null = null;
  if (typeof value["endingReached"] === "string") {
    endingReached = value["endingReached"];
  } else if (value["endingReached"] === true) {
    endingReached = visited[visited.length - 1] ?? "ending";
  }
  return {
    currentNode:
      typeof value["currentNode"] === "string"
        ? value["currentNode"]
        : value["currentNode"] === null
          ? null
          : null,
    flags,
    visited,
    history,
    endingReached,
  };
}

function mapClan(value: unknown): ClanSave {
  const defaults = createDefaultClanSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const members: ClanMemberSave[] = [];
  if (Array.isArray(value["members"])) {
    for (const entry of value["members"]) {
      if (!isRecord(entry)) {
        continue;
      }
      const roleRaw = asString(entry["role"], "collector");
      const role = (CLAN_ROLES as readonly string[]).includes(roleRaw)
        ? (roleRaw as ClanRole)
        : "collector";
      members.push({
        id: asNonNegInt(entry["id"], members.length + 1),
        name: asString(entry["name"], "Member"),
        role,
        level: Math.max(1, asNonNegInt(entry["level"], 1)),
        experience: asNonNegInt(entry["experience"], 0),
        progress: Math.max(0, asFiniteNumber(entry["progress"], 0)),
        expToNextLevel: Math.max(1, asFiniteNumber(entry["expToNextLevel"], 100)),
        baseCollectRate: Math.max(0, asFiniteNumber(entry["baseCollectRate"], 1)),
      });
    }
  }
  const expeditionStatus: Record<string, boolean> = {};
  if (isRecord(value["expeditionStatus"])) {
    for (const [key, status] of Object.entries(value["expeditionStatus"])) {
      if (typeof status === "boolean") {
        expeditionStatus[key] = status;
      }
    }
  }
  const raidRaw = isRecord(value["raid"]) ? value["raid"] : {};
  const raidMembers: number[] = [];
  if (Array.isArray(raidRaw["members"])) {
    for (const id of raidRaw["members"]) {
      const n = asNonNegInt(id, -1);
      if (n >= 0) {
        raidMembers.push(n);
      }
    }
  }
  return {
    members,
    nextId: Math.max(1, asNonNegInt(value["nextId"], members.length + 1)),
    expeditionStatus,
    raid: {
      active: asBoolean(raidRaw["active"], false),
      members: raidMembers,
      durationSeconds: asNonNegInt(raidRaw["durationSeconds"], 0),
      maxDuration: Math.max(1, asNonNegInt(raidRaw["maxDuration"], 3600)),
      lastRaidTime: asNonNegInt(raidRaw["lastRaidTime"], 0),
      rewardClaimed: asBoolean(raidRaw["rewardClaimed"], false),
    },
  };
}

function mapFriends(value: unknown): Phase2SavePayload["friends"] {
  if (!isRecord(value)) {
    return createDefaultFriendsSave();
  }
  const list: FriendEntrySave[] = [];
  if (Array.isArray(value["list"])) {
    for (const entry of value["list"]) {
      if (!isRecord(entry) || typeof entry["name"] !== "string") {
        continue;
      }
      list.push({
        name: entry["name"],
        added: asNonNegInt(entry["added"], 0),
      });
    }
  }
  const mapRequest = (raw: unknown): FriendRequestSave | null => {
    if (!isRecord(raw)) {
      return null;
    }
    if (typeof raw["from"] !== "string" || typeof raw["to"] !== "string") {
      return null;
    }
    return {
      from: raw["from"],
      to: raw["to"],
      timestamp: asNonNegInt(raw["timestamp"], 0),
    };
  };
  const pending: FriendRequestSave[] = [];
  if (Array.isArray(value["pending"])) {
    for (const entry of value["pending"]) {
      const mapped = mapRequest(entry);
      if (mapped !== null) {
        pending.push(mapped);
      }
    }
  }
  const sent: FriendRequestSave[] = [];
  if (Array.isArray(value["sent"])) {
    for (const entry of value["sent"]) {
      const mapped = mapRequest(entry);
      if (mapped !== null) {
        sent.push(mapped);
      }
    }
  }
  return { list, pending, sent };
}

function mapLeaderboard(value: unknown, now: number): LeaderboardSave {
  const defaults = createDefaultLeaderboardSave(now);
  if (!isRecord(value)) {
    return defaults;
  }
  return {
    highestPrestige: asNonNegInt(value["highestPrestige"], 0),
    totalPrestiges: asNonNegInt(value["totalPrestiges"], 0),
    fastestBossKill: nullableTime(value["fastestBossKill"]),
    totalBossesDefeated: asNonNegInt(value["totalBossesDefeated"], 0),
    highestChapterReached: asNonNegInt(value["highestChapterReached"], 0),
    highestLevel: asNonNegInt(value["highestLevel"], 1),
    fastestLevelUp: nullableTime(value["fastestLevelUp"]),
    highestCraftingLevel: asNonNegInt(value["highestCraftingLevel"], 1),
    totalMasterworksCrafted: asNonNegInt(value["totalMasterworksCrafted"], 0),
    highestItemQuality: asNonNegInt(value["highestItemQuality"], 0),
    peakParticlesPerSecond: Math.max(
      0,
      asFiniteNumber(value["peakParticlesPerSecond"], 0),
    ),
    totalParticlesCollected: asNonNegInt(value["totalParticlesCollected"], 0),
    peakRelicsPerSecond: Math.max(
      0,
      asFiniteNumber(value["peakRelicsPerSecond"], 0),
    ),
    totalRelicsCollected: asNonNegInt(value["totalRelicsCollected"], 0),
    totalExpeditions: asNonNegInt(value["totalExpeditions"], 0),
    successfulExpeditions: asNonNegInt(value["successfulExpeditions"], 0),
    achievementsUnlocked: asNonNegInt(value["achievementsUnlocked"], 0),
    fastestPrestige: nullableTime(value["fastestPrestige"]),
    totalPlayTime: asNonNegInt(value["totalPlayTime"], 0),
    sessionCount: asNonNegInt(value["sessionCount"], 0),
    lastPlayed: asNonNegInt(value["lastPlayed"], now),
  };
}

function mapAccountVault(value: unknown): AccountVaultSave {
  const defaults = createDefaultAccountVaultSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const itemsRaw = Array.isArray(value["items"])
    ? value["items"]
    : Array.isArray(value["sharedVault"])
      ? value["sharedVault"]
      : [];
  const items: ItemSave[] = [];
  let index = 0;
  for (const entry of itemsRaw) {
    const mapped = mapItem(entry, `v1_vault_${String(index)}`);
    index += 1;
    if (mapped !== null) {
      items.push(mapped);
    }
  }
  return {
    particles: asDigitString(value["particles"]),
    relics: asDigitString(value["relics"]),
    artifacts: asDigitString(value["artifacts"]),
    memoryDust: asDigitString(value["memoryDust"]),
    items,
  };
}

function mapIdleGenerators(
  value: unknown,
): Phase2SavePayload["idleGenerators"] {
  if (!isRecord(value) || !isRecord(value["gedankenArchiv"])) {
    return { gedankenArchiv: { ...DEFAULT_ARCHIV } };
  }
  const archiv = value["gedankenArchiv"];
  const upgrades = isRecord(archiv["upgrades"]) ? archiv["upgrades"] : {};
  return {
    gedankenArchiv: {
      level: asNonNegInt(archiv["level"], 0),
      baseCost: Math.max(0, asFiniteNumber(archiv["baseCost"], 10)),
      costMultiplier: Math.max(1, asFiniteNumber(archiv["costMultiplier"], 1.15)),
      baseYield: Math.max(0, asFiniteNumber(archiv["baseYield"], 1)),
      upgrades: {
        focusBonus: Math.max(0, asFiniteNumber(upgrades["focusBonus"], 0)),
      },
    },
  };
}

function mapChallenges(value: unknown): Phase2SavePayload["challenges"] {
  const defaults = createDefaultChallengesSave();
  if (!isRecord(value)) {
    return defaults;
  }
  const completed: string[] = [];
  if (Array.isArray(value["completed"])) {
    for (const id of value["completed"]) {
      if (typeof id === "string") {
        completed.push(id);
      }
    }
  }
  return {
    active:
      typeof value["active"] === "string"
        ? value["active"]
        : value["active"] === null
          ? null
          : null,
    completed,
    pacifistUnlocked: asBoolean(
      value["pacifistUnlocked"] ?? value["_pacifistUnlocked"],
      false,
    ),
    droughtBonus: asBoolean(
      value["droughtBonus"] ?? value["_droughtBonus"],
      false,
    ),
  };
}

function mapTalents(
  topLevel: unknown,
  hero: Record<string, unknown> | null,
): Phase2SavePayload["talents"] {
  const heroTalents = hero !== null ? hero["talents"] : undefined;
  const source = isRecord(topLevel)
    ? topLevel
    : isRecord(heroTalents)
      ? heroTalents
      : null;
  if (source === null) {
    return createDefaultTalentsSave();
  }
  const allocatedNodeIds: string[] = [];
  if (Array.isArray(source["allocatedNodeIds"])) {
    for (const id of source["allocatedNodeIds"]) {
      if (typeof id === "string") {
        allocatedNodeIds.push(id);
      }
    }
  }
  return {
    points: asNonNegInt(source["points"], 0),
    allocatedNodeIds,
  };
}

export type V1ImportOptions = {
  readonly savedAt?: number;
  /** Optional separate account-vault record from v1 IndexedDB. */
  readonly accountVault?: unknown;
};

export type V1ImportUnwrap = {
  readonly state: Record<string, unknown>;
  readonly savedAt: number;
  readonly accountVault: unknown;
};

/**
 * Unwrap common v1 persistence wrappers into inner state.
 */
export function unwrapV1Save(
  raw: unknown,
  options: V1ImportOptions = {},
): ValidationResult<V1ImportUnwrap> {
  if (!isRecord(raw)) {
    return { ok: false, error: "v1 save must be an object" };
  }

  // Reject already-v2 envelopes (use migrateSaveEnvelope instead).
  if (
    raw["schemaVersion"] === 1 &&
    "payload" in raw &&
    typeof raw["savedAt"] === "number"
  ) {
    return {
      ok: false,
      error: "input is already a v2 SaveEnvelope; use migrateSaveEnvelope",
    };
  }

  let stateCandidate: unknown = raw;
  let savedAt = options.savedAt ?? Date.now();
  let accountVault: unknown = options.accountVault ?? null;

  if (isRecord(raw["state"])) {
    stateCandidate = raw["state"];
    if (typeof raw["timestamp"] === "number" && Number.isFinite(raw["timestamp"])) {
      savedAt = raw["timestamp"];
    }
    if (accountVault === null) {
      accountVault = raw["vaultData"] ?? raw["accountVault"] ?? null;
    }
  } else if ("saveData" in raw) {
    const saveData = raw["saveData"];
    if (isRecord(saveData) && isRecord(saveData["state"])) {
      stateCandidate = saveData["state"];
    } else {
      stateCandidate = saveData;
    }
    if (typeof raw["timestamp"] === "number" && Number.isFinite(raw["timestamp"])) {
      savedAt = raw["timestamp"];
    }
  }

  if (!isRecord(stateCandidate)) {
    return { ok: false, error: "v1 save state must be an object" };
  }

  if (
    !("resources" in stateCandidate) &&
    !("hero" in stateCandidate) &&
    !("idleGenerators" in stateCandidate)
  ) {
    return {
      ok: false,
      error: "v1 save missing resources/hero/idleGenerators",
    };
  }

  if (accountVault === null && isRecord(stateCandidate["accountVault"])) {
    accountVault = stateCandidate["accountVault"];
  }

  return {
    ok: true,
    value: {
      state: stateCandidate,
      savedAt: options.savedAt ?? savedAt,
      accountVault,
    },
  };
}

/**
 * Map unwrapped v1 state → Phase2SavePayload (not yet validated).
 */
export function mapV1StateToPayload(
  state: Record<string, unknown>,
  options: { readonly accountVault?: unknown; readonly now?: number } = {},
): Phase2SavePayload {
  const now = options.now ?? Date.now();
  const heroRaw = isRecord(state["hero"]) ? state["hero"] : null;
  const system = isRecord(state["system"]) ? state["system"] : null;
  const resourcesRaw = isRecord(state["resources"]) ? state["resources"] : {};
  const storyRaw = isRecord(state["story"]) ? state["story"] : {};
  const leaderboard = mapLeaderboard(state["leaderboard"], now);
  const selectedChapter = Math.max(
    1,
    asNonNegInt(
      storyRaw["selectedChapter"],
      leaderboard.highestChapterReached > 0
        ? leaderboard.highestChapterReached
        : 1,
    ),
  );

  const craftedFromHero =
    heroRaw !== null ? asNonNegInt(heroRaw["_craftedRecipeCount"], 0) : 0;
  const forgeRaw = isRecord(state["forge"]) ? state["forge"] : {};
  const craftedCount = asNonNegInt(
    forgeRaw["craftedCount"],
    craftedFromHero,
  );

  const tutorialFinished = asBoolean(
    system?.["tutorialFinished"],
    system?.["tutorialStep"] === -1 || system?.["tutorialStep"] === undefined
      ? true
      : false,
  );
  const tutorialStep = tutorialFinished
    ? Math.max(0, asNonNegInt(system?.["tutorialStep"], 0))
    : asNonNegInt(system?.["tutorialStep"], 0);

  const clickPowerLevel = asNonNegInt(
    isRecord(state["gather"])
      ? state["gather"]["clickPowerLevel"]
      : heroRaw?.["clickPowerLevel"],
    0,
  );

  const lastActiveAt = asNonNegInt(
    isRecord(state["meta"])
      ? state["meta"]["lastActiveAt"]
      : system?.["lastSave"],
    now,
  );

  const vaultSource =
    options.accountVault ??
    state["accountVault"] ??
    null;

  return {
    resources: {
      particles: asDigitString(resourcesRaw["particles"]),
      totalParticles: asDigitString(resourcesRaw["totalParticles"]),
      mnemeFragmente: asDigitString(resourcesRaw["mnemeFragmente"]),
      totalMnemeFragmente: asDigitString(resourcesRaw["totalMnemeFragmente"]),
      ewigeMneme: asDigitString(resourcesRaw["ewigeMneme"]),
      relics: asDigitString(resourcesRaw["relics"]),
      totalRelics: asDigitString(resourcesRaw["totalRelics"]),
      artifacts: asDigitString(resourcesRaw["artifacts"]),
      memoryDust: asDigitString(resourcesRaw["memoryDust"]),
      catalyst: asDigitString(resourcesRaw["catalyst"]),
    },
    idleGenerators: mapIdleGenerators(state["idleGenerators"]),
    gather: { clickPowerLevel },
    hero: mapHero(state["hero"]),
    story: {
      storyFightsIntroSeen: asBoolean(
        isRecord(state["story"]) &&
          typeof state["story"]["storyFightsIntroSeen"] === "boolean"
          ? state["story"]["storyFightsIntroSeen"]
          : system?.["storyFightsIntroSeen"],
        createDefaultStorySave().storyFightsIntroSeen,
      ),
      selectedChapter,
    },
    settings: mapSettings(state["settings"], system),
    quests: mapQuests(state["quests"]),
    achievements: mapAchievements(state["achievements"]),
    forge: { craftedCount },
    crafting: (() => {
      const defaults = createDefaultCraftingSave();
      if (!isRecord(state["crafting"])) {
        return defaults;
      }
      const unlockedRecipes: string[] = [];
      if (Array.isArray(state["crafting"]["unlockedRecipes"])) {
        for (const id of state["crafting"]["unlockedRecipes"]) {
          if (typeof id === "string") {
            unlockedRecipes.push(id);
          }
        }
      }
      return {
        level: Math.max(1, asNonNegInt(state["crafting"]["level"], 1)),
        exp: asNonNegInt(state["crafting"]["exp"], 0),
        expToNext: Math.max(1, asFiniteNumber(state["crafting"]["expToNext"], 100)),
        unlockedRecipes,
      };
    })(),
    library: (() => {
      const defaults = createDefaultLibrarySave();
      if (!isRecord(state["library"]) || !isRecord(state["library"]["upgrades"])) {
        return defaults;
      }
      const upgrades = state["library"]["upgrades"];
      return {
        upgrades: {
          gather_boost: asNonNegInt(upgrades["gather_boost"], 0),
          clan_boost: asNonNegInt(upgrades["clan_boost"], 0),
          forge_discount: asNonNegInt(upgrades["forge_discount"], 0),
        },
      };
    })(),
    talents: mapTalents(state["talents"], heroRaw),
    challenges: mapChallenges(state["challenges"]),
    codex: mapCodex(state["codex"], state["lore"]),
    storyBranch: mapStoryBranch(state["storyBranch"]),
    relicHunt: (() => {
      if (!isRecord(state["relicHunt"])) {
        return createDefaultRelicHuntSave();
      }
      return {
        cooldownEnd: asNonNegInt(state["relicHunt"]["cooldownEnd"], 0),
      };
    })(),
    accountVault: mapAccountVault(vaultSource),
    tutorial: {
      step: tutorialStep,
      finished: tutorialFinished,
    },
    friends: mapFriends(state["friends"]),
    clan: mapClan(state["clan"]),
    leaderboard,
    meta: { lastActiveAt },
  };
}

/**
 * Convert a v1 save (any common wrapper) into a validated v2 SaveEnvelope.
 */
export function importV1Save(
  raw: unknown,
  options: V1ImportOptions = {},
): ValidationResult<SaveEnvelope> {
  const unwrapped = unwrapV1Save(raw, options);
  if (!unwrapped.ok) {
    return unwrapped;
  }

  const mapped = mapV1StateToPayload(unwrapped.value.state, {
    accountVault: unwrapped.value.accountVault,
    now: unwrapped.value.savedAt,
  });

  const validated = validatePhase2SavePayload(mapped);
  if (!validated.ok) {
    return {
      ok: false,
      error: `v1 import validation failed: ${validated.error}`,
    };
  }

  return {
    ok: true,
    value: createSaveEnvelope(validated.value, unwrapped.value.savedAt),
  };
}

/** Convenience: parse JSON text then import. */
export function importV1SaveJson(
  text: string,
  options: V1ImportOptions = {},
): ValidationResult<SaveEnvelope> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: "invalid JSON" };
  }
  return importV1Save(parsed, options);
}
