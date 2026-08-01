import type { FloatingText } from "../../state/game-state";

type Props = {
  readonly texts: readonly FloatingText[];
};

export function FloatingDamageOverlay({ texts }: Props) {
  if (texts.length === 0) {
    return null;
  }
  return (
    <div class="floaters" data-testid="floating-damage" aria-hidden="true">
      {texts.map((entry) => (
        <span
          key={entry.id}
          class={`floater floater--${entry.kind}`}
        >
          {entry.text}
        </span>
      ))}
    </div>
  );
}
