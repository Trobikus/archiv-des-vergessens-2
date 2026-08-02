import type { ComponentChildren, VNode } from "preact";
import {
  cloneElement,
  isValidElement,
  toChildArray,
} from "preact";
import { useId } from "preact/hooks";

type TipBubbleProps = {
  readonly id?: string;
  readonly title?: string;
  readonly children: ComponentChildren;
};

/** Hover bubble used with a parent that has class `tip` / `tip--below`. */
export function TipBubble({ id, title, children }: TipBubbleProps) {
  return (
    <span class="tip__bubble" id={id} role="tooltip">
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
  readonly ariaLabel?: string;
  readonly children: ComponentChildren;
};

function isFocusableHost(child: VNode): boolean {
  if (child.type === "button" || child.type === "a") {
    return true;
  }
  const props = child.props as Record<string, unknown> | null;
  if (props === null || typeof props !== "object") {
    return false;
  }
  const tabIndex = props["tabIndex"];
  return typeof tabIndex === "number" || tabIndex === "0";
}

/** Wraps content and shows an explanatory tooltip on hover/focus. */
export function Tip({
  title,
  text,
  below = true,
  className,
  ariaLabel,
  children,
}: TipProps) {
  const tipId = useId();
  const classes = ["tip", below ? "tip--below" : null, className]
    .filter((value): value is string => value !== null && value !== undefined)
    .join(" ");

  const childArray = toChildArray(children);
  const onlyChild = childArray.length === 1 ? childArray[0] : null;
  const focusableChild =
    isValidElement(onlyChild) && isFocusableHost(onlyChild) ? onlyChild : null;

  const content =
    focusableChild !== null
      ? cloneElement(focusableChild, {
          "aria-describedby": tipId,
        })
      : children;

  return (
    <span
      class={classes}
      tabIndex={focusableChild === null ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={focusableChild === null ? tipId : undefined}
    >
      {content}
      {title !== undefined ? (
        <TipBubble id={tipId} title={title}>
          {text}
        </TipBubble>
      ) : (
        <TipBubble id={tipId}>{text}</TipBubble>
      )}
    </span>
  );
}
