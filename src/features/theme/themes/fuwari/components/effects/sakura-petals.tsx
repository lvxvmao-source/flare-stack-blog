import { useEffect, useRef } from "react";

interface SakuraPetal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
}

interface SakuraPetalsProps {
  enabled?: boolean;
  density?: number; // 1-10
  speed?: number;   // 1-5
}

const DENSITY_MAP: Record<number, number> = {
  1: 8, 2: 14, 3: 20, 4: 28, 5: 36,
  6: 44, 7: 52, 8: 62, 9: 72, 10: 84,
};

/**
 * Offscreen sprite size for the pre-rendered petal.
 *
 * Perf note: the previous implementation rebuilt the whole 5-petal bezier path
 * AND re-parsed an `oklch(...)` colour string for every petal on every frame
 * (up to 84 petals × 60fps). That is pure main-thread work and is the main
 * cause of scroll jank on lower-end devices.
 *
 * We instead draw the petal shape exactly once into an offscreen canvas, then
 * blit it with `drawImage` each frame — same visuals, a fraction of the cost.
 */
const SPRITE_SIZE = 64;
/** Petal radius inside the sprite: max extent is `s * 0.7`, so keep it inside bounds. */
const SPRITE_RADIUS = 40;

/**
 * Draw a single sakura petal into an offscreen canvas (shape + colour only —
 * opacity/rotation/scale are applied per-frame at blit time).
 */
function createPetalSprite(): HTMLCanvasElement | null {
  const off = document.createElement("canvas");
  off.width = SPRITE_SIZE;
  off.height = SPRITE_SIZE;
  const octx = off.getContext("2d");
  if (!octx) return null;

  const s = SPRITE_RADIUS;
  octx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  octx.beginPath();
  octx.fillStyle = "oklch(0.78 0.12 350)";

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const cx = Math.cos(angle) * s * 0.35;
    const cy = Math.sin(angle) * s * 0.35;
    const tipX = Math.cos(angle) * s * 0.7;
    const tipY = Math.sin(angle) * s * 0.7;

    if (i === 0) {
      octx.moveTo(
        Math.cos(angle - 0.35) * s * 0.25,
        Math.sin(angle - 0.35) * s * 0.25,
      );
    }

    octx.quadraticCurveTo(cx, cy, tipX, tipY);
    octx.quadraticCurveTo(
      Math.cos(angle + 0.35) * s * 0.25,
      Math.sin(angle + 0.35) * s * 0.25,
      0,
      0,
    );
  }

  octx.fill();
  return off;
}

export function SakuraPetals({
  enabled = true,
  density = 5,
  speed = 3,
}: SakuraPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<SakuraPetal[]>([]);
  const animFrameRef = useRef<number>(0);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced.current) return;

    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprite = createPetalSprite();
    if (!sprite) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = DENSITY_MAP[density] ?? 28;
    const baseSpeed = 0.4 + speed * 0.25;

    // Init petals
    petalsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 8 + Math.random() * 14,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: baseSpeed * (0.5 + Math.random() * 0.7),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.4 + Math.random() * 0.5,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.015,
    }));

    const animate = () => {
      // Pause the loop entirely while the tab is hidden: rAF is throttled by the
      // browser anyway, but stopping it releases the main thread and battery.
      if (document.hidden) {
        animFrameRef.current = 0;
        return;
      }

      ctx.clearRect(0, 0, w, h);

      for (const petal of petalsRef.current) {
        petal.swayOffset += petal.swaySpeed;
        petal.x += petal.speedX + Math.sin(petal.swayOffset) * 0.5;
        petal.y += petal.speedY;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > h + 30) {
          petal.y = -30;
          petal.x = Math.random() * w;
        }
        if (petal.x > w + 30) petal.x = -30;
        if (petal.x < -30) petal.x = w + 30;

        // Same visual result as before: the original code multiplied the petal's
        // colour alpha (oklch `/<opacity>`) by `globalAlpha = max(0.15, opacity)`,
        // i.e. an effective alpha of roughly opacity². We reproduce that here.
        const alpha = Math.max(0.15, petal.opacity) * petal.opacity;
        const k = petal.size / SPRITE_RADIUS;
        const dw = SPRITE_SIZE * k;

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, -dw / 2, -dw / 2, dw, dw);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = 0;
      } else if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, density, speed]);

  if (!enabled || prefersReduced.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
