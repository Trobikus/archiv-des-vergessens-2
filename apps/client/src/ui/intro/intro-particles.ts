type ParticleType = "ember" | "dust" | "rune" | "spark" | "orb";

type Particle = {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  wobble: number;
  wobbleSpeed: number;
  colorType: "gold" | "purple" | "bright";
  rune: string;
  prevX: number;
  prevY: number;
};

const RUNE_GLYPHS = [
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᛁ",
  "ᛃ",
  "ᛇ",
  "ᛈ",
  "ᛉ",
  "ᛊ",
  "ᛏ",
] as const;

const MAX_PARTICLES = 90;

function createParticle(
  canvas: HTMLCanvasElement,
  type: ParticleType,
  isInit = false,
): Particle {
  const W = canvas.width;
  const H = canvas.height;
  const cx = W * 0.5;
  const cy = H * 0.5;

  const p: Particle = {
    type,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    scale: 1,
    alpha: 0,
    maxAlpha: 0.5,
    life: 0,
    maxLife: 100,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.01,
    colorType: Math.random() > 0.5 ? "gold" : "purple",
    rune: RUNE_GLYPHS[Math.floor(Math.random() * RUNE_GLYPHS.length)] ?? "ᚠ",
    prevX: 0,
    prevY: 0,
  };

  if (type === "ember") {
    const a = Math.random() * Math.PI * 2;
    const d = 50 + Math.random() * 110;
    p.x = cx + Math.cos(a) * d;
    p.y = isInit ? cy + Math.random() * H * 0.5 : cy + 20 + Math.random() * 70;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = -(0.35 + Math.random() * 0.7);
    p.scale = 0.5 + Math.random() * 0.9;
    p.maxAlpha = 0.4 + Math.random() * 0.5;
    p.maxLife = 110 + Math.random() * 160;
    p.wobbleSpeed = 0.022 + Math.random() * 0.025;
    p.colorType = Math.random() > 0.4 ? "gold" : "bright";
  } else if (type === "dust") {
    p.x = Math.random() * W;
    p.y = isInit ? Math.random() * H : H + 5;
    p.vx = (Math.random() - 0.5) * 0.2;
    p.vy = -(0.07 + Math.random() * 0.17);
    p.scale = 0.4 + Math.random() * 0.75;
    p.maxAlpha = 0.08 + Math.random() * 0.18;
    p.maxLife = 280 + Math.random() * 320;
    p.wobbleSpeed = 0.007 + Math.random() * 0.012;
    p.colorType = Math.random() > 0.55 ? "purple" : "gold";
  } else if (type === "rune") {
    const a = Math.random() * Math.PI * 2;
    const d = 75 + Math.random() * (Math.min(W, H) * 0.28);
    p.x = cx + Math.cos(a) * d;
    p.y = cy + Math.sin(a) * d;
    p.vx = Math.cos(a) * 0.1;
    p.vy = Math.sin(a) * 0.1;
    p.scale = Math.random() > 0.5 ? 1 : 0.7;
    p.maxAlpha = 0.12 + Math.random() * 0.22;
    p.maxLife = 170 + Math.random() * 200;
    p.wobbleSpeed = 0.012;
  } else if (type === "spark") {
    const a = Math.random() * Math.PI * 2;
    p.x = cx + (Math.random() - 0.5) * 55;
    p.y = cy + (Math.random() - 0.5) * 55;
    p.prevX = p.x;
    p.prevY = p.y;
    p.vx = Math.cos(a) * (1.4 + Math.random() * 1.9);
    p.vy = Math.sin(a) * (1.4 + Math.random() * 1.9);
    p.scale = 0.7 + Math.random() * 0.7;
    p.maxAlpha = 0.7 + Math.random() * 0.3;
    p.maxLife = 22 + Math.random() * 38;
    p.wobbleSpeed = 0;
  } else {
    p.x = cx + (Math.random() - 0.5) * W * 0.5;
    p.y = cy + (Math.random() - 0.5) * H * 0.5;
    p.vx = (Math.random() - 0.5) * 0.15;
    p.vy = (Math.random() - 0.5) * 0.15;
    p.scale = 0.6 + Math.random() * 0.9;
    p.maxAlpha = 0.12 + Math.random() * 0.18;
    p.maxLife = 340 + Math.random() * 400;
    p.wobbleSpeed = 0.004 + Math.random() * 0.005;
    p.colorType = Math.random() > 0.5 ? "gold" : "purple";
  }

  if (isInit) {
    p.life = Math.random() * p.maxLife;
  }

  return p;
}

