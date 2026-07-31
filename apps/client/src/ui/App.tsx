import { bootLabel } from "@adv/content";
import { createLogger } from "@adv/core";

const log = createLogger("client");
log.info("Boot OK");

export function App() {
  return (
    <main class="boot">
      <p class="boot__brand">Archiv des Vergessens</p>
      <p class="boot__status" data-testid="boot-status">
        {bootLabel("de")}
      </p>
    </main>
  );
}
