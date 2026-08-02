import type { I18nKey } from "@adv/content";
import { formatAmount } from "@adv/core";
import type { ClanRole } from "@adv/protocol";
import { useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { Tip, TipBubble } from "../Tip";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

const ROLE_LABELS: Record<ClanRole, string> = {
  collector: "Sammler",
  weaver: "Weber",
  guardian: "Wächter",
  archivist: "Archivar",
  elder: "Ältester",
};

const ROLE_TIP_KEY: Record<ClanRole, I18nKey> = {
  collector: "clan.roleTip.collector",
  weaver: "clan.roleTip.weaver",
  guardian: "clan.roleTip.guardian",
  archivist: "clan.roleTip.archivist",
  elder: "clan.roleTip.elder",
};

const RECRUIT_ROLES: readonly ClanRole[] = [
  "collector",
  "weaver",
  "guardian",
  "archivist",
  "elder",
];

export function ClanPanel({ session }: Props) {
  const state = useStore(session.store);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const members = session.clan.getMembers();
  const selected = selectedId !== null ? session.clan.getMember(selectedId) : null;
  const raid = state.clan.raid;
  const t = session.i18n.translate.bind(session.i18n);

  return (
    <section class="hub-panel" data-testid="clan-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.clan")}</h2>
      <p class="game__meta">
        Particles: {formatAmount(state.resources.particles)} · Mitglieder:{" "}
        {String(members.length)}
      </p>

      <h3 class="panel__sub">Mitglieder</h3>
      <ul class="hub-list">
        {members.length === 0 ? (
          <li class="game__meta">Noch keine Mitglieder.</li>
        ) : (
          members.map((member) => {
            const onExp =
              state.clan.expeditionStatus[String(member.id)] === true;
            return (
              <li key={member.id} class="hub-card hub-card--compact">
                <button
                  type="button"
                  class="hub-card__title"
                  data-testid={`clan-member-${String(member.id)}`}
                  onClick={() => {
                    setSelectedId(member.id);
                  }}
                >
                  {member.name}
                </button>
                <p class="game__meta">
                  <Tip
                    title={ROLE_LABELS[member.role]}
                    text={t(ROLE_TIP_KEY[member.role])}
                  >
                    {ROLE_LABELS[member.role]}
                  </Tip>
                  {" · Lv "}
                  {String(member.level)} · {String(Math.floor(member.progress))}
                  %{onExp ? " · Expedition" : ""}
                </p>
                <button
                  type="button"
                  class="game__btn"
                  data-testid={`clan-dismiss-${String(member.id)}`}
                  disabled={onExp}
                  onClick={() => {
                    session.clan.dismissMember(member.id);
                    if (selectedId === member.id) {
                      setSelectedId(null);
                    }
                  }}
                >
                  Entlassen
                </button>
              </li>
            );
          })
        )}
      </ul>

      {selected !== null ? (
        <article class="hub-card" data-testid="clan-expedition">
          <p class="hub-card__title">{selected.name}</p>
          <p class="game__meta">
            {ROLE_LABELS[selected.role]} · Stufe {String(selected.level)}
          </p>
          <button
            type="button"
            class="game__btn game__btn--primary"
            data-testid="clan-start-expedition"
            disabled={session.clan.isOnExpedition(selected.id)}
            onClick={() => {
              session.clan.startExpedition(selected.id, 20);
            }}
          >
            Expedition starten (20s)
          </button>
        </article>
      ) : null}

      <div id="clan-recruit-panel" data-testid="clan-recruit-panel">
        <h3 class="panel__sub">Neue Mitglieder anwerben</h3>
        <ul class="hub-list">
          {RECRUIT_ROLES.map((role) => {
            const cost = session.clan.getRecruitCost(role);
            return (
              <li key={role} class="hub-card hub-card--compact tip tip--below">
                <p class="hub-card__title">{ROLE_LABELS[role]}</p>
                <p class="game__meta">{formatAmount(cost)} Partikel</p>
                <TipBubble title={ROLE_LABELS[role]}>
                  {t(ROLE_TIP_KEY[role])}
                </TipBubble>
                <button
                  type="button"
                  class="game__btn game__btn--primary"
                  data-testid={`clan-recruit-${role}`}
                  disabled={state.resources.particles < BigInt(cost)}
                  onClick={() => {
                    session.clan.recruitMember(role);
                  }}
                >
                  Rekrutieren
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <h3 class="panel__sub">Clan-Raid</h3>
      {raid.active ? (
        <p class="game__meta">
          Raid aktiv · {String(raid.durationSeconds)}s verbleibend
          {raid.durationSeconds === 0 ? (
            <>
              {" "}
              <button
                type="button"
                class="game__btn game__btn--primary"
                data-testid="clan-claim-raid"
                onClick={() => {
                  session.clan.claimRaidReward();
                }}
              >
                Beute abholen
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <Tip text={t("clan.raidTip")}>
          <button
            type="button"
            class="game__btn"
            data-testid="clan-start-raid"
            disabled={members.length === 0}
            onClick={() => {
              const idle = members
                .filter((m) => !session.clan.isOnExpedition(m.id))
                .slice(0, 5)
                .map((m) => m.id);
              session.clan.startClanRaid(idle);
            }}
          >
            Raid starten (bis 5 Idle)
          </button>
        </Tip>
      )}
    </section>
  );
}
