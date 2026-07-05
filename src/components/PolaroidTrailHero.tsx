import { MouseEvent, useRef, useState, useEffect } from "react";
import "./PolaroidTrailHero.css";

const LOGO_IMAGE = new URL("../../wight_logo.png", import.meta.url).href;

/* =========================================================================
   POLAROID TRAIL CONFIGURATION & IMAGE SOURCES
   ========================================================================= */

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

export default function PolaroidTrailHero() {
  const [cards, setCards] = useState<PolaroidCardData[]>([]);
  const zIndexCounterRef = useRef<number>(1);
  const imageIndexCounterRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for ultra-smooth rendering calculations
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lerpedPosRef = useRef({ x: 0, y: 0 });
  const lastSpawnPosRef = useRef({ x: 0, y: 0 });
  const isMouseMovingRef = useRef(false);
  const idleTimeoutRef = useRef<any>(null);

  // Smooth mouse move handler - captures raw mouse coordinates
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
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
  };

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
      // 1. Calculate lerped cursor coordinates (0.15 easing coefficient for gorgeous organic lag)
      const prevX = lerpedPosRef.current.x;
      const prevY = lerpedPosRef.current.y;

      lerpedPosRef.current.x += (mousePosRef.current.x - lerpedPosRef.current.x) * 0.15;
      lerpedPosRef.current.y += (mousePosRef.current.y - lerpedPosRef.current.y) * 0.15;

      const mvx = lerpedPosRef.current.x - prevX;
      const mvy = lerpedPosRef.current.y - prevY;

      // 2. Spawning calculation: compute distance traveled by the smooth lerped coordinate
      const dx = lerpedPosRef.current.x - lastSpawnPosRef.current.x;
      const dy = lerpedPosRef.current.y - lastSpawnPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update positions, velocity, gravity, and opacity of all cards in state inside tick()
      setCards((prev) => {
        const now = Date.now();
        const lifespan = 4000; // Match 4s animation

        // Spawn check might append a card (increased threshold to 65px for elegant spacing / reduced thickness)
        let newCardToAppend: PolaroidCardData | null = null;
        if (isMouseMovingRef.current && distance > 65) {
          const randomRotation = Math.floor(Math.random() * 24) - 12; // Balanced rotation -12deg to 12deg
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
          if (age > 1200) {
            opacity = Math.max(0, 1 - (age - 1200) / (lifespan - 1200));
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
        const alive = updated.filter((card) => (now - card.createdAt < lifespan) && card.opacity > 0.01);

        if (newCardToAppend) {
          return [...alive, newCardToAppend];
        }
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

      {/* 1. Header (Consistent with Immersive UI guidelines) */}
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

      {/* 3. Trail canvas where interactive elements are spawned */}
      <div className="trailCanvas" id="trail-canvas">
        {cards.map((card) => (
          <div
            key={card.id}
            id={card.id}
            className="trailImageCard"
            style={{
              zIndex: card.zIndex,
              opacity: card.opacity,
              // Inject custom CSS variables to calculate high performance hardware-accelerated transforms
              ["--x" as any]: `${card.x}px`,
              ["--y" as any]: `${card.y}px`,
              ["--rot" as any]: `${card.rotation}deg`,
              ["--rot-start" as any]: `${card.rotationStart}deg`,
              ["--rot-end" as any]: `${card.rotationEnd}deg`,
              ["--opacity" as any]: card.opacity,
            }}
          >
            {/* Sharp lens mask clipping the image spotlight */}
            <div className="trailImageMask" id={`mask-${card.id}`}>
              <img 
                src={card.imageUrl} 
                alt={card.label} 
                className="trailImage"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
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
          <div className="pScrollLabel">Cursor Trail</div>
          <div className="pScrollIndicator" />
        </div>
      </footer>
    </div>
  );
}
