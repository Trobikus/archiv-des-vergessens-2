import type { EventBus } from "@adv/core";

export type CombatHitType = "physical" | "mneme" | "heal";

export type DamageEvent = {
  readonly damage: number;
  readonly isCrit: boolean;
  readonly type: CombatHitType;
  readonly timestamp: number;
};

export type CombatStats = {
  readonly dps: number;
  readonly totalDamage: number;
  readonly maxHit: number;
  readonly avgHit: number;
  readonly totalHits: number;
  readonly critHits: number;
  readonly critRatePercent: number;
  readonly totalHeal: number;
  readonly totalMneme: number;
  readonly durationSeconds: number;
};

export type CombatAnalyticsService = {
  recordHit(damage: number, isCrit?: boolean, type?: CombatHitType): void;
  recordMnemeGained(amount: number): void;
  getCurrentDPS(): number;
  getStats(): CombatStats;
  reset(): void;
  destroy(): void;
};

export function createCombatAnalyticsService(
  eventBus?: EventBus,
): CombatAnalyticsService {
  let startTime = Date.now();
  let totalDamage = 0;
  let totalHits = 0;
  let critHits = 0;
  let maxHit = 0;
  let totalHeal = 0;
  let totalMneme = 0;
  let recentEvents: DamageEvent[] = [];

  const tickSub =
    eventBus?.subscribe("combat:tick", (data) => {
      const payload = data as {
        damage?: number;
        isCrit?: boolean;
        type?: CombatHitType;
        mnemeGained?: number;
      };
      if (payload.damage !== undefined) {
        service.recordHit(
          payload.damage,
          payload.isCrit ?? false,
          payload.type ?? "physical",
        );
      }
      if (payload.mnemeGained) {
        service.recordMnemeGained(payload.mnemeGained);
      }
    }) ?? -1;

  const service: CombatAnalyticsService = {
    recordHit(damage, isCrit = false, type = "physical") {
      if (damage <= 0) {
        return;
      }
      const now = Date.now();
      if (type === "heal") {
        totalHeal += damage;
      } else {
        totalDamage += damage;
        totalHits += 1;
        if (isCrit) {
          critHits += 1;
        }
        if (damage > maxHit) {
          maxHit = damage;
        }
      }
      recentEvents.push({ damage, isCrit, type, timestamp: now });
      recentEvents = recentEvents.filter(
        (entry) => now - entry.timestamp <= 10_000,
      );
      eventBus?.publish("combat:floating-text", { damage, isCrit, type });
    },

    recordMnemeGained(amount) {
      if (amount <= 0) {
        return;
      }
      totalMneme += amount;
      eventBus?.publish("combat:floating-text", {
        damage: amount,
        isCrit: false,
        type: "mneme",
      });
    },

    getCurrentDPS() {
      const now = Date.now();
      const windowEvents = recentEvents.filter((entry) => entry.type !== "heal");
      if (windowEvents.length === 0) {
        return 0;
      }
      const oldestTime = windowEvents[0]?.timestamp ?? now;
      const durationSeconds = Math.max(1, (now - oldestTime) / 1000);
      const windowDamage = windowEvents.reduce(
        (sum, entry) => sum + entry.damage,
        0,
      );
      return Math.round((windowDamage / durationSeconds) * 10) / 10;
    },

    getStats() {
      const elapsedSeconds = Math.max(1, (Date.now() - startTime) / 1000);
      const critRate =
        totalHits > 0 ? Math.round((critHits / totalHits) * 100) : 0;
      const avgHit =
        totalHits > 0 ? Math.round(totalDamage / totalHits) : 0;
      return {
        dps: this.getCurrentDPS(),
        totalDamage: Math.round(totalDamage),
        maxHit: Math.round(maxHit),
        avgHit,
        totalHits,
        critHits,
        critRatePercent: critRate,
        totalHeal: Math.round(totalHeal),
        totalMneme: Math.round(totalMneme),
        durationSeconds: Math.round(elapsedSeconds),
      };
    },

    reset() {
      startTime = Date.now();
      totalDamage = 0;
      totalHits = 0;
      critHits = 0;
      maxHit = 0;
      totalHeal = 0;
      totalMneme = 0;
      recentEvents = [];
    },

    destroy() {
      if (eventBus && tickSub !== -1) {
        eventBus.unsubscribe(tickSub);
      }
    },
  };

  return service;
}
