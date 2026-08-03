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

const ROLE_LABEL_KEY: Record<ClanRole, I18nKey> = {
  collector: "clan.role.collector",
  weaver: "clan.role.weaver",
  guardian: "clan.role.guardian",
  archivist: "clan.role.archivist",
  elder: "clan.role.elder",
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
      <h2 class="game__heading">{t("hub.clan")}</h2>
      <p class="game__meta">
        {t("clan.summary")
          .replace("{particlesLabel}", t("resource.particles"))
          .replace("{particles}", formatAmount(state.resources.particles))
          .replace("{membersLabel}", t("clan.members"))
          .replace("{count}", String(members.length))}
      </p>

      <h3 class="panel__sub">{t("clan.members")}</h3>
      <ul class="hub-list">
        {members.length === 0 ? (
          <li class="game__meta">{t("clan.empty")}</li>
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
                    title={t(ROLE_LABEL_KEY[member.role])}
                    text={t(ROLE_TIP_KEY[member.role])}
                  >
                    {t(ROLE_LABEL_KEY[member.role])}
                  </Tip>
                  {t("clan.levelShort").replace(
                    "{level}",
                    String(member.level),
                  )}{" "}
                  · {String(Math.floor(member.progress))}%
                  {onExp ? t("clan.onExpedition") : ""}
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
                  {t("clan.dismiss")}
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
            {t(ROLE_LABEL_KEY[selected.role])} ·{" "}
            {t("archiv.levelValue").replace(
              "{level}",
              String(selected.level),
            )}
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
            {t("clan.startExpedition").replace("{seconds}", "20")}
          </button>
        </article>
      ) : null}

      <div id="clan-recruit-panel" data-testid="clan-recruit-panel">
        <h3 class="panel__sub">{t("clan.recruitTitle")}</h3>
        <ul class="hub-list">
          {RECRUIT_ROLES.map((role) => {
            const cost = session.clan.getRecruitCost(role);
            return (
              <li key={role} class="hub-card hub-card--compact tip tip--below">
                <p class="hub-card__title">{t(ROLE_LABEL_KEY[role])}</p>
                <p class="game__meta">
                  {t("clan.costParticles").replace(
                    "{amount}",
                    formatAmount(cost),
                  )}
                </p>
                <TipBubble title={t(ROLE_LABEL_KEY[role])}>
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
                  {t("clan.recruit")}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <h3 class="panel__sub">{t("clan.raidTitle")}</h3>
      {raid.active ? (
        <p class="game__meta">
          {t("clan.raidActive").replace(
            "{seconds}",
            String(raid.durationSeconds),
          )}
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
                {t("clan.claimRaid")}
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
            {t("clan.startRaid")}
          </button>
        </Tip>
      )}
    </section>
  );
}
