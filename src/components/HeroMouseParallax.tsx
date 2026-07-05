import { MouseEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Compass, Eye, Sparkles, MoveRight } from "lucide-react";
import "./HeroMouseParallax.css";

/* =========================================================================
   CUSTOMIZABLE VALUES GUIDE:
   Feel free to modify the values inside this file to customize the page.
   
   - Heading text: Located inside the return JSX of the component (line ~180)
   - Images list: Edit the IMAGE_CARDS_DATA array below (line ~28)
   - Animation constants (speeds & multipliers): Edit CONFIG object (line ~55)
   ========================================================================= */

// 1. IMAGE COLLAGE DATA
// Replace these high-resolution Unsplash URLs with your own project assets.
// We select abstract, minimalist, and brutalist visuals that match the premium studio aesthetic.
const IMAGE_CARDS_DATA = [
  {
    id: "card-deep",
    title: "Silent Monolith",
    category: "Brutalist Architecture",
    // Deepest card, sits in the background
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    className: "layerDeep",
  },
  {
    id: "card-mid",
    title: "Liquid Chrome",
    category: "3D Art Direction",
    // Center card, medium depth (anchor card)
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    className: "layerMid",
  },
  {
    id: "card-front",
    title: "Organic Curves",
    category: "Editorial Design",
    // Front card, hovering closer to the viewport
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    className: "layerFront",
  },
  {
    id: "card-fore",
    title: "Linear Geometry",
    category: "Creative Coding",
    // Extreme foreground card, floats with maximum parallax sensitivity
    imageUrl: "https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=800&q=80",
    className: "layerForeground",
  },
];

// 2. ANIMATION CONFIGURATION
// Easily tune responsiveness and movement multipliers here.
const CONFIG = {
  // Smoothness / Easing factor (lower is smoother/laggy, higher is snappier)
  // Recommended range: 0.06 (super cinematic) to 0.15 (more reactive)
  LERP_FACTOR: 0.08,

  // Maximum rotation angle in degrees for the 3D tilt effect on the image stack
  MAX_ROTATE_ANGLE: 12,

  // Translation Intensities (Maximum travel distance in pixels)
  BACKGROUND_GRID_INTENSITY: 25, // How much the back grid moves (opposite direction)
  BACKGROUND_GLOW_INTENSITY: 60, // How much the colored glow background moves
  HEADING_TEXT_INTENSITY: 15,    // How much the heading text moves (subtle parallax)
  
  // Per-layer movement intensities (Multipliers of normalized coordinate)
  DEEP_LAYER_INTENSITY: -45,     // Moves opposite to mouse for background deep depth
  MID_LAYER_INTENSITY: 20,       // Anchor card movement
  FRONT_LAYER_INTENSITY: 55,     // Moves in direction of mouse (fast)
  FOREGROUND_LAYER_INTENSITY: 90, // Extreme parallax (very fast)
};

