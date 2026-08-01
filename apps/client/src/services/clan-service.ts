import type { EventBus, Store } from "@adv/core";
import { calculateBuildingCost, CONFIG } from "@adv/sim";
import type { ClanMemberSave, ClanRole, ItemSave } from "@adv/protocol";

import type { GameState } from "../state/game-state";
import type { LibraryService } from "./library-service";
import type { ResourceService } from "./resource-service";
import { sanitizeClientText } from "./sanitize-client-text";

const ROLE_BASE_RATES: Record<ClanRole, number> = {
  collector: 2.0,
  weaver: 1.2,
  guardian: 0.8,
  archivist: 2.5,
  elder: 3.5,
};

const ROLE_BASE_COSTS: Record<ClanRole, number> = {
  collector: 10,
  weaver: 25,
  guardian: 40,
  archivist: 200,
  elder: 500,
};

const FIRST_NAMES = [
  "Lyra",
  "Theron",
  "Kael",
  "Elara",
  "Vane",
  "Sira",
  "Jace",
  "Rin",
  "Valerius",
  "Selene",
  "Gideon",
  "Aurelia",
  "Cassian",
  "Vespera",
  "Helena",
  "Lysander",
  "Aegon",
  "Nyx",
] as const;

const LAST_NAMES = [
  "Nebelläufer",
  "Schattenweber",
  "Geistwächter",
  "Traumwandler",
  "Staubgeborener",
  "Ewigkeitssucher",
  "Seelenwächter",
  "Gedankenleser",
  "Wortweber",
  "Schleierbrecher",
  "Runenmeister",
] as const;

type ActiveExpedition = {
  remainingTime: number;
  readonly duration: number;
  readonly successChance: number;
  readonly isRaid?: boolean;
};

export type ClanRaidResult =
  | { readonly success: true; readonly message?: string }
  | { readonly success: false; readonly message: string };

