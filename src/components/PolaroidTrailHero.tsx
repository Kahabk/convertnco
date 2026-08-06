import { MouseEvent, TouchEvent, useRef, useState, useEffect } from "react";
import "./PolaroidTrailHero.css";

const BASE_URL = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env.BASE_URL;
const assetUrl = (path: string) => `${BASE_URL}${path}`;

const LOGO_IMAGE = assetUrl("wight_logo.png");
const MAX_TRAIL_CARDS = 16;
const MAX_TRAIL_CARDS_MOBILE = 8;

/* =========================================================================
   POLAROID TRAIL CONFIGURATION & IMAGE SOURCES
   ========================================================================= */

// Local campaign artwork used by the cursor-trail animation.
const SAMPLE_IMAGES = [
  "imgeasset/0a18db22a60fd44f0c90518d113f7a87.jpg",
  "imgeasset/1f045397a286958c144ae1d2bbb1073c.jpg",
  "imgeasset/265fa7c04168cf6638834057ffb0cf10.jpg",
  "imgeasset/2b8cce776b5f51248b9e159e2f7d3245.jpg",
  "imgeasset/6288858dc3a59eb17103b372b73404c4.jpg",
  "imgeasset/7c82250647ff00fd560d7d61edcea378.jpg",
  "imgeasset/80d843730c13f82e5417e40a018edf3e.jpg",
  "imgeasset/84dff778f24990afe2f73095dcf9574f.jpg",
  "imgeasset/8675e9eef372a07acc60c941ac91ae00.jpg",
  "imgeasset/93202b237771648e53b6848f5a12b5a4.jpg",
  "imgeasset/9fa5909e9e3c57b6127a6fa0bcf042f5.jpg",
  "imgeasset/d47032c62e93f8abb0f2ad4f08965fce.jpg",
  "imgeasset/fecb7ff6829c90de6d7872ff64acc900.jpg",
  "imgeasset/App-Icon.png",
  "imgeasset/Notification.png",
  "imgeasset/Notification (1).png",
  "imgeasset/Notification (3).png",
  "imgeasset/White.png",
  "imgeasset/White (1).png",
  "imgeasset/White (2).png",
].map(assetUrl);

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

interface PolaroidCardData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationStart: number;
  rotationEnd: number;
  imageUrl: string;
  label: string;
  dateStr: string;
  zIndex: number;
  createdAt: number;
  opacity: number;
}

// Detect mobile once at module load — avoids hydration mismatch
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;