export default function HeroMouseParallax() {
  // DOM element references for high-performance direct manipulation inside requestAnimationFrame loop
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);

  // References to the individual layers
  const deepCardRef = useRef<HTMLDivElement | null>(null);
  const midCardRef = useRef<HTMLDivElement | null>(null);
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const foreCardRef = useRef<HTMLDivElement | null>(null);

  // State to track whether user is currently hovering over any card for custom UI effects
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  // Track viewport scale state for responsive adjustments
  const [isMobile, setIsMobile] = useState(false);

  // Keep track of mouse positions with mutable refs to prevent React state re-render lags
  const mouseRef = useRef({
    targetX: 0, // Target normalized coordinates (-0.5 to 0.5)
    targetY: 0,
    currentX: 0, // Lerped current coordinates
    currentY: 0,
  });

  // Check mobile screen size on mount and window resize
  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  useEffect(() => {
    // Animation loop using requestAnimationFrame
    let animationFrameId: number;

    const updateParallax = () => {
      const mouse = mouseRef.current;

      // 1. Interpolation (Lerp) Formula: Current += (Target - Current) * Speed
      mouse.currentX += (mouse.targetX - mouse.currentX) * CONFIG.LERP_FACTOR;
      mouse.currentY += (mouse.targetY - mouse.currentY) * CONFIG.LERP_FACTOR;

      // 2. Calculate dynamic intensity modifier based on screen size (subtle on mobile)
      const intensity = isMobile ? 0.25 : 1.0;

      // 3. Apply Background Grid Transform (moves in opposite direction)
      if (gridRef.current) {
        const gridX = -mouse.currentX * CONFIG.BACKGROUND_GRID_INTENSITY * intensity;
        const gridY = -mouse.currentY * CONFIG.BACKGROUND_GRID_INTENSITY * intensity;
        gridRef.current.style.transform = `translate3d(${gridX}px, ${gridY}px, 0)`;
      }

      // 4. Apply Background Glowing Aura Transform
      if (glowRef.current) {
        const glowX = mouse.currentX * CONFIG.BACKGROUND_GLOW_INTENSITY * intensity;
        const glowY = mouse.currentY * CONFIG.BACKGROUND_GLOW_INTENSITY * intensity;
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
      }

      // 5. Apply Heading Parallax Translation
      if (textRef.current) {
        const textX = mouse.currentX * CONFIG.HEADING_TEXT_INTENSITY * intensity;
        const textY = mouse.currentY * CONFIG.HEADING_TEXT_INTENSITY * intensity;
        textRef.current.style.transform = `translate3d(${textX}px, ${textY}px, 0)`;
      }

      // 6. Apply 3D Rotation Tilt to the Main Image Collage Stack
      if (stackRef.current) {
        const stackRotateX = -mouse.currentY * CONFIG.MAX_ROTATE_ANGLE * intensity;
        const stackRotateY = mouse.currentX * CONFIG.MAX_ROTATE_ANGLE * intensity;
        stackRef.current.style.transform = `rotateX(${stackRotateX}deg) rotateY(${stackRotateY}deg)`;
      }

      // 7. Apply Individual Parallax Translations to Card Layers
      // Deep Card Layer (Z-depth -50px, subtle base angle)
      if (deepCardRef.current) {
        const deepX = mouse.currentX * CONFIG.DEEP_LAYER_INTENSITY * intensity;
        const deepY = mouse.currentY * CONFIG.DEEP_LAYER_INTENSITY * intensity;
        const deepRotate = -mouse.currentX * 6 * intensity;
        deepCardRef.current.style.transform = `translate3d(${deepX}px, ${deepY}px, -50px) rotateZ(${-5 + deepRotate}deg)`;
      }

      // Mid Card Layer (Z-depth 0px, base angle)
      if (midCardRef.current) {
        const midX = mouse.currentX * CONFIG.MID_LAYER_INTENSITY * intensity;
        const midY = mouse.currentY * CONFIG.MID_LAYER_INTENSITY * intensity;
        const midRotate = mouse.currentY * 4 * intensity;
        midCardRef.current.style.transform = `translate3d(${midX}px, ${midY}px, 0px) rotateZ(${2 + midRotate}deg)`;
      }

      // Front Card Layer (Z-depth 50px, positive base angle)
      if (frontCardRef.current) {
        const frontX = mouse.currentX * CONFIG.FRONT_LAYER_INTENSITY * intensity;
        const frontY = mouse.currentY * CONFIG.FRONT_LAYER_INTENSITY * intensity;
        const frontRotate = mouse.currentX * 8 * intensity;
        frontCardRef.current.style.transform = `translate3d(${frontX}px, ${frontY}px, 50px) rotateZ(${8 + frontRotate}deg)`;
      }

      // Foreground Card Layer (Z-depth 100px, extreme front, negative base angle)
      if (foreCardRef.current) {
        const foreX = mouse.currentX * CONFIG.FOREGROUND_LAYER_INTENSITY * intensity;
        const foreY = mouse.currentY * CONFIG.FOREGROUND_LAYER_INTENSITY * intensity;
        const foreRotate = -mouse.currentY * 10 * intensity;
        foreCardRef.current.style.transform = `translate3d(${foreX}px, ${foreY}px, 100px) rotateZ(${-12 + foreRotate}deg)`;
      }

      // Recurse animation loop
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    // Begin looping
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobile]);

  // Handler to track raw mouse position and normalize to -0.5 to 0.5 range
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert cursor position into normalized values from -0.5 to 0.5
    // Left edge is -0.5, right edge is 0.5, top edge is -0.5, bottom edge is 0.5
    mouseRef.current.targetX = (x / rect.width) - 0.5;
    mouseRef.current.targetY = (y / rect.height) - 0.5;
  };

  // Handler to smoothly reset layout to central position on mouse exit
  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  // Maps card IDs to their respective React refs
  const getCardRef = (className: string) => {
    switch (className) {
      case "layerDeep": return deepCardRef;
      case "layerMid": return midCardRef;
      case "layerFront": return frontCardRef;
      case "layerForeground": return foreCardRef;
      default: return null;
    }
  };

  return (
    <div 
      id="hero-parallax-section"
      className="heroContainer"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Graphic Grid */}
      <div className="bgGrid" ref={gridRef} id="bg-grid" />

      {/* Cinematic Color Light Blur (Follows mouse slowly for ambient lighting) */}
      <div className="radialGlow" ref={glowRef} id="bg-glow" style={{ top: "25%", right: "15%" }} />
      <div className="radialGlowSecondary" style={{ bottom: "20%", left: "10%" }} />

      {/* Subtle Vignette overlay to anchor attention */}
      <div className="vignette" />
      <div className="noiseOverlay" />

      {/* 3. Site Header (Branding Menu) */}
      <header className="siteHeader" id="site-header">
        <div className="logo" id="logo">
          <span>AURA.</span>
        </div>
        <div className="headerContact" id="header-contact">
          <span className="headerLink">work</span>
          <span className="headerLink">agency</span>
          <span className="headerLink">labs</span>
          <button className="contactBtn" id="btn-contact-header">
            <div className="contactBtnLine" />
          </button>
        </div>
      </header>

      {/* 4. Main Hero Section */}
      <main className="heroContent" id="hero-content">
        {/* Left Side: Modern Premium Typography */}
        <div className="heroTextSection" ref={textRef} id="hero-text-section">
          {/* Subtle Creative Badge */}
          <div className="subtitleBadge" id="sub-badge">
            <div className="pulseDot" />
            <span>CREATIVE AGENCY • LONDON</span>
          </div>

          {/* Huge Swiss/Modern Display Heading */}
          <h1 className="studioHeading" id="studio-heading">
            global<br />
            creative<br />
            <span className="text-white/30 block" id="studio-suffix">studio.</span>
          </h1>

          {/* Description Block */}
          <p className="studioDescription" id="studio-desc">
            Defining digital landscapes through cinematic design & immersive interaction.
          </p>

          {/* Call to Action Button */}
          <button className="primaryBtn" id="btn-cta-explore">
            <span>Explore Artifacts</span>
            <ArrowUpRight className="arrowIcon" size={14} />
          </button>
        </div>

        {/* Right Side: Floating Interactive Parallax Collage */}
        <div className="collageArea" id="collage-area">
          <div className="parallaxStack" ref={stackRef} id="parallax-stack">
            {IMAGE_CARDS_DATA.map((card) => {
              const cardRef = getCardRef(card.className);
              return (
                <div
                  key={card.id}
                  ref={cardRef}
                  className={`imageLayer ${card.className}`}
                  id={`layer-${card.id}`}
                >
                  <div 
                    className="imageCard w-full h-full"
                    id={`card-${card.id}`}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <img 
                      src={card.imageUrl} 
                      alt={card.title} 
                      className="cardImage"
                      referrerPolicy="no-referrer"
                      id={`img-${card.id}`}
                    />
                    
                    {/* Caption displaying project info on card base */}
                    <div className="cardCaption" id={`caption-${card.id}`}>
                      <span className="captionCategory">{card.category}</span>
                      <span className="captionTitle">{card.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 5. Minimalist Footer */}
      <footer className="siteFooter" id="site-footer">
        <div className="footerLeft" id="footer-left">
          <div className="footerCol">
            <div className="footerColLabel">Social</div>
            <div className="footerColLinks">
              <span className="headerLink">Instagram</span>
              <span className="headerLink">Behance</span>
            </div>
          </div>
          <div className="footerCol">
            <div className="footerColLabel">Location</div>
            <div className="footerColText">London / Berlin</div>
          </div>
        </div>
        <div className="footerRight" id="footer-right">
          <div className="scrollLabel">Scroll to Explore</div>
          <div className="scrollIndicator" />
        </div>
      </footer>
    </div>
  );
}
