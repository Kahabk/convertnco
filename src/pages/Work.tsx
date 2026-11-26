import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { Helmet } from "react-helmet-async";
import { LiquidGlassFilter } from "./work-showcase/GlassFrame";
import Hero from "./work-showcase/Hero";
import styles from "./work-showcase/WorkShowcase.module.css";

const ShowcaseSection = lazy(() => import("./work-showcase/ShowcaseSection"));
const SelectedWorkSection = lazy(() => import("./work-showcase/SelectedWorkSection"));

function DeferredWorkSection({ children }: { children: ReactNode }) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(boundary);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boundaryRef} style={{ minHeight: "80vh" }}>
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

type WorkExperienceProps = {
  embedded?: boolean;
  sections?: "all" | "hero" | "gallery";
};

export function WorkExperience({
  embedded = false,
  sections = "all",
}: WorkExperienceProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mobileQuery.matches);

    updateViewport();
    mobileQuery.addEventListener("change", updateViewport);
    return () => mobileQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (sections === "hero") return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)",
      ).matches
    ) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    let animationFrame = 0;

    const updateScroll = (time: number) => {
      lenis.raf(time);
      animationFrame = window.requestAnimationFrame(updateScroll);
    };

    animationFrame = window.requestAnimationFrame(updateScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, [sections]);

  const showShowcaseHero = sections !== "gallery" && (!embedded || !isMobileViewport);
  const showGallery = sections !== "hero";

  if (sections === "hero" && !showShowcaseHero) return null;

  return (
    <div
      className={`${styles.page} ${embedded ? styles.embeddedPage : ""} ${sections === "hero" ? styles.heroOnlyPage : ""}`}
    >
      {showShowcaseHero && <LiquidGlassFilter />}
      {showShowcaseHero && <Hero headingLevel={embedded ? "h2" : "h1"} />}
      {showGallery && (
        <>
          <DeferredWorkSection>
            <ShowcaseSection />
          </DeferredWorkSection>
          <DeferredWorkSection>
            <SelectedWorkSection />
          </DeferredWorkSection>
        </>
      )}
    </div>
  );
}

export function WorkCatalogue() {
  return (
    <>
      <Helmet>
        <title>Selected Shopify Work | Convert &amp; Co</title>
        <meta
          name="description"
          content="Selected Shopify storefront design and development work by Convert & Co."
        />
        <link rel="canonical" href="https://www.convertandco.com/work" />
      </Helmet>
      <main>
        <WorkExperience />
      </main>
    </>
  );
}
