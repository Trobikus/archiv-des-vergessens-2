import type { I18nKey } from "@adv/content";
import type { StatKey } from "@adv/sim";

import type { GameSession } from "../../services/game-session";
import type { EquipmentState, InventoryItem } from "../../state/game-state";
import { useStore } from "../useStore";

export type HeroSubTab = "stats" | "inventory" | "equipment";

type Props = {
  readonly session: GameSession;
  readonly subTab: HeroSubTab;
};

const STATS: readonly StatKey[] = ["attack", "defense", "agility", "stamina"];

const STAT_LABEL_KEY: Record<StatKey, I18nKey> = {
  attack: "hero.atk",
  defense: "hero.def",
  agility: "hero.agi",
  stamina: "hero.sta",
};

const STAT_TIP_KEY: Record<StatKey, I18nKey> = {
  attack: "hero.statTip.attack",
  defense: "hero.statTip.defense",
  agility: "hero.statTip.agility",
  stamina: "hero.statTip.stamina",
};

const SLOT_LABEL_KEY: Record<keyof EquipmentState, I18nKey> = {
  weapon: "hero.slot.weapon",
  shield: "hero.slot.shield",
  helmet: "hero.slot.helmet",
  shoulders: "hero.slot.shoulders",
  armor: "hero.slot.armor",
  gloves: "hero.slot.gloves",
  belt: "hero.slot.belt",
  boots: "hero.slot.boots",
  amulet: "hero.slot.amulet",
  ring: "hero.slot.ring",
  ring2: "hero.slot.ring2",
};

const RARITY_LABEL_KEY: Record<
  "common" | "uncommon" | "rare" | "epic" | "legendary",
  I18nKey
> = {
  common: "hero.rarity.common",
  uncommon: "hero.rarity.uncommon",
  rare: "hero.rarity.rare",
  epic: "hero.rarity.epic",
  legendary: "hero.rarity.legendary",
};

const EQUIPMENT_SLOTS = Object.keys(SLOT_LABEL_KEY) as Array<
  keyof EquipmentState
>;

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function itemStatLines(
  item: InventoryItem,
  t: (key: I18nKey) => string,
): string[] {
  return STATS.filter((stat) => item.stats[stat] > 0).map(
    (stat) => `+${String(item.stats[stat])} ${t(STAT_LABEL_KEY[stat])}`,
  );
}

function slotLabelKey(slot: string): I18nKey {
  if (Object.prototype.hasOwnProperty.call(SLOT_LABEL_KEY, slot)) {
    return SLOT_LABEL_KEY[slot as keyof EquipmentState];
  }
  return "hero.slot.weapon";
}

type ItemRarityKey = keyof typeof RARITY_LABEL_KEY;

function rarityLabelKey(rarity: string): I18nKey {
  if (Object.prototype.hasOwnProperty.call(RARITY_LABEL_KEY, rarity)) {
    return RARITY_LABEL_KEY[rarity as ItemRarityKey];
  }
  return "hero.rarity.common";
}

function ItemTooltip({
  item,
  t,
}: {
  readonly item: InventoryItem;
  readonly t: (key: I18nKey) => string;
}) {
  const lines = itemStatLines(item, t);
  return (
    <span class="tip__bubble" role="tooltip">
      <strong class={`tip__title rarity--${item.rarity}`}>{item.name}</strong>
      <span>
        {t(rarityLabelKey(item.rarity))} · {t(slotLabelKey(item.slot))}
      </span>
      <span>
        {t("hero.itemLevel")} {String(item.level)}
      </span>
      {lines.length === 0
        ? null
        : lines.map((line) => <span key={line}>{line}</span>)}
    </span>
  );
}

