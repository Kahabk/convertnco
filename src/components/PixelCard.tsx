'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';
import './PixelCard.css';

type PixelCardProps = {
  colors?: string[];
  glowColor?: string;
  shape?: 'square' | 'circle' | 'diamond';
  origin?: 'center' | 'pointer';
  gap?: number;
  pixelSize?: number;
  speed?: number;
  revealDuration?: number;
  spotlight?: number;
  glow?: number;
  opacity?: number;
  fade?: number;
  trigger?: 'hover' | 'click' | 'always';
  radius?: number;
  clickPulse?: boolean;
  intro?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** A lightweight canvas pixel-glow card, compatible with the React Bits API. */
export default function PixelCard({
  colors = ['#e0f2fe', '#7dd3fc', '#0ea5e9'], glowColor = '#0ea5e9', shape = 'square',
  origin = 'pointer', gap = 10, pixelSize = 3, speed = 25, revealDuration = 600,
  spotlight = 0.7, glow = 0.5, opacity = 0.35, fade = 0.7, trigger = 'hover', radius = 24,
  clickPulse = true, intro = false, theme = 'dark', className = '', style, children,
}: PixelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!card || !canvas || !context) return;

    let frame = 0;
    let active = trigger === 'always';
    let startedAt = intro ? performance.now() : 0;
    let pointer = { x: card.clientWidth / 2, y: card.clientHeight / 2 };
    let pulse = 0;
    let pixels: { x: number; y: number; size: number; color: string; offset: number }[] = [];

    const build = () => {
      const rect = card.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      pixels = [];
      for (let x = gap / 2; x < rect.width; x += gap) {
        for (let y = gap / 2; y < rect.height; y += gap) {
          pixels.push({ x, y, size: pixelSize * (0.45 + Math.random() * 0.8), color: colors[Math.floor(Math.random() * colors.length)], offset: Math.random() });
        }
      }
    };

    const drawPixel = (x: number, y: number, size: number) => {
      if (shape === 'circle') {
        context.beginPath(); context.arc(x, y, size / 2, 0, Math.PI * 2); context.fill();
      } else if (shape === 'diamond') {
        context.beginPath(); context.moveTo(x, y - size / 2); context.lineTo(x + size / 2, y); context.lineTo(x, y + size / 2); context.lineTo(x - size / 2, y); context.closePath(); context.fill();
      } else context.fillRect(x - size / 2, y - size / 2, size, size);
    };

    const render = (now: number) => {
      const rect = card.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      const elapsed = startedAt ? Math.min(1, (now - startedAt) / revealDuration) : active ? 1 : 0;
      const visibility = active ? elapsed : Math.max(0, 1 - (now - startedAt) / (revealDuration * 0.55));
      const radiusPx = Math.max(rect.width, rect.height) * 0.65;
      if (visibility > 0 && glow > 0) {
        const gradient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radiusPx);
        gradient.addColorStop(0, `${glowColor}${Math.round(glow * opacity * visibility * 120).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent'); context.fillStyle = gradient; context.fillRect(0, 0, rect.width, rect.height);
      }
      for (const dot of pixels) {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);
        const local = origin === 'pointer' ? Math.max(0, 1 - distance / radiusPx) : 1;
        const twinkle = 0.75 + Math.sin(now / (1000 / Math.max(speed, 1)) + dot.offset * 10) * 0.25;
        const alpha = (0.35 + local * spotlight * 0.65) * visibility * opacity * (1 - fade * Math.min(1, distance / radiusPx));
        if (alpha < 0.01) continue;
        context.globalAlpha = alpha; context.fillStyle = dot.color;
        drawPixel(dot.x, dot.y, dot.size * twinkle * (1 + pulse * local));
      }
      context.globalAlpha = 1;
      pulse *= 0.92;
      frame = requestAnimationFrame(render);
    };

    const activate = (event?: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      if (event) pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      active = true; startedAt = performance.now();
    };
    const deactivate = () => { if (trigger === 'hover') { active = false; startedAt = performance.now(); } };
    const move = (event: PointerEvent) => { const bounds = card.getBoundingClientRect(); pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; };
    const down = (event: PointerEvent) => { if (trigger === 'click') active = !active; activate(event); if (clickPulse) pulse = 1; };
    const observer = new ResizeObserver(build);
    build(); observer.observe(card);
    card.addEventListener('pointerenter', activate); card.addEventListener('pointerleave', deactivate); card.addEventListener('pointermove', move); card.addEventListener('pointerdown', down);
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); card.removeEventListener('pointerenter', activate); card.removeEventListener('pointerleave', deactivate); card.removeEventListener('pointermove', move); card.removeEventListener('pointerdown', down); };
  }, [clickPulse, colors, fade, gap, glow, glowColor, intro, opacity, origin, pixelSize, radius, revealDuration, shape, speed, spotlight, trigger]);

  return <div ref={cardRef} className={`pixel-card ${className}`.trim()} data-theme={theme} style={{ '--pixel-card-radius': `${radius}px`, ...style } as CSSProperties}><canvas ref={canvasRef} className="pixel-card-canvas" aria-hidden="true" />{children}</div>;
}
