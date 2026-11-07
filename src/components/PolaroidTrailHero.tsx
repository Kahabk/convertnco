import { MouseEvent, useRef, useState, useEffect, memo, useCallback } from "react";
import "./PolaroidTrailHero.css";

const LOGO_IMAGE = new URL("../../wight_logo.png", import.meta.url).href;

// Local campaign artwork used by the cursor-trail animation.
const SAMPLE_IMAGES = [
  new URL("../../imgeasset/0a18db22a60fd44f0c90518d113f7a87.jpg", import.meta.url).href,
  new URL("../../imgeasset/1f045397a286958c144ae1d2bbb1073c.jpg", import.meta.url).href,
  new URL("../../imgeasset/265fa7c04168cf6638834057ffb0cf10.jpg", import.meta.url).href,
  new URL("../../imgeasset/2b8cce776b5f51248b9e159e2f7d3245.jpg", import.meta.url).href,
  new URL("../../imgeasset/6288858dc3a59eb17103b372b73404c4.jpg", import.meta.url).href,
  new URL("../../imgeasset/7c82250647ff00fd560d7d61edcea378.jpg", import.meta.url).href,
  new URL("../../imgeasset/80d843730c13f82e5417e40a018edf3e.jpg", import.meta.url).href,
  new URL("../../imgeasset/84dff778f24990afe2f73095dcf9574f.jpg", import.meta.url).href,
  new URL("../../imgeasset/8675e9eef372a07acc60c941ac91ae00.jpg", import.meta.url).href,
  new URL("../../imgeasset/93202b237771648e53b6848f5a12b5a4.jpg", import.meta.url).href,
  new URL("../../imgeasset/9fa5909e9e3c57b6127a6fa0bcf042f5.jpg", import.meta.url).href,
  new URL("../../imgeasset/d47032c62e93f8abb0f2ad4f08965fce.jpg", import.meta.url).href,
  new URL("../../imgeasset/fecb7ff6829c90de6d7872ff64acc900.jpg", import.meta.url).href,
  new URL("../../imgeasset/App-Icon.png", import.meta.url).href,
  new URL("../../imgeasset/Notification.png", import.meta.url).href,
  new URL("../../imgeasset/Notification (1).png", import.meta.url).href,
  new URL("../../imgeasset/Notification (3).png", import.meta.url).href,
  new URL("../../imgeasset/White.png", import.meta.url).href,
  new URL("../../imgeasset/White (1).png", import.meta.url).href,
  new URL("../../imgeasset/White (2).png", import.meta.url).href,
];

const STAGE_LABELS = [
  "MEMENTO",
  "SILENT ART",
  "CHROME FLOW",
  "NEO SHADOW",
  "BRUTAL FORM",
  "CINEMATIC",
  "EPHEMERAL",
  "STILL LIFE",
  "AURA FRAME",
  "KINETIC",
  "PRODUCT STUDY",
  "VIOLET FORM",
  "FUTURE OBJECT",
  "APP ICON",
  "NOTIFICATION",
  "NOTIFICATION ALT",
  "NOTIFICATION WIDE",
  "LIGHT NOTICE",
  "LIGHT NOTICE ALT",
  "LIGHT NOTICE WIDE",
];

// ── Image preloader ──────────────────────────────────────────────────
// Decode every trail image into browser memory ONCE at startup so that
// spawning a new card never triggers a network request (no more 304s).
const preloadedImages = new Map<string, HTMLImageElement>();

function preloadAllImages() {
  for (const src of SAMPLE_IMAGES) {
    if (preloadedImages.has(src)) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    preloadedImages.set(src, img);
  }
  // Also preload the logo
  if (!preloadedImages.has(LOGO_IMAGE)) {
    const logo = new Image();
    logo.src = LOGO_IMAGE;
    preloadedImages.set(LOGO_IMAGE, logo);
  }
}

// Kick off preloading immediately at module load (before React mounts)
preloadAllImages();

// ── Types ────────────────────────────────────────────────────────────
interface PolaroidCardData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationStart: number;
  rotationEnd: number;
  imageIndex: number; // Store index instead of URL string to avoid re-creating strings
  label: string;
  dateStr: string;
  zIndex: number;
  createdAt: number;
  opacity: number;
}

const MAX_TRAIL_CARDS = 8; // Reduced from 10 — fewer simultaneous DOM nodes