export function HeroPanel({ session, subTab }: Props) {
  const state = useStore(session.store);
  const t = (key: I18nKey): string => session.i18n.translate(key);
  const attrs = session.hero.getAttributes();
  const combat = session.hero.getCombatStats();
  const hero = state.hero;

  return (
    <section class="panel" data-testid="hero-panel">
      <h2 class="game__heading">{t("hub.hero")}</h2>
      <p class="game__stat">
        {hero.name}
        <span class="game__unit"> · {hero.title}</span>
      </p>
      <p class="game__meta">
        {t("hero.level")} {String(hero.level)} · {t("hero.xp")}{" "}
        {String(hero.experience)}/{String(hero.expToNext)}
      </p>

      {subTab === "stats" ? (
        <div class="hero__section" data-testid="hero-stats">
          <p class="game__meta">
            {t("hero.statPoints")}: {String(hero.unspentStatPoints)}
          </p>

          <div class="hero__stat-grid">
            {STATS.map((stat) => {
              const gearBonus = Object.values(hero.equipment)
                .filter((piece): piece is InventoryItem => piece !== null)
                .reduce((sum, piece) => sum + piece.stats[stat], 0);
              return (
                <div key={stat} class="hero__stat-row tip tip--below">
                  <button
                    type="button"
                    class="game__btn hero__stat-btn"
                    data-testid={`spend-${stat}`}
                    disabled={hero.unspentStatPoints <= 0}
                    onClick={() => {
                      session.hero.spendStatPoint(stat);
                    }}
                  >
                    {t(STAT_LABEL_KEY[stat])} (+1)
                  </button>
                  <span class="hero__stat-value">{String(attrs[stat])}</span>
                  <span class="tip__bubble" role="tooltip">
                    <strong class="tip__title">{t(STAT_LABEL_KEY[stat])}</strong>
                    <span>{t(STAT_TIP_KEY[stat])}</span>
                    <span>
                      {t("hero.baseStats")}: {String(hero.baseStats[stat])}
                    </span>
                    <span>
                      {t("hero.spentStats")}: {String(hero.spentStats[stat])}
                    </span>
                    <span>
                      {t("hero.gearStats")}: {String(gearBonus)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <h3 class="panel__sub">{t("hero.combatStats")}</h3>
          <ul class="hero__derived">
            <li class="tip tip--below">
              {t("hero.hp")}: {String(combat.maxHp)}
              <span class="tip__bubble" role="tooltip">
                100 + {t("hero.sta")}×10 + {t("hero.def")}×2
              </span>
            </li>
            <li class="tip tip--below">
              {t("hero.crit")}: {formatPct(combat.critChance)}
              <span class="tip__bubble" role="tooltip">
                min(80, 5 + {t("hero.agi")}×0.5)
              </span>
            </li>
            <li class="tip tip--below">
              {t("hero.critDamage")}: {formatPct(combat.critDamage)}
              <span class="tip__bubble" role="tooltip">
                150 + {t("hero.atk")}×0.5
              </span>
            </li>
            <li class="tip tip--below">
              {t("hero.dodge")}: {formatPct(combat.dodgeChance)}
              <span class="tip__bubble" role="tooltip">
                min(50, {t("hero.agi")}×0.25)
              </span>
            </li>
            <li class="tip tip--below">
              {t("hero.damageReduction")}:{" "}
              {formatPct(combat.damageReduction * 100)}
              <span class="tip__bubble" role="tooltip">
                {t("hero.def")} / ({t("hero.def")} + 100)
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      {subTab === "inventory" ? (
        <div class="hero__section" data-testid="hero-inventory">
          {hero.inventory.equipment.length === 0 ? (
            <p class="game__meta">{t("hero.emptyInventory")}</p>
          ) : (
            <ul class="hero__item-list">
              {hero.inventory.equipment.map((item) => (
                <li key={item.id} class="hero__item tip">
                  <div class="hero__item-main">
                    <span class={`hero__item-name rarity--${item.rarity}`}>
                      {item.name}
                    </span>
                    <span class="game__meta">
                      {t(slotLabelKey(item.slot))} · {t("hero.itemLevel")}{" "}
                      {String(item.level)}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="game__btn"
                    data-testid={`equip-${item.id}`}
                    onClick={() => {
                      session.hero.equipFromInventory(item.id);
                    }}
                  >
                    {t("hero.equip")}
                  </button>
                  <ItemTooltip item={item} t={t} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {subTab === "equipment" ? (
        <div class="hero__section" data-testid="hero-equipment">
          <ul class="hero__item-list">
            {EQUIPMENT_SLOTS.map((slot) => {
              const item = hero.equipment[slot];
              return (
                <li
                  key={slot}
                  class={item === null ? "hero__item" : "hero__item tip"}
                  data-testid={`equip-slot-${slot}`}
                >
                  <div class="hero__item-main">
                    <span class="hero__slot-label">{t(SLOT_LABEL_KEY[slot])}</span>
                    {item === null ? (
                      <span class="game__meta">{t("hero.empty")}</span>
                    ) : (
                      <span class={`hero__item-name rarity--${item.rarity}`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  {item !== null ? (
                    <>
                      <button
                        type="button"
                        class="game__btn game__btn--ghost"
                        data-testid={`unequip-${slot}`}
                        onClick={() => {
                          session.hero.unequip(slot);
                        }}
                      >
                        {t("hero.unequip")}
                      </button>
                      <ItemTooltip item={item} t={t} />
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
