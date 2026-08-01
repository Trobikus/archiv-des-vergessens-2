type Props = {
  readonly title: string;
  readonly optionsLabel: string;
  readonly logOutLabel: string;
  readonly exitLabel: string;
  readonly resumeLabel: string;
  readonly onOptions: () => void;
  readonly onLogOut: () => void;
  readonly onExit: () => void;
  readonly onResume: () => void;
};

export function PauseMenu({
  title,
  optionsLabel,
  logOutLabel,
  exitLabel,
  resumeLabel,
  onOptions,
  onLogOut,
  onExit,
  onResume,
}: Props) {
  return (
    <div
      class="pause-menu"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="pause-menu"
    >
      <div class="pause-menu__panel">
        <header class="pause-menu__header">
          <h2 class="pause-menu__title">{title}</h2>
        </header>
        <nav class="pause-menu__nav" aria-label={title}>
          <button
            type="button"
            class="pause-menu__btn"
            data-testid="pause-options"
            onClick={onOptions}
          >
            {optionsLabel}
          </button>
          <div class="pause-menu__spacer" aria-hidden="true" />
          <button
            type="button"
            class="pause-menu__btn"
            data-testid="pause-character-select"
            onClick={onLogOut}
          >
            {logOutLabel}
          </button>
          <button
            type="button"
            class="pause-menu__btn"
            data-testid="pause-quit"
            onClick={onExit}
          >
            {exitLabel}
          </button>
          <div class="pause-menu__spacer pause-menu__spacer--large" aria-hidden="true" />
          <button
            type="button"
            class="pause-menu__btn"
            data-testid="pause-resume"
            onClick={onResume}
          >
            {resumeLabel}
          </button>
        </nav>
      </div>
    </div>
  );
}
