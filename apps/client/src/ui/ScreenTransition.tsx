export type TransitionPhase = "idle" | "cover" | "reveal";

type Props = {
  readonly phase: TransitionPhase;
  readonly label: string;
};

export type TransitionLabelKey =
  | "transition.enteringArchive"
  | "transition.returning"
  | "transition.openingGates";

/** Full-bleed cinematic wipe between major game screens. */
export function ScreenTransition({ phase, label }: Props) {
  if (phase === "idle") {
    return null;
  }

  return (
    <div
      class={`screen-transition screen-transition--${phase}`}
      aria-hidden="true"
      data-testid="screen-transition"
    >
      <div class="screen-transition__veil" />
      <div class="screen-transition__burst" />
      <div class="screen-transition__rings" />
      <div class="screen-transition__scan" />
      <p class="screen-transition__label cinzel text-gold">{label}</p>
    </div>
  );
}

export function transitionLabelFor(
  from: string,
  to: string,
): TransitionLabelKey {
  if (to === "characterSelect" || to === "game") {
    return "transition.enteringArchive";
  }
  if (from === "characterSelect" || from === "game") {
    return "transition.returning";
  }
  return "transition.openingGates";
}