export default function PolaroidTrailHero() {
  const [cards, setCards] = useState<PolaroidCardData[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const cardsRef = useRef<PolaroidCardData[]>([]);
  const zIndexCounterRef = useRef<number>(1);
  const imageIndexCounterRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobileRef = useRef(IS_MOBILE);

  // References for ultra-smooth rendering calculations
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lerpedPosRef = useRef({ x: 0, y: 0 });
  const lastSpawnPosRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const idleTimeoutRef = useRef<any>(null);

  // Track mobile viewport
  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Shared coordinate processor for mouse & touch
  const processPointerMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    mousePosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    isMouseMovingRef.current = true;

    // Clear and reset the idle timer
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      isMouseMovingRef.current = false;
    }, 250);
  };

  // Smooth mouse move handler - captures raw mouse coordinates
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    processPointerMove(e.clientX, e.clientY);
  };

  // Touch move handler for mobile trail interaction
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      processPointerMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      processPointerMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    // Allow remaining cards to fade naturally
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      isMouseMovingRef.current = false;
    }, 100);
  };

  useEffect(() => {
    // ── MOBILE GUARD: skip entire animation on phones ──
    if (IS_MOBILE) return;

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
      const mobile = isMobileRef.current;
      const maxCards = mobile ? MAX_TRAIL_CARDS_MOBILE : MAX_TRAIL_CARDS;
      const spawnDistance = mobile ? 50 : 65;
      const lerpSpeed = mobile ? 0.2 : 0.15;

      // 1. Calculate lerped cursor coordinates
      const prevX = lerpedPosRef.current.x;
      const prevY = lerpedPosRef.current.y;

      lerpedPosRef.current.x += (mousePosRef.current.x - lerpedPosRef.current.x) * lerpSpeed;
      lerpedPosRef.current.y += (mousePosRef.current.y - lerpedPosRef.current.y) * lerpSpeed;

      const mvx = lerpedPosRef.current.x - prevX;
      const mvy = lerpedPosRef.current.y - prevY;

      // 2. Spawning calculation: compute distance traveled by the smooth lerped coordinate
      const dx = lerpedPosRef.current.x - lastSpawnPosRef.current.x;
      const dy = lerpedPosRef.current.y - lastSpawnPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!isMouseMovingRef.current && cardsRef.current.length === 0) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      // Update positions, velocity, gravity, and opacity of all cards in state inside tick()
      setCards((prev) => {
        const now = Date.now();
        const lifespan = mobile ? 3000 : 4000;

        // Spawn check might append a card
        let newCardToAppend: PolaroidCardData | null = null;
        if (isMouseMovingRef.current && distance > spawnDistance) {
          const randomRotation = Math.floor(Math.random() * 24) - 12;
          const randomRotationStart = randomRotation * 1.6;
          const randomRotationEnd = randomRotation * 0.6;

          // Cycle through the complete asset collection so every image is shown.
          const themedImageIndex = imageIndexCounterRef.current % SAMPLE_IMAGES.length;
          imageIndexCounterRef.current += 1;

          const selectedImage = SAMPLE_IMAGES[themedImageIndex];
          const randomLabel = STAGE_LABELS[themedImageIndex];

          const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
          const dateStr = `#${String(Math.floor(Math.random() * 900) + 100)} // ${timeStr}`;

          const newZIndex = zIndexCounterRef.current++;
          const cardId = `p-card-${now}-${Math.random().toString(36).substr(2, 9)}`;

          newCardToAppend = {
            id: cardId,
            x: lerpedPosRef.current.x,
            y: lerpedPosRef.current.y,
            vx: mvx * 0.45,
            vy: mvy * 0.45 - 0.5, // subtle initial loft
            rotation: randomRotation,
            rotationStart: randomRotationStart,
            rotationEnd: randomRotationEnd,
            imageUrl: selectedImage,
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

          // Downward gravity acceleration - pulls cards down smoothly when they slow/stop
          const gravity = 0.14;
          const updatedVy = card.vy + gravity;
          const updatedVx = card.vx * 0.96; // Air resistance friction
          
          const updatedX = card.x + updatedVx;
          const updatedY = card.y + updatedVy;

          // Extremely smooth long fading: full opacity initially, then gently fades out
          let opacity = 1.0;
          const fadeStart = mobile ? 800 : 1200;
          if (age > fadeStart) {
            opacity = Math.max(0, 1 - (age - fadeStart) / (lifespan - fadeStart));
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

        // Filter out dead cards dynamically (no timeout leaks)
        const alive = updated
          .filter((card) => (now - card.createdAt < lifespan) && card.opacity > 0.01)
          .slice(-maxCards);

        if (newCardToAppend) {
          const next = [...alive, newCardToAppend].slice(-maxCards);
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
      onMouseMove={IS_MOBILE ? undefined : handleMouseMove}
      onTouchStart={IS_MOBILE ? undefined : handleTouchStart}
      onTouchMove={IS_MOBILE ? undefined : handleTouchMove}
      onTouchEnd={IS_MOBILE ? undefined : handleTouchEnd}
      id="polaroid-hero-container"
    >
      {/* Film Grain Texture Overlay */}
      <div className="polaroidNoise" />

      {/* 1. Header (Consistent with Immersive UI guidelines) */}
      <header className="pHeader" id="p-header">
        <div className="pLogo" id="p-logo">
          <img className="pLogoImage" src={LOGO_IMAGE} alt="Creative studio logo" />
        </div>
        <nav className={`pNav ${menuOpen ? "pNavOpen" : ""}`} id="p-nav">
          <a className="pNavLink" href="#works" onClick={() => setMenuOpen(false)}>Works</a>
          <a className="pNavLink" href="#studio" onClick={() => setMenuOpen(false)}>Studio</a>
          <a className="pNavLink" href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a className="pNavLink" href="mailto:hello.creativestudio@gmail.com" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <button
          className="pMenuToggle"
          id="p-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={`pMenuBar ${menuOpen ? "pMenuBarOpen" : ""}`} />
          <span className={`pMenuBar ${menuOpen ? "pMenuBarOpen" : ""}`} />
        </button>
      </header>

      {/* 2. Editorial hero typography (stays underneath the image trail) */}
      <div className="staticHeroCenter" id="static-hero-center">
        <h1 className="editorialTitle" id="static-title" aria-label="Global creative studio">
          <span className="editorialWord editorialGlobal">global</span>
          <span className="editorialWord editorialCreative">creative</span>
          <span className="editorialWord editorialStudio">studio.</span>
        </h1>
        <p className="editorialNote editorialNoteTop">Shopify, AI &amp; digital growth</p>
        <p className="editorialNote editorialNoteBottom">websites that work harder</p>
      </div>

      {/* Mobile CTA hint */}
      <div className="mobileTrailHint" id="mobile-trail-hint">
        <span>Swipe to create</span>
      </div>

      {/* 3. Trail canvas — desktop only, skipped entirely on mobile */}
      {!IS_MOBILE && (
        <div className="trailCanvas" id="trail-canvas">
          {cards.map((card) => (
            <div
              key={card.id}
              id={card.id}
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
              <div className="trailImageMask" id={`mask-${card.id}`}>
                <img 
                  src={card.imageUrl} 
                  alt={card.label} 
                  className="trailImage"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
          <div className="pScrollLabel">Cursor Trail</div>
          <div className="pScrollIndicator" />
        </div>
      </footer>
    </div>
  );
}
