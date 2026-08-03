import {
  DEFAULT_MAP_REGION_ID,
  MAP_REGIONS,
  type MapRegion,
} from "@adv/content";
import { useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

const MAP_ART = `${import.meta.env.BASE_URL}scenes/scene-karte.png`;

export function MapPanel({ session }: Props) {
  const locale = useStore(session.store).settings.locale;
  const t = session.i18n.translate.bind(session.i18n);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_MAP_REGION_ID);
  const selected: MapRegion | null =
    MAP_REGIONS.find((region) => region.id === selectedId) ?? null;

  const nameOf = (region: MapRegion): string =>
    locale === "en" ? region.nameEn : region.nameDe;
  const blurbOf = (region: MapRegion): string =>
    locale === "en" ? region.blurbEn : region.blurbDe;

  return (
    <section class="map-panel" data-testid="map-panel">
      <aside class="map-panel__detail hub-panel" data-testid="map-detail">
        <h2 class="game__heading">{t("hub.mapTitle")}</h2>
        {selected ? (
          <>
            <p class="map-panel__name glow-text" data-testid="map-region-name">
              {nameOf(selected)}
            </p>
            <p class="map-panel__blurb">
              {selected.locked ? t("hub.mapLocked") : blurbOf(selected)}
            </p>
          </>
        ) : (
          <p class="game__meta">{t("hub.mapSelect")}</p>
        )}
      </aside>

      <div class="map-panel__board" data-testid="map-board">
        <div class="map-panel__frame">
          <img
            class="map-panel__art"
            src={MAP_ART}
            alt=""
            draggable={false}
          />
          {MAP_REGIONS.map((region) => {
            const entry: MapRegion = region;
            const active = entry.id === selectedId;
            const locked = entry.locked === true;
            return (
              <button
                key={entry.id}
                type="button"
                class={
                  active
                    ? locked
                      ? "map-hotspot is-active is-locked"
                      : "map-hotspot is-active"
                    : locked
                      ? "map-hotspot is-locked"
                      : "map-hotspot"
                }
                style={{
                  left: `${String(entry.xPct)}%`,
                  top: `${String(entry.yPct)}%`,
                }}
                data-testid={`map-hotspot-${entry.id}`}
                aria-pressed={active}
                aria-label={nameOf(entry)}
                disabled={locked}
                title={locked ? t("hub.mapLocked") : nameOf(entry)}
                onClick={() => {
                  setSelectedId(entry.id);
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
