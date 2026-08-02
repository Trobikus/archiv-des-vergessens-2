import { useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function FriendsPanel({ session }: Props) {
  useStore(session.store);
  const [friendInput, setFriendInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const friends = session.friends.getFriends();
  const pending = session.friends.getPendingRequests();
  const sent = session.friends.getSentRequests();
  const error = session.friends.lastError();

  const addFriend = (): void => {
    const result = session.friends.addFriend(friendInput);
    setStatus(result.message);
    if (result.success) {
      setFriendInput("");
      session.friends.clearError();
    }
  };

  return (
    <section class="hub-panel" data-testid="friends-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.friends")}</h2>
      <p class="game__meta">Verbinde dich mit anderen Hütern des Archivs.</p>
      {error !== null ? (
        <p class="game__meta" role="alert" data-testid="friend-error">
          {error}
        </p>
      ) : null}
      {status !== null && error === null ? (
        <p class="game__meta" data-testid="friend-status">
          {status}
        </p>
      ) : null}

      <div class="game__actions">
        <input
          type="text"
          class="game__input"
          data-testid="friend-input"
          placeholder="Name des Chronisten..."
          value={friendInput}
          onInput={(e) => {
            setFriendInput((e.target as HTMLInputElement).value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addFriend();
            }
          }}
        />
        <button
          type="button"
          class="game__btn game__btn--primary"
          data-testid="friend-add"
          onClick={addFriend}
        >
          Hinzufügen
        </button>
      </div>

      {pending.length > 0 ? (
        <>
          <h3 class="panel__sub">Ausstehende Anfragen ({pending.length})</h3>
          <ul class="hub-list">
            {pending.map((req) => (
              <li key={`${req.from}-${String(req.timestamp)}`} class="hub-card hub-card--compact">
                <p class="hub-card__title">{req.from}</p>
                <div class="game__actions">
                  <button
                    type="button"
                    class="game__btn game__btn--primary"
                    data-testid={`friend-accept-${req.from}`}
                    onClick={() => {
                      session.friends.acceptFriend(req.from);
                    }}
                  >
                    Annehmen
                  </button>
                  <button
                    type="button"
                    class="game__btn"
                    data-testid={`friend-decline-${req.from}`}
                    onClick={() => {
                      session.friends.declineFriendRequest(req.from);
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

      <h3 class="panel__sub">Deine Freunde ({friends.length})</h3>
      <ul class="hub-list">
        {friends.length === 0 ? (
          <li class="game__meta">Noch keine Freunde.</li>
        ) : (
          friends.map((friend) => (
            <li key={friend.name} class="hub-card hub-card--compact">
              <p class="hub-card__title">{friend.name}</p>
              <button
                type="button"
                class="game__btn"
                data-testid={`friend-remove-${friend.name}`}
                onClick={() => {
                  session.friends.removeFriend(friend.name);
                }}
              >
                Entfernen
              </button>
            </li>
          ))
        )}
      </ul>

      {sent.length > 0 ? (
        <>
          <h3 class="panel__sub">Gesendet ({sent.length})</h3>
          <ul class="hub-list">
            {sent.map((req) => (
              <li key={`${req.to}-${String(req.timestamp)}`} class="hub-card hub-card--compact">
                <p class="hub-card__title">{req.to}</p>
                <button
                  type="button"
                  class="game__btn"
                  data-testid={`friend-cancel-${req.to}`}
                  onClick={() => {
                    session.friends.cancelSentRequest(req.to);
                  }}
                >
                  Zurückziehen
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