export function startIntroParticles(
  canvas: HTMLCanvasElement,
  container: HTMLElement | null,
): () => void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return () => undefined;
  }

  let stopped = false;
  let animFrameId = 0;
  let lastTS = -1;
  let sparkCooldown = 65;

  const resize = (): void => {
    const targetW = container?.clientWidth ?? window.innerWidth;
    const targetH = container?.clientHeight ?? window.innerHeight;
    canvas.width = targetW;
    canvas.height = targetH;
    ctx.globalCompositeOperation = "screen";
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const particles: Particle[] = [];
  const initTypes: ParticleType[] = [
    ...Array<ParticleType>(5).fill("orb"),
    ...Array<ParticleType>(22).fill("dust"),
    ...Array<ParticleType>(32).fill("ember"),
    ...Array<ParticleType>(8).fill("rune"),
  ];
  for (const type of initTypes) {
    particles.push(createParticle(canvas, type, true));
  }

  ctx.globalCompositeOperation = "screen";

  const tick = (now: number): void => {
    if (stopped) {
      return;
    }
    animFrameId = requestAnimationFrame(tick);
    if (lastTS < 0) {
      lastTS = now;
      return;
    }
    const dt = Math.min((now - lastTS) / 16.667, 2.5);
    lastTS = now;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    sparkCooldown -= dt;
    if (sparkCooldown <= 0 && particles.length < MAX_PARTICLES - 6) {
      const count = 2 + Math.floor(Math.random() * 4);
      for (let b = 0; b < count && particles.length < MAX_PARTICLES; b += 1) {
        particles.push(createParticle(canvas, "spark", false));
      }
      sparkCooldown = 65 + Math.random() * 75;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      if (p === undefined) {
        continue;
      }
      p.life += dt;
      p.wobble += p.wobbleSpeed * dt;

      const lt = p.life / p.maxLife;
      p.alpha =
        lt < 0.2
          ? (lt / 0.2) * p.maxAlpha
          : lt > 0.7
            ? ((1 - lt) / 0.3) * p.maxAlpha
            : p.maxAlpha;

      if (p.type === "orb") {
        p.x += (p.vx + Math.cos(p.wobble) * 0.28) * dt;
        p.y += (p.vy + Math.sin(p.wobble * 0.7) * 0.22) * dt;
        if (p.alpha > 0.004) {
          const radius = 25 * p.scale;
          const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, radius);
          const color = p.colorType === "purple" ? "130,80,200" : "197,160,89";
          grad.addColorStop(0, `rgba(${color}, ${String(p.alpha * 0.6)})`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === "dust") {
        p.x += (p.vx + Math.sin(p.wobble) * 0.22) * dt;
        p.y += p.vy * dt;
        if (p.alpha > 0.004) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle =
            p.colorType === "purple"
              ? "rgba(130,80,200,0.9)"
              : "rgba(197,160,89,0.9)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === "ember") {
        p.x += (p.vx + Math.sin(p.wobble) * 0.28) * dt;
        p.y += p.vy * dt;
        if (p.alpha > 0.004) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.colorType === "bright" ? "#fff8c0" : "#ebd576";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === "rune") {
        p.x += p.vx * dt;
        p.y += (p.vy + Math.sin(p.wobble) * 0.18) * dt;
        if (p.alpha > 0.004) {
          ctx.globalAlpha = p.alpha;
          ctx.font = `${String(p.scale > 0.8 ? 14 : 9)}px serif`;
          ctx.fillStyle = "#c5a059";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.rune, p.x, p.y);
        }
      } else {
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.alpha > 0.02) {
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = "#ebd576";
          ctx.lineWidth = p.scale;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      if (p.life >= p.maxLife) {
        if (p.type === "spark") {
          particles.splice(i, 1);
        } else {
          particles[i] = createParticle(canvas, p.type, false);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  requestAnimationFrame(() => {
    lastTS = performance.now();
    requestAnimationFrame(tick);
  });

  return () => {
    stopped = true;
    if (animFrameId !== 0) {
      cancelAnimationFrame(animFrameId);
    }
    window.removeEventListener("resize", resize);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
