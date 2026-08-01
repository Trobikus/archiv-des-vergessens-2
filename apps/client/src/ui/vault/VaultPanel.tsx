import { formatAmount } from "@adv/core";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function VaultPanel({ session }: Props) {
  const state = useStore(session.store);
  const authState = useStore(session.auth.store);
  const vault = session.accountVault.getVaultResources();
  const items = session.accountVault.getSharedVaultItems();
  const guestBlocked = authState.user?.isGuest === true;

  return (
    <section class="phase6-panel" data-testid="vault-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.vault")}</h2>
      <p class="game__meta">{session.i18n.translate("hub.vaultDesc")}</p>
      {guestBlocked ? (
        <p class="phase6-panel__message" data-testid="vault-guest-block">
          Gastkonten können das Account-Lager nicht nutzen.
        </p>
      ) : null}

      <div class="phase6-vault-grid">
        {(
          [
            ["particles", "Partikel"],
            ["relics", "Relikte"],
            ["artifacts", "Artefakte"],
            ["memoryDust", "Gedächtnisstaub"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} class="phase6-vault-row">
            <span>{label}</span>
            <span data-testid={`vault-${key}`}>
              {formatAmount(vault[key])}
            </span>
            <button
              type="button"
              class="game__btn"
              data-testid={`vault-deposit-${key}`}
              disabled={guestBlocked || state.resources[key] <= 0n}
              onClick={() => {
                session.accountVault.depositResource(key, 1);
              }}
            >
              Einlagern
            </button>
            <button
              type="button"
              class="game__btn"
              data-testid={`vault-withdraw-${key}`}
              disabled={guestBlocked || vault[key] <= 0n}
              onClick={() => {
                session.accountVault.withdrawResource(key, 1);
              }}
            >
              Entnehmen
            </button>
          </div>
        ))}
      </div>

      <h3 class="panel__sub">Gegenstände</h3>
      <ul class="panel__list">
        {items.map((item, index) => (
          <li key={item.id} class="hero__item">
            <span>{item.name}</span>
            <button
              type="button"
              class="game__btn"
              data-testid={`vault-withdraw-item-${String(index)}`}
              disabled={guestBlocked}
              onClick={() => {
                session.accountVault.withdrawItem(index);
              }}
            >
              Entnehmen
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li class="game__meta">Keine eingelagerten Gegenstände.</li>
        ) : null}
      </ul>

      {state.hero.inventory.equipment.length > 0 ? (
        <>
          <h3 class="panel__sub">Aus Inventar einlagern</h3>
          <ul class="panel__list">
            {state.hero.inventory.equipment.map((item) => (
              <li key={item.id} class="hero__item">
                <span>{item.name}</span>
                <button
                  type="button"
                  class="game__btn"
                  data-testid={`vault-deposit-item-${item.id}`}
                  disabled={guestBlocked}
                  onClick={() => {
                    session.accountVault.depositItem(item.id);
                  }}
                >
                  Einlagern
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
