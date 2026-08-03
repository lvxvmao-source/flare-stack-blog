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

function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  opacity: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0.15, opacity);

  const s = size;
  // 5-petal sakura shape using bezier curves
  ctx.beginPath();
  ctx.fillStyle = `oklch(0.78 0.12 350 / ${opacity})`;

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const cx = Math.cos(angle) * s * 0.35;
    const cy = Math.sin(angle) * s * 0.35;
    const tipX = Math.cos(angle) * s * 0.7;
    const tipY = Math.sin(angle) * s * 0.7;

    if (i === 0) {
      ctx.moveTo(
        Math.cos(angle - 0.35) * s * 0.25,
        Math.sin(angle - 0.35) * s * 0.25,
      );
    }

    ctx.quadraticCurveTo(cx, cy, tipX, tipY);
    ctx.quadraticCurveTo(
      Math.cos(angle + 0.35) * s * 0.25,
      Math.sin(angle + 0.35) * s * 0.25,
      0,
      0,
    );
  }

  ctx.fill();
  ctx.restore();
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

        drawPetal(ctx, petal.x, petal.y, petal.size, petal.rotation, petal.opacity);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
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
