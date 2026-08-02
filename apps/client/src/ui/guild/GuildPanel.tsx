import { useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function GuildPanel({ session }: Props) {
  useStore(session.store);
  const [guildName, setGuildName] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const guild = session.guild.getGuild();
  const members = session.guild.getMembers();
  const invites = session.guild.getInvites();
  const outgoing = session.guild.getOutgoingInvites();
  const myUserId = session.auth.store.getState().user?.id ?? null;
  const isOwner =
    guild !== null && myUserId !== null && guild.ownerId === myUserId;
  const error = session.guild.lastError();

  const run = (result: { success: boolean; message: string }): void => {
    setStatus(result.message);
    if (result.success) {
      session.guild.clearError();
    }
  };

  return (
    <section class="hub-panel" data-testid="guild-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.guild")}</h2>
      <p class="game__meta">
        Gründe eine Multiplayer-Gilde, lade Chronisten ein und nutze den
        Gilden-Chat.
      </p>

      {error !== null ? (
        <p class="game__meta" role="alert" data-testid="guild-error">
          {error}
        </p>
      ) : null}
      {status !== null && error === null ? (
        <p class="game__meta" data-testid="guild-status">
          {status}
        </p>
      ) : null}

      {invites.length > 0 ? (
        <>
          <h3 class="panel__sub">Einladungen ({invites.length})</h3>
          <ul class="hub-list">
            {invites.map((invite) => (
              <li key={invite.guildId} class="hub-card hub-card--compact">
                <p class="hub-card__title">{invite.guildName}</p>
                <p class="game__meta">von {invite.fromUsername}</p>
                <div class="game__actions">
                  <button
                    type="button"
                    class="game__btn game__btn--primary"
                    data-testid={`guild-accept-${invite.guildId}`}
                    onClick={() => {
                      run(session.guild.acceptInvite(invite.guildId));
                    }}
                  >
                    Annehmen
                  </button>
                  <button
                    type="button"
                    class="game__btn"
                    data-testid={`guild-decline-${invite.guildId}`}
                    onClick={() => {
                      run(session.guild.declineInvite(invite.guildId));
                    }}
                  >
                    Ablehnen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {guild === null ? (
        <>
          <h3 class="panel__sub">Neue Gilde</h3>
          <div class="game__actions">
            <input
              type="text"
              class="game__input"
              data-testid="guild-name-input"
              placeholder="Gildenname..."
              value={guildName}
              onInput={(e) => {
                setGuildName((e.target as HTMLInputElement).value);
              }}
            />
            <button
              type="button"
              class="game__btn game__btn--primary"
              data-testid="guild-create"
              onClick={() => {
                run(session.guild.create(guildName));
                setGuildName("");
              }}
            >
              Erstellen
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 class="panel__sub">
            {guild.name} ({members.length})
          </h3>
          <ul class="hub-list">
            {members.map((member) => (
              <li key={member.userId} class="hub-card hub-card--compact">
                <p class="hub-card__title">
                  {member.username}
                  {member.role === "owner" ? " · Führer" : ""}
                </p>
                {isOwner && member.userId !== myUserId ? (
                  <button
                    type="button"
                    class="game__btn"
                    data-testid={`guild-kick-${member.username}`}
                    onClick={() => {
                      run(session.guild.kick(member.username));
                    }}
                  >
                    Entfernen
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          {isOwner ? (
            <>
              <h3 class="panel__sub">Einladen</h3>
              <div class="game__actions">
                <input
                  type="text"
                  class="game__input"
                  data-testid="guild-invite-input"
                  placeholder="Spielername..."
                  value={inviteName}
                  onInput={(e) => {
                    setInviteName((e.target as HTMLInputElement).value);
                  }}
                />
                <button
                  type="button"
                  class="game__btn game__btn--primary"
                  data-testid="guild-invite"
                  onClick={() => {
                    run(session.guild.invite(inviteName));
                    setInviteName("");
                  }}
                >
                  Einladen
                </button>
              </div>
              {outgoing.length > 0 ? (
                <p class="game__meta">
                  Offene Einladungen:{" "}
                  {outgoing.map((o) => o.toUsername).join(", ")}
                </p>
              ) : null}
              <div class="game__actions">
                <button
                  type="button"
                  class="game__btn"
                  data-testid="guild-disband"
                  onClick={() => {
                    run(session.guild.disband());
                  }}
                >
                  Gilde auflösen
                </button>
              </div>
            </>
          ) : (
            <div class="game__actions">
              <button
                type="button"
                class="game__btn"
                data-testid="guild-leave"
                onClick={() => {
                  run(session.guild.leave());
                }}
              >
                Gilde verlassen
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
