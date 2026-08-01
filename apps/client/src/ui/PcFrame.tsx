import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

const FRAME_W = 1920;
const FRAME_H = 1080;

type Props = {
  readonly children: ComponentChildren;
};

export function PcFrame({ children }: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = (): void => {
      const next = Math.min(
        window.innerWidth / FRAME_W,
        window.innerHeight / FRAME_H,
      );
      setScale(next > 0 ? next : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div class="pc-stage" data-testid="pc-stage">
      <div
        class="pc-frame"
        data-testid="pc-frame"
        style={{
          width: `${String(FRAME_W)}px`,
          height: `${String(FRAME_H)}px`,
          transform: `translate(-50%, -50%) scale(${String(scale)})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