// ── Memoized card component ─────────────────────────────────────────
// Each card is memoized so React only re-renders the cards whose props
// actually changed, instead of re-rendering all 8 cards every frame.
const TrailCard = memo(function TrailCard({ card }: { card: PolaroidCardData }) {
  const src = SAMPLE_IMAGES[card.imageIndex];
  return (
    <div
      className="trailImageCard"
      style={{
        zIndex: card.zIndex,
        opacity: card.opacity,
        ["--x" as any]: `${card.x}px`,
        ["--y" as any]: `${card.y}px`,
        ["--rot" as any]: `${card.rotation}deg`,
        ["--rot-start" as any]: `${card.rotationStart}deg`,
        ["--rot-end" as any]: `${card.rotationEnd}deg`,
        ["--opacity" as any]: card.opacity,
      }}
    >
      <div className="trailImageMask">
        <img
          src={src}
          alt={card.label}
          className="trailImage"
          decoding="async"
        />
      </div>
    </div>
  );
});

// ── Main component ──────────────────────────────────────────────────
export default function PolaroidTrailHero() {
  const [cards, setCards] = useState<PolaroidCardData[]>([]);
  const cardsRef = useRef<PolaroidCardData[]>([]);
  const zIndexCounterRef = useRef<number>(1);
  const imageIndexCounterRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs for smooth rendering — no state, no re-renders
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lerpedPosRef = useRef({ x: 0, y: 0 });
  const lastSpawnPosRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const idleTimeoutRef = useRef<any>(null);
  const lastRenderRef = useRef(0);

  // Cache the bounding rect instead of calling getBoundingClientRect every mouse move
  const cachedRectRef = useRef<DOMRect | null>(null);
  const rectCacheTimeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const now = Date.now();

    // Refresh the cached rect at most once every 500ms (or on first move)
    if (!cachedRectRef.current || now - rectCacheTimeRef.current > 500) {
      if (!containerRef.current) return;
      cachedRectRef.current = containerRef.current.getBoundingClientRect();
      rectCacheTimeRef.current = now;
    }

    const rect = cachedRectRef.current;
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    isMouseMovingRef.current = true;

    // Clear and reset the idle timer
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      isMouseMovingRef.current = false;
    }, 250);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    // Initialize starting coordinates at the center of the viewport
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      mousePosRef.current = { x: cx, y: cy };
      lerpedPosRef.current = { x: cx, y: cy };
      lastSpawnPosRef.current = { x: cx, y: cy };
    }

    const tick = () => {
      const prevX = lerpedPosRef.current.x;
      const prevY = lerpedPosRef.current.y;

      lerpedPosRef.current.x += (mousePosRef.current.x - lerpedPosRef.current.x) * 0.2;
      lerpedPosRef.current.y += (mousePosRef.current.y - lerpedPosRef.current.y) * 0.2;

      const mvx = lerpedPosRef.current.x - prevX;
      const mvy = lerpedPosRef.current.y - prevY;

      const dx = lerpedPosRef.current.x - lastSpawnPosRef.current.x;
      const dy = lerpedPosRef.current.y - lastSpawnPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Skip React render entirely when idle and no cards visible
      if (!isMouseMovingRef.current && cardsRef.current.length === 0) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      // ── Throttle React renders to ~30fps ──────────────────────────
      // The animation loop runs at 60fps for smooth lerping, but we
      // only push state to React at 30fps. This halves the number of
      // virtual DOM diffs and reconciliations.
      const now = Date.now();
      if (now - lastRenderRef.current < 33) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      lastRenderRef.current = now;

      setCards((prev) => {
        const lifespan = 3500; // Slightly shorter lifespan = fewer concurrent cards

        // Spawn check
        let newCardToAppend: PolaroidCardData | null = null;
        if (isMouseMovingRef.current && distance > 80) { // Increased threshold from 65 → 80 = fewer spawns
          const randomRotation = Math.floor(Math.random() * 24) - 12;
          const randomRotationStart = randomRotation * 1.6;
          const randomRotationEnd = randomRotation * 0.6;

          const themedImageIndex = imageIndexCounterRef.current % SAMPLE_IMAGES.length;
          imageIndexCounterRef.current += 1;

          const randomLabel = STAGE_LABELS[themedImageIndex];

          const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
          const dateStr = `#${String(Math.floor(Math.random() * 900) + 100)} // ${timeStr}`;

          const newZIndex = zIndexCounterRef.current++;

          newCardToAppend = {
            id: `p-${now}-${(Math.random() * 1e6) | 0}`, // Faster ID gen than toString(36)
            x: lerpedPosRef.current.x,
            y: lerpedPosRef.current.y,
            vx: mvx * 0.45,
            vy: mvy * 0.45 - 0.5,
            rotation: randomRotation,
            rotationStart: randomRotationStart,
            rotationEnd: randomRotationEnd,
            imageIndex: themedImageIndex,
            label: randomLabel,
            dateStr,
            zIndex: newZIndex,
            createdAt: now,
            opacity: 1.0,
          };

          lastSpawnPosRef.current = { x: lerpedPosRef.current.x, y: lerpedPosRef.current.y };
        }

        const updated = prev.map((card) => {
          const age = now - card.createdAt;

          const gravity = 0.14;
          const updatedVy = card.vy + gravity;
          const updatedVx = card.vx * 0.96;

          const updatedX = card.x + updatedVx;
          const updatedY = card.y + updatedVy;

          let opacity = 1.0;
          if (age > 1000) {
            opacity = Math.max(0, 1 - (age - 1000) / (lifespan - 1000));
          }

          return {
            ...card,
            x: updatedX,
            y: updatedY,
            vx: updatedVx,
            vy: updatedVy,
            opacity,
          };
        });

        // Filter out dead cards
        const alive = updated
          .filter((card) => (now - card.createdAt < lifespan) && card.opacity > 0.01)
          .slice(-MAX_TRAIL_CARDS);

        if (newCardToAppend) {
          const next = [...alive, newCardToAppend].slice(-MAX_TRAIL_CARDS);
          cardsRef.current = next;
          return next;
        }
        cardsRef.current = alive;
        return alive;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="polaroidHeroContainer"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      id="polaroid-hero-container"
    >
      {/* Film Grain Texture Overlay */}
      <div className="polaroidNoise" />

      {/* 1. Header */}
      <header className="pHeader" id="p-header">
        <div className="pLogo" id="p-logo">
          <img className="pLogoImage" src={LOGO_IMAGE} alt="Creative studio logo" />
        </div>
        <nav className="pNav" id="p-nav">
          <a className="pNavLink" href="#works">Works</a>
          <a className="pNavLink" href="#studio">Studio</a>
          <a className="pNavLink" href="#services">Services</a>
          <a className="pNavLink" href="mailto:hello@example.com">Contact</a>
        </nav>
      </header>

      {/* 2. Editorial hero typography */}
      <div className="newHeroContent">
        <p className="newHeroEyebrow">
          GLOBAL CREATIVE STUDIO · SHOPIFY DESIGN, DEVELOPMENT & CRO
        </p>

        <h1 className="newHeroTitle">
          Shopify stores built<br />
          around your customers.
        </h1>

        <p className="newHeroDescription">
          We learn why they buy, then design your<br />
          store around it.
        </p>

        <div className="newHeroCta">
          <div className="newHeroButtons">
            <a href="#contact" className="newHeroPrimary">
              Get a free store audit <span>↘</span>
            </a>

            <a href="#contact" className="newHeroSecondary">
              Book a 20-min call
            </a>
          </div>

          <p className="newHeroGuarantee">
            Scope delivered, or your money back. <a href="/terms-and-conditions">See terms</a>
          </p>
        </div>
      </div>

      {/* 3. Trail canvas */}
      <div className="trailCanvas" id="trail-canvas">
        {cards.map((card) => (
          <TrailCard key={card.id} card={card} />
        ))}
      </div>

      {/* 4. Footer */}
      <footer className="pFooter" id="p-footer">
        <div className="pFooterLeft" id="p-footer-left">
          <div className="pFooterCol">
            <div className="pFooterColLabel">Social</div>
            <div className="pFooterColLinks">
              <span className="pNavLink">Instagram</span>
              <span className="pNavLink">LinkedIn</span>
            </div>
          </div>
          <div className="pFooterCol">
            <div className="pFooterColLabel">Working</div>
            <div className="pFooterColText">Globally / Remotely</div>
          </div>
        </div>
        <div className="pFooterRight" id="p-footer-right">
          <div className="pScrollLabel">Scroll</div>
          <div className="pScrollIndicator" />
        </div>
      </footer>
    </div>
  );
}
