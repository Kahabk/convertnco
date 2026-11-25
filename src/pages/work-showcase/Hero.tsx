import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import GlassFrame from "./GlassFrame";
import styles from "./WorkShowcase.module.css";

const showcaseImage = new URL(
  "../../../screencapture-chikenfy-myshopify-2026-11-19-21_36_39.webp",
  import.meta.url,
).href;
const shrubsImage = new URL("../../../3deffeact.webp", import.meta.url).href;
const heroBackgroundImage = new URL(
  "../../../Mossy Hills Beneath a Mauve Twilight.webp",
  import.meta.url,
).href;

type HeroProps = {
  headingLevel?: "h1" | "h2";
};

export default function Hero({ headingLevel = "h1" }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const Heading = headingLevel;
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const shrubY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : -40],
  );
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : -20],
  );

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby="work-showcase-title">
      <motion.img
        className={styles.heroBackground}
        src={heroBackgroundImage}
        alt=""
        aria-hidden="true"
        width="1672"
        height="941"
        decoding="async"
        style={{ y: backgroundY }}
      />
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Independent Shopify design studio</p>
        <Heading id="work-showcase-title">Shopify stores built to convert, not just launch.</Heading>
        <p className={styles.heroDescription}>
          We design and build high-performance storefronts for ambitious brands.<br />
          Clearer journeys, stronger stories, and fewer reasons to leave.
        </p>
        <a className={styles.auditButton} href="/cro-audit">Get A Free Store Audit</a>
      </div>

      <div className={styles.heroFrameWrap}>
        <GlassFrame className={styles.browserFrame}>
          <div className={styles.browserViewport}>
            <img
              src={showcaseImage}
              alt="Shopify storefront designed by Convert and Co"
              width="1669"
              height="4583"
              loading="lazy"
              decoding="async"
            />
          </div>
        </GlassFrame>
      </div>

      <motion.img
        className={styles.shrubs}
        src={shrubsImage}
        alt=""
        aria-hidden="true"
        width="1672"
        height="941"
        loading="lazy"
        decoding="async"
        style={{ x: "-50%", y: shrubY }}
      />
    </section>
  );
}