export type ClanService = {
  getMembers(): readonly ClanMemberSave[];
  getMember(id: number): ClanMemberSave | null;
  isOnExpedition(memberId: number): boolean;
  getActiveExpedition(memberId: number): ActiveExpedition | null;
  getRecruitCost(role: ClanRole): number;
  recruitMember(role: ClanRole): boolean;
  dismissMember(id: number): boolean;
  startExpedition(memberId: number, durationSeconds?: number): boolean;
  startMultipleExpeditions(
    memberIds: readonly number[],
    durationSeconds?: number,
  ): number;
  startClanRaid(memberIds: readonly number[]): ClanRaidResult;
  claimRaidReward(): ClanRaidResult & {
    readonly catalystAmount?: number;
  };
  processTick(deltaMs: number): void;
  destroy(): void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isClanRole(value: string): value is ClanRole {
  return value in ROLE_BASE_COSTS;
}

function readActivePact(hero: GameState["hero"]): string | undefined {
  const prestige = hero.prestige as { activePact?: string };
  return prestige.activePact;
}

function createRaidLootItem(): ItemSave {
  const slots = ["weapon", "armor", "amulet", "ring"] as const;
  const slot = slots[Math.floor(Math.random() * slots.length)] ?? "weapon";
  const rarityRoll = Math.random();
  const rarity =
    rarityRoll > 0.9 ? "legendary" : rarityRoll > 0.5 ? "epic" : "rare";
  const power = 10 + Math.floor(Math.random() * 10);
  const stats = { attack: 0, defense: 0, agility: 0, stamina: 0 };
  if (slot === "weapon") {
    stats.attack = power;
  } else if (slot === "armor") {
    stats.defense = power;
  } else if (slot === "amulet") {
    stats.attack = Math.floor(power / 2);
    stats.stamina = Math.floor(power / 2);
  } else {
    stats.defense = Math.floor(power / 2);
    stats.agility = Math.floor(power / 2);
  }
  return {
    id: `raid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: "Schicksalsklinge der Raids",
    slot,
    rarity,
    level: 1,
    stats,
  };
}

export function createClanService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  library: LibraryService,
): ClanService {
  const activeExpeditions = new Map<number, ActiveExpedition>();
  let raidMillisAccumulator = 0;

  const getMembers = (): readonly ClanMemberSave[] =>
    store.getState().clan.members;

  const getMember = (id: number): ClanMemberSave | null =>
    getMembers().find((m) => m.id === id) ?? null;

  const calculateSuccessChance = (member: ClanMemberSave): number => {
    const base = 0.5;
    const levelBonus = (member.level - 1) * 0.05;
    let roleBonus = 0;
    if (member.role === "collector") {
      roleBonus = 0.1;
    } else if (member.role === "guardian") {
      roleBonus = 0.2;
    }
    return clamp(base + levelBonus + roleBonus, 0.05, 0.95);
  };

  const generateReward = (
    member: ClanMemberSave,
  ): { particles?: number; relics?: number; artifacts?: number } => {
    if (member.role === "collector") {
      return { particles: 5 + Math.floor(Math.random() * 6) };
    }
    if (member.role === "weaver") {
      return { relics: 1 + Math.floor(Math.random() * 2) };
    }
    if (member.role === "guardian") {
      return { artifacts: 1 };
    }
    return {};
  };

  const addMemberExperience = (memberId: number, amount: number): void => {
    if (amount <= 0) {
      return;
    }
    store.setState((prev) => {
      const index = prev.clan.members.findIndex((m) => m.id === memberId);
      const existing = prev.clan.members[index];
      if (index === -1 || existing === undefined) {
        return prev;
      }
      const members = [...prev.clan.members];
      const member = { ...existing };
      member.experience += amount;
      while (member.experience >= member.expToNextLevel) {
        member.experience -= member.expToNextLevel;
        member.level += 1;
        member.expToNextLevel = Math.floor(member.expToNextLevel * 1.15);
        eventBus.publish("clan:memberLevelUp", {
          memberId,
          newLevel: member.level,
        });
      }
      members[index] = member;
      return { ...prev, clan: { ...prev.clan, members } };
    });
  };

  const completeExpedition = (memberId: number): void => {
    const expedition = activeExpeditions.get(memberId);
    if (!expedition) {
      return;
    }
    activeExpeditions.delete(memberId);

    if (expedition.isRaid) {
      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          expeditionStatus: {
            ...prev.clan.expeditionStatus,
            [String(memberId)]: false,
          },
        },
      }));
      return;
    }

    const success = Math.random() < expedition.successChance;
    let reward: { particles?: number; relics?: number; artifacts?: number } | null =
      null;
    const member = getMember(memberId);

    if (success && member) {
      reward = generateReward(member);
      if (reward.particles) {
        resources.addParticles(reward.particles);
      }
      if (reward.relics) {
        resources.addRelics(reward.relics);
      }
      if (reward.artifacts) {
        resources.addArtifacts(reward.artifacts);
      }
    }

    const expGain = success ? 5 + Math.floor(Math.random() * 5) : 1;

    store.setState((prev) => {
      const index = prev.clan.members.findIndex((m) => m.id === memberId);
      let updatedMembers = prev.clan.members;
      const existing = prev.clan.members[index];
      if (index !== -1 && existing !== undefined) {
        const membersCopy = [...prev.clan.members];
        const m = { ...existing };
        m.experience += expGain;
        while (m.experience >= m.expToNextLevel) {
          m.experience -= m.expToNextLevel;
          m.level += 1;
          m.expToNextLevel = Math.floor(m.expToNextLevel * 1.15);
          eventBus.publish("clan:memberLevelUp", {
            memberId,
            newLevel: m.level,
          });
        }
        membersCopy[index] = m;
        updatedMembers = membersCopy;
      }
      return {
        ...prev,
        clan: {
          ...prev.clan,
          members: updatedMembers,
          expeditionStatus: {
            ...prev.clan.expeditionStatus,
            [String(memberId)]: false,
          },
        },
      };
    });

    eventBus.publish("expedition:complete", { memberId, success, reward });
  };

  return {
    getMembers,
    getMember,
    isOnExpedition(memberId) {
      return activeExpeditions.has(memberId);
    },
    getActiveExpedition(memberId) {
      return activeExpeditions.get(memberId) ?? null;
    },

    getRecruitCost(role) {
      const baseCost = ROLE_BASE_COSTS[role];
      const roleCount = getMembers().filter((m) => m.role === role).length;
      return calculateBuildingCost(baseCost, 1.15, roleCount);
    },

    recruitMember(role) {
      if (!isClanRole(role)) {
        return false;
      }
      const cost = this.getRecruitCost(role);
      const state = store.getState();
      if (state.resources.particles < BigInt(cost)) {
        return false;
      }

      const existingNames = state.clan.members.map((m) => m.name);
      let name = "";
      let attempts = 0;
      do {
        const first =
          FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] ?? "Lyra";
        const last =
          LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)] ??
          "Nebelläufer";
        name = `${first} ${last}`;
        attempts += 1;
      } while (existingNames.includes(name) && attempts < 100);

      const id = state.clan.nextId;
      const cleanName = sanitizeClientText(name, 50, `Mitglied ${String(id)}`);
      if (!resources.removeParticles(cost)) {
        return false;
      }

      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          members: [
            ...prev.clan.members,
            {
              id,
              name: cleanName,
              role,
              level: 1,
              experience: 0,
              progress: 0,
              expToNextLevel: 50,
              baseCollectRate: ROLE_BASE_RATES[role],
            },
          ],
          nextId: id + 1,
        },
      }));
      eventBus.publish("clan:memberRecruited", { memberId: id, name: cleanName, role });
      return true;
    },

    dismissMember(id) {
      if (activeExpeditions.has(id)) {
        return false;
      }
      const member = getMember(id);
      if (!member) {
        return false;
      }
      const baseCost = ROLE_BASE_COSTS[member.role];
      const refund = Math.floor(baseCost * 0.5);
      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          members: prev.clan.members.filter((m) => m.id !== id),
        },
      }));
      if (refund > 0) {
        resources.addParticles(refund);
      }
      eventBus.publish("clan:memberDismissed", { memberId: id });
      return true;
    },

    startExpedition(memberId, durationSeconds = 20) {
      const member = getMember(memberId);
      if (!member || activeExpeditions.has(memberId)) {
        return false;
      }
      const state = store.getState();
      let duration = Math.max(1, Math.floor(durationSeconds));
      if (readActivePact(state.hero) === "solitary_wanderer") {
        duration = Math.floor(duration * 1.5);
      }
      const successChance = calculateSuccessChance(member);
      activeExpeditions.set(memberId, {
        remainingTime: duration * 1000,
        duration,
        successChance,
      });
      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          expeditionStatus: {
            ...prev.clan.expeditionStatus,
            [String(memberId)]: true,
          },
        },
      }));
      eventBus.publish("expedition:started", {
        memberId,
        duration,
        successChance,
      });
      return true;
    },

    startMultipleExpeditions(memberIds, durationSeconds = 20) {
      if (memberIds.length === 0) {
        return 0;
      }
      const state = store.getState();
      let duration = Math.max(1, Math.floor(durationSeconds));
      if (readActivePact(state.hero) === "solitary_wanderer") {
        duration = Math.floor(duration * 1.5);
      }
      const newStatuses: Record<string, boolean> = {};
      let started = 0;
      for (const memberId of memberIds) {
        const member = getMember(memberId);
        if (!member || activeExpeditions.has(memberId)) {
          continue;
        }
        const successChance = calculateSuccessChance(member);
        activeExpeditions.set(memberId, {
          remainingTime: duration * 1000,
          duration,
          successChance,
        });
        newStatuses[String(memberId)] = true;
        started += 1;
        eventBus.publish("expedition:started", {
          memberId,
          duration,
          successChance,
        });
      }
      if (started === 0) {
        return 0;
      }
      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          expeditionStatus: {
            ...prev.clan.expeditionStatus,
            ...newStatuses,
          },
        },
      }));
      return started;
    },

    startClanRaid(memberIds) {
      if (memberIds.length === 0 || memberIds.length > 5) {
        return {
          success: false,
          message: "Wähle 1 bis maximal 5 Clan-Mitglieder aus.",
        };
      }
      const state = store.getState();
      if (state.clan.raid.active) {
        return {
          success: false,
          message: "Es läuft bereits ein aktiver Clan-Raid.",
        };
      }
      for (const memberId of memberIds) {
        const member = getMember(memberId);
        if (!member) {
          return {
            success: false,
            message: "Ein ausgewähltes Mitglied existiert nicht.",
          };
        }
        if (activeExpeditions.has(memberId)) {
          return {
            success: false,
            message: `${member.name} ist bereits auf einer normalen Expedition.`,
          };
        }
      }

      let duration = 300;
      if (readActivePact(state.hero) === "shadowy_legions") {
        duration = 150;
      }
      const newStatuses: Record<string, boolean> = {};
      for (const memberId of memberIds) {
        activeExpeditions.set(memberId, {
          remainingTime: duration * 1000,
          duration,
          successChance: 1,
          isRaid: true,
        });
        newStatuses[String(memberId)] = true;
      }

      store.setState((prev) => ({
        ...prev,
        clan: {
          ...prev.clan,
          expeditionStatus: {
            ...prev.clan.expeditionStatus,
            ...newStatuses,
          },
          raid: {
            active: true,
            members: [...memberIds],
            durationSeconds: duration,
            maxDuration: duration,
            lastRaidTime: Date.now(),
            rewardClaimed: false,
          },
        },
      }));
      eventBus.publish("clan:raidStarted", { memberIds, duration });
      return { success: true };
    },

    claimRaidReward() {
      const state = store.getState();
      const raid = state.clan.raid;
      if (!raid.active || raid.durationSeconds > 0) {
        return {
          success: false,
          message: "Raid ist noch nicht abgeschlossen.",
        };
      }
      if (raid.rewardClaimed) {
        return {
          success: false,
          message: "Belohnung wurde bereits abgeholt.",
        };
      }

      const catalystAmount = 1 + Math.floor(Math.random() * 3);
      const lootedItem = Math.random() < 0.3 ? createRaidLootItem() : null;
      const members = [...raid.members];

      for (const memberId of members) {
        addMemberExperience(memberId, 50);
      }

      resources.addCatalyst(catalystAmount);
      store.setState((prev) => {
        const newStatuses = { ...prev.clan.expeditionStatus };
        for (const memberId of members) {
          newStatuses[String(memberId)] = false;
        }
        const equipment = lootedItem
          ? [...prev.hero.inventory.equipment, lootedItem]
          : prev.hero.inventory.equipment;
        return {
          ...prev,
          hero: {
            ...prev.hero,
            inventory: { ...prev.hero.inventory, equipment },
          },
          clan: {
            ...prev.clan,
            expeditionStatus: newStatuses,
            raid: {
              active: false,
              members: [],
              durationSeconds: 0,
              maxDuration: 3600,
              lastRaidTime: Date.now(),
              rewardClaimed: true,
            },
          },
        };
      });

      for (const memberId of members) {
        activeExpeditions.delete(memberId);
      }
      eventBus.publish("clan:raidClaimed", { catalystAmount, lootedItem });
      return { success: true, catalystAmount };
    },

    processTick(deltaMs) {
      const delta = Math.max(0, deltaMs);
      if (delta <= 0) {
        return;
      }

      const raid = store.getState().clan.raid;
      if (raid.active && raid.durationSeconds > 0) {
        raidMillisAccumulator += delta;
        if (raidMillisAccumulator >= 1000) {
          const secondsPassed = Math.floor(raidMillisAccumulator / 1000);
          raidMillisAccumulator %= 1000;
          const nextSeconds = Math.max(0, raid.durationSeconds - secondsPassed);
          store.setState((prev) => ({
            ...prev,
            clan: {
              ...prev.clan,
              raid: { ...prev.clan.raid, durationSeconds: nextSeconds },
            },
          }));
          if (nextSeconds === 0) {
            eventBus.publish("clan:raidComplete", {});
          }
        }
      }

      const prestigeBonus = Number(store.getState().resources.ewigeMneme) * 2;
      const libraryBonus = library.getBonus("clan_boost");

      let particlesToCreate = 0;
      let relicsToCreate = 0;
      let artifactsToCreate = 0;
      const memberLevelUps: Array<{ memberId: number; newLevel: number }> = [];

      store.setState((prev) => {
        const members = prev.clan.members.map((m) => ({ ...m }));
        let needsUpdate = false;

        for (const member of members) {
          if (activeExpeditions.has(member.id)) {
            continue;
          }

          let rate = member.baseCollectRate * Math.pow(1.05, member.level - 1);
          rate *= 1 + prestigeBonus / 100;
          rate *= 1 + libraryBonus;

          const increment =
            (rate * delta) / CONFIG.CLAN.TICK_RATE_MS * 100;
          const newProgress = member.progress + increment;

          if (newProgress >= 100) {
            const cycles = Math.floor(newProgress / 100);
            member.progress = clamp(newProgress % 100, 0, 100);
            needsUpdate = true;

            for (let i = 0; i < cycles; i += 1) {
              const role = member.role;
              if (role === "collector") {
                particlesToCreate += 1;
              } else if (role === "weaver") {
                if (Math.random() < 0.1) {
                  relicsToCreate += 1;
                } else {
                  particlesToCreate += 2;
                }
              } else if (role === "guardian") {
                if (Math.random() < 0.05) {
                  artifactsToCreate += 1;
                } else {
                  particlesToCreate += 3;
                }
              } else if (role === "archivist") {
                if (Math.random() < 0.15) {
                  relicsToCreate += 1;
                } else {
                  particlesToCreate += 4;
                }
              } else {
                const rand = Math.random();
                if (rand < 0.1) {
                  artifactsToCreate += 1;
                } else if (rand < 0.3) {
                  relicsToCreate += 1;
                } else {
                  particlesToCreate += 6;
                }
              }

              member.experience += CONFIG.CLAN.EXP_PER_CYCLE;
              while (member.experience >= member.expToNextLevel) {
                member.experience -= member.expToNextLevel;
                member.level += 1;
                member.expToNextLevel = Math.floor(member.expToNextLevel * 1.15);
                memberLevelUps.push({
                  memberId: member.id,
                  newLevel: member.level,
                });
              }
            }
          } else {
            member.progress = clamp(newProgress, 0, 100);
            needsUpdate = true;
          }
        }

        if (!needsUpdate) {
          return prev;
        }
        return {
          ...prev,
          clan: { ...prev.clan, members },
        };
      });

      if (particlesToCreate > 0) {
        resources.addParticles(particlesToCreate);
      }
      if (relicsToCreate > 0) {
        resources.addRelics(relicsToCreate);
      }
      if (artifactsToCreate > 0) {
        resources.addArtifacts(artifactsToCreate);
      }
      for (const lvl of memberLevelUps) {
        eventBus.publish("clan:memberLevelUp", lvl);
      }

      const completed: number[] = [];
      for (const [memberId, expedition] of activeExpeditions) {
        expedition.remainingTime -= delta;
        if (expedition.remainingTime <= 0 && !expedition.isRaid) {
          completed.push(memberId);
        }
      }
      for (const memberId of completed) {
        completeExpedition(memberId);
      }

      if (getMembers().length > 0) {
        eventBus.publish("clan:membersUpdated", { members: getMembers() });
      }
    },

    destroy() {
      activeExpeditions.clear();
      raidMillisAccumulator = 0;
    },
  };
}
