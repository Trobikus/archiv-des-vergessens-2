import type { ComponentChildren } from "preact";

type TipBubbleProps = {
  readonly title?: string;
  readonly children: ComponentChildren;
};

/** Hover bubble used with a parent that has class `tip` / `tip--below`. */
export function TipBubble({ title, children }: TipBubbleProps) {
  return (
    <span class="tip__bubble" role="tooltip">
      {title !== undefined && title.length > 0 ? (
        <strong class="tip__title">{title}</strong>
      ) : null}
      <span>{children}</span>
    </span>
  );
}

type TipProps = {
  readonly title?: string;
  readonly text: string;
  readonly below?: boolean;
  readonly className?: string;
  readonly children: ComponentChildren;
};

/** Wraps content and shows an explanatory tooltip on hover/focus. */
export function Tip({
  title,
  text,
  below = true,
  className,
  children,
}: TipProps) {
  const classes = ["tip", below ? "tip--below" : null, className]
    .filter((value): value is string => value !== null && value !== undefined)
    .join(" ");
  return (
    <span class={classes}>
      {children}
      {title !== undefined ? (
        <TipBubble title={title}>{text}</TipBubble>
      ) : (
        <TipBubble>{text}</TipBubble>
      )}
    </span>
  );
}
