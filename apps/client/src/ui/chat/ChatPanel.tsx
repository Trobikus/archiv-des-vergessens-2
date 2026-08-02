import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

type ChatTab = "global" | "clan";

export function ChatPanel({ session }: Props) {
  const state = useStore(session.store);
  const [tab, setTab] = useState<ChatTab>("global");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(session.chat.lastError());

  useEffect(() => {
    const sub = session.eventBus.subscribe("chat:error", (data) => {
      const payload = data as { error?: string };
      if (typeof payload.error === "string" && payload.error.length > 0) {
        setError(payload.error);
      }
    });
    return () => {
      session.eventBus.unsubscribe(sub);
    };
  }, [session]);

  useEffect(() => {
    if (tab === "global") {
      session.chat.getHistory();
      return;
    }
    const guildId = state.guild.guild?.id;
    if (typeof guildId === "string") {
      session.chat.getHistory(guildId);
    }
  }, [session, tab, state.guild.guild?.id]);

  const messages =
    tab === "global"
      ? session.chat.getGlobalMessages(100)
      : session.chat.getClanMessages(100);

  const send = (): void => {
    if (!input.trim()) {
      return;
    }
    const result =
      tab === "global"
        ? session.chat.sendGlobal(input)
        : session.chat.sendClan(input);
    if (result.success) {
      setInput("");
      setError(null);
      session.chat.clearError();
    } else {
      setError(result.message);
    }
  };

  return (
    <section class="hub-panel" data-testid="chat-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.chat")}</h2>

      <div class="game__actions">
        <button
          type="button"
          class={tab === "global" ? "game__btn game__btn--primary" : "game__btn"}
          data-testid="chat-tab-global"
          onClick={() => {
            setTab("global");
          }}
        >
          Global
        </button>
        <button
          type="button"
          class={tab === "clan" ? "game__btn game__btn--primary" : "game__btn"}
          data-testid="chat-tab-clan"
          onClick={() => {
            setTab("clan");
          }}
        >
          Gilde
        </button>
      </div>

      {error !== null ? (
        <p class="game__meta" role="alert" data-testid="chat-error">
          {error}
        </p>
      ) : null}

      <ul class="hub-list" data-testid="chat-messages">
        {messages.length === 0 ? (
          <li class="game__meta">Keine Nachrichten.</li>
        ) : (
          messages.map((msg) => (
            <li key={msg.id} class="hub-card hub-card--compact">
              <p class="hub-card__title">
                {msg.player}
                {msg.player === state.hero.name ? " (du)" : ""}
              </p>
              <p class="game__meta">{msg.message}</p>
              <p class="game__meta">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))
        )}
      </ul>

      <div class="game__actions">
        <input
          type="text"
          class="game__input"
          data-testid="chat-input"
          placeholder="Nachricht..."
          value={input}
          onInput={(e) => {
            setInput((e.target as HTMLInputElement).value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
        />
        <button
          type="button"
          class="game__btn game__btn--primary"
          data-testid="chat-send"
          onClick={send}
        >
          Senden
        </button>
        <button
          type="button"
          class="game__btn"
          data-testid="chat-clear"
          onClick={() => {
            if (tab === "global") {
              session.chat.clearGlobal();
            } else {
              session.chat.clearClan();
            }
          }}
        >
          Leeren
        </button>
      </div>
    </section>
  );
}
