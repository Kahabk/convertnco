import { useEffect } from "react";
import Lenis from "lenis";
import { Helmet } from "react-helmet-async";
import { LiquidGlassFilter } from "./work-showcase/GlassFrame";
import Hero from "./work-showcase/Hero";
import SelectedWorkSection from "./work-showcase/SelectedWorkSection";
import ShowcaseSection from "./work-showcase/ShowcaseSection";
import styles from "./work-showcase/WorkShowcase.module.css";

export function WorkCatalogue() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
  }, []);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Selected Shopify Work | Convert &amp; Co</title>
        <meta
          name="description"
          content="Selected Shopify storefront design and development work by Convert & Co."
        />
        <link rel="canonical" href="https://www.convertandco.com/work" />
      </Helmet>
      <LiquidGlassFilter />
      <main>
        <Hero />
        <ShowcaseSection />
        <SelectedWorkSection />
      </main>
    </div>
  );
}
